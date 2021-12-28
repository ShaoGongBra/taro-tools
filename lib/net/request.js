import Taro from '@tarojs/taro'
import qs from 'qs'
import { config } from './config'
import { getUrl, execGetObject, execGetChild } from './util'
import { asyncTimeOut } from '../util'

const requestReact = async ({ url, data, header, timeout, ...option } = {}) => {

  if (option.method === 'POST') {
    option.body = data
  }
  option.headers = header

  // 用户终止请求
  const controller = new AbortController()
  option.signal = controller.signal

  const race = [fetch(url, option), asyncTimeOut(timeout)]
  const res = await Promise.race(race)
  if (res.type === 'timeout') {
    // 终止请求
    controller.abort()
    throw { statusCode: 500, errMsg: '请求超时' }
  }
  // 清除定时器
  race[1].clear()
  const contentType = res.headers.get("Content-Type").toLowerCase()
  const isJson = contentType.indexOf('application/json') === 0
  const result = {
    statusCode: res.status,
    errMsg: res.statusText,
    data: null
  }
  if (isJson) {
    result.data = await res.json()
  } else {
    result.data = await res.text()
  }
  return result
}

const request = params => {

  // 合成配置
  const { request: requestConfig, result: resultConfig } = {
    ...config,
    ...params.config
  }

  // 处理请求方式
  params.method = params.method?.toUpperCase() || 'GET'

  // 请求数据
  params.data = { ...execGetObject(requestConfig.data, params), ...(params.data || {}) }

  // 请求地址
  params.url = getUrl(
    params.url,
    { ...execGetObject(requestConfig.getData, params), ...(params.method === 'GET' ? params.data || {} : {}), },
    params
  )

  const { url, header = {}, data = {}, method = 'GET', timeout = 30000 } = params

  const requestParams = {
    url,
    data: method === 'POST'
      ? (
        requestConfig.contentType.indexOf('application/json') !== -1
          ? JSON.stringify(data)
          : qs.stringify(data)
      )
      : {},
    header: {
      ...execGetObject(requestConfig.header, params),
      'Content-Type': requestConfig.contentType,
      ...header
    },
    method,
    timeout
  }

  const requestTask = new Promise((resolve, reject) => {
    taroRequestTask = ['h5', 'rn'].includes(process.env.TARO_ENV) ? requestReact(requestParams) : Taro.request(requestParams)
    if (!url) {
      reject({ message: '请求URL错误', code: resultConfig.errorCode })
    }
    taroRequestTask.then(res => {
      try {
        const code = execGetChild(resultConfig.code, res)
        const message = execGetChild(resultConfig.message, res)
        if (code == resultConfig.succesCode) {
          resolve(execGetChild(resultConfig.data, res))
        } else {
          reject({ code, message })
        }
      } catch (error) {
        reject({ message: '数据格式错误', code: resultConfig.errorCode })
      }
    }).catch(err => {
      const code = execGetChild(resultConfig.code, err)
      const message = execGetChild(resultConfig.message, err)
      reject({ message, code })
    })
  })
  let taroRequestTask
  requestTask.abort = () => taroRequestTask && taroRequestTask.abort()
  return requestTask
}

const searchQuickMarks = {}
const throttleRequest = (params, mark = '') => {
  const key = params.url + mark
  if (searchQuickMarks[key] === undefined) {
    searchQuickMarks[key] = {
      timer: null,
      prevReject: null,
      requestTask: null,
    }
  }
  const item = searchQuickMarks[key]
  return new Promise((resolve, reject) => {
    if (item.timer) {
      clearTimeout(item.timer)
      item.prevReject({ message: '过快请求', code: 1 })
    }
    if (item.requestTask) {
      item.requestTask.abort()
      item.requestTask = null
      item.prevReject({ message: '请求被覆盖', code: 2 })
    }
    item.prevReject = reject
    item.timer = setTimeout(() => {
      item.timer = null
      item.requestTask = request(params).then(res => {
        item.requestTask = null
        resolve(res)
      }).catch(err => {
        item.requestTask = null
        reject(err)
      })
    }, 200)
  })
}

export {
  request,
  throttleRequest
}
