import Taro from '@tarojs/taro'
import qs from 'qs'
import { config } from './config'
import { getUrl, execGetObject, execGetChild } from './util'

/**
 * 网络请求
 * @param {object} param0
 */
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

  const { url, header = {}, data = {}, method = 'GET' } = params

  const requestTask = new Promise((resolve, reject) => {
    taroRequestTask = Taro.request({
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
      timeout: 30000
    })
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
  /**
   * 取消请求
   */
  requestTask.abort = () => taroRequestTask && taroRequestTask.abort()
  return requestTask
}

export default request


const searchQuickMarks = {}
/**
 * 请求方式同
 * @param {*} params
 * @param {*} mark
 * @returns
 */
const searchQuick = (params, mark = '') => {
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
  searchQuick
}
