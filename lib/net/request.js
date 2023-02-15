import Taro from '@tarojs/taro'
import qs from 'qs'
import { getUrl, execGetObject, execGetChild, execMiddle } from './util'
import { asyncTimeOut, toast } from '../util'
import { deepCopy } from '../object'

const bodyType = ['POST', 'PUT']

const requestReact = async ({ url, data, header, timeout, ...option } = {}) => {

  if (bodyType.includes(option.method)) {
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
  const contentType = res.headers.get('Content-Type').toLowerCase()
  const isJson = contentType.indexOf('application/json') === 0
  const headersValues = [...res.headers.values()]
  const result = {
    statusCode: res.status,
    errMsg: res.statusText,
    data: null,
    header: Object.fromEntries([...res.headers.keys()].map((key, index) => [key, headersValues[index]]))
  }
  if (isJson) {
    result.data = await res.json()
  } else {
    result.data = await res.text()
  }
  return result
}

const request = (() => {
  const requestKeys = {}
  return ({ request: requestConfig = {}, result: resultConfig = {}, ...params } = {}) => {

    const { contentType = 'application/json' } = requestConfig

    const urls = params.url.split('?')

    const configData = deepCopy(execGetObject(requestConfig.data, params))

    const method = params.method?.toUpperCase() || 'GET'

    const isBody = bodyType.includes(method)

    let requestParams = {
      url: getUrl(urls[0], void 0, params),
      method,
      contentType,
      query: {
        ...qs.parse(urls[1]),
        ...deepCopy(execGetObject(requestConfig.getData, params)),
        ...!isBody ? configData : {},
        ...!isBody ? deepCopy(params.data) : {}
      },
      body: isBody
        ? {
          ...configData,
          ...deepCopy(params.data)
        }
        : null,
      header: {
        ...execGetObject(requestConfig.header, params),
        'Content-Type': contentType,
        ...params.header
      }
    }

    const { timeout = 30000, repeatTime = 500, toast: toastError, loading } = params

    // 防止过快的重复请求
    if (repeatTime) {
      const requestKey = requestParams.url +
        '-' + qs.stringify({ ...requestParams.query, ...requestParams.body }) +
        '-' + requestParams.method
      const now = Date.now()
      const last = requestKeys[requestKey]
      if (!last || now - last > repeatTime) {
        requestKeys[requestKey] = now
      } else {
        return Promise.reject({ code: 3, message: '重复请求', requestKey })
      }
    }

    // 请求中间件
    const middle = params.middle || {}

    let loadingClose
    const requestTask = (new Promise(async (resolve, reject) => {
      if (middle.before?.length) {
        try {
          requestParams = await execMiddle(middle.before, requestParams, params)
        } catch (error) {
          reject(error)
        }
      }
      taroRequestTask = (['h5', 'rn'].includes(process.env.TARO_ENV) ? requestReact : Taro.request)({
        url: `${requestParams.url}${Object.keys(requestParams.query).length ? '?' + qs.stringify(requestParams.query) : ''}`,
        data: !requestParams.body
          ? null
          : contentType === 'application/json'
            ? JSON.stringify(requestParams.body)
            : qs.stringify(requestParams.body),
        header: requestParams.header,
        method: requestParams.method,
        timeout
      })
      if (!requestParams.url) {
        reject({ message: '请求URL错误', code: resultConfig.errorCode })
      }
      if (typeof loading === 'function') {
        loadingClose = loading()
      } else if (loading) {
        Taro.showLoading({
          title: typeof loading === 'string' ? loading : '加载中'
        })
      }
      if (middle.result?.length) {
        // 中间件处理返回数据
        try {
          let result = await taroRequestTask
          result = await execMiddle(middle.result, result, params)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      } else {
        // 配置处理返回数据
        taroRequestTask.then(async res => {
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
      }
    })).then(res => {
      loading && loadingClose?.() || Taro.hideLoading()
      return res
    }).catch(async err => {
      loading && loadingClose?.() || Taro.hideLoading()
      if (middle.error?.length) {
        try {
          return await execMiddle(middle.error, err, params)
        } catch (error) {
          throw error
        }
      }
      throw err
    }).catch(err => {
      toastError && toast(err.message || JSON.stringify(err))
      err.url = requestParams.url
      throw err
    })
    let taroRequestTask
    requestTask.abort = () => taroRequestTask?.abort()
    return requestTask
  }
})();

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

export const createRequest = (() => {
  const globalMiddle = {
    before: [],
    result: [],
    error: []
  }
  const remove = (arr, callback) => {
    return {
      remove: () => {
        const index = arr.indexOf(callback)
        ~index && arr.splice(index, 1)
      }
    }
  }
  return config => {
    const middle = {
      before: [],
      result: [],
      error: []
    }
    if (config?.middle) {
      Object.keys(config.middle).forEach(key => {
        middle[key].push(...config.middle[key])
      })
    }
    const on = (type, callback, common = false) => {
      const arr = (common ? globalMiddle : middle)
      arr[type].push(callback)
      return remove(arr, callback)
    }
    const getParams = params => {
      return {
        config: config?.config,
        middle: {
          before: [...globalMiddle.before, ...middle.before],
          result: [...globalMiddle.result, ...middle.result],
          error: [...globalMiddle.error, ...middle.error]
        },
        ...(typeof params === 'string' ? { url: params } : params)
      }
    }

    return {
      request: params => request(getParams(params)),
      throttleRequest: params => throttleRequest(getParams(params)),
      middle: {
        before: (callback, common) => {
          return on('before', callback, common)
        },
        result: (callback, common) => {
          return on('result', callback, common)
        },
        error: (callback, common) => {
          return on('error', callback, common)
        }
      }
    }
  }
})();
