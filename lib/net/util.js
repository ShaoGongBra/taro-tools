import Taro from '@tarojs/taro'
import qs from 'qs'
import { getRequestConfig } from './config'
import { recursionGetValue } from '../object'

/**
 * 获取请求url
 * @param {string} url api
 * @param {object} data 要加在url上的get参数
 * @param {object} params 请求参数
 * @return {string} 完整请求url
 */
const getUrl = (url, data = {}, params = {}) => {
  const { request } = getRequestConfig(params.config)

  if (url.indexOf('http://') === -1 && url.indexOf('https://') === -1) {
    let urls = []
    if (process.env.NODE_ENV === 'production' && process.env.TARO_ENV === 'h5' && !!window.REQUEST_ORIGIN) {
      // 使用本地域名
      urls.push(window.REQUEST_ORIGIN)
    } else {
      // 使用配置域名
      urls.push(request.origin)
    }

    request.path && urls.push(request.path)
    urls.push(url)
    url = urls.join('/')
  }
  // 拼接url参数
  const getParams = qs.stringify(data)
  if (getParams) {
    url += url.indexOf('?') === -1 ? '?' : '&'
    url += getParams
  }
  return url
}

/**
 * 获取对象 如果这是个函数，获取函数的返回值
 * @param {*} data
 * @returns
 */
const execGetObject = (obj, ...params) => typeof obj === 'function' ? obj(...params) : obj

/**
 * 获取结果
 * @param {*} index
 * @param {*} res
 * @returns
 */
const execGetChild = (index, res, ...params) => typeof index === 'function' ? index(res, ...params) : recursionGetValue(index, res)

/**
 * 选择文件
 * @param {number} count
 * @param {string} mediaType
 */
const getMedia = (count = 1, mediaType) => {
  if (mediaType === 'video') {
    return Taro.chooseVideo({}).then(res => ([{
      path: res.tempFilePath,
      size: res.size,
      width: res.width,
      height: res.height,
      thumb: res.thumbTempFilePath
    }]))
  } else {
    return Taro.chooseImage({
      count
    }).then(res => res.tempFiles)
  }
}

export {
  getUrl,
  execGetObject,
  execGetChild,
  getMedia
}
