import Taro from '@tarojs/taro'
import { getUrl, execGetChild, execGetObject, getMedia } from './util'
import { config } from './config'

const { result: resultConfig, upload: uploadConfig, request: requestConfig } = config

/**
 * 图片及视频上传方法
 * @param {number} count 需要上传的最大数量
 * @param {string} mediaType 选择的类型 image 图片 video视频
 * @return {promise} {
 *  start: function 开始上传通知
 *  progress: function 上传进度通知 会多次回调
 *  abort: function 取消上传
 *  then: function 上传成功
 *  catch: function 上传错误
 * }
 */
const upload = (count, mediaType = 'image') => {
  const uploadPromise = getMedia(count, mediaType).then(res => {
    for (let i = 0; i < res.length; i++) {
      allSize.push([res[i].size, 0])
      let uploadFileRes = Taro.uploadFile({
        url: getUrl(uploadConfig.api),
        filePath: res[i].path,
        name: uploadConfig.requestField,
        header: execGetObject(requestConfig.header),
      })
      uploadFileRes.progress(e => {
        progress(i, e.totalBytesSent)
      })
      allUpload.push(uploadFileRes.then(response => {
        try {
          response.data = JSON.parse(response.data)
          const code = execGetChild(resultConfig.code, response)
          const message = execGetChild(resultConfig.message, response)
          if (code == resultConfig.succesCode) {
            return execGetChild(uploadConfig.resultField, response)
          } else {
            throw { code, message }
          }
        } catch (error) {
          throw { message: '数据格式错误', code: resultConfig.errorCode }
        }
      }))
    }
    if (allUpload.length === 0) {
      throw { message: '未选择图片', code: resultConfig.errorCode }
    }
    startFunc && startFunc()
    return Promise.all(allUpload)
  })
  // 进度通知
  const progress = (i, size) => {
    allSize[i][1] = size
    let allProgress = 0
    allSize.map(item => {
      allProgress += item[1] / item[0]
    })
    if (allProgress - allProgressOld > 0.1) {
      progressFunc && progressFunc(allProgress / allSize.length)
      allProgressOld = allProgress
    }
  }
  const allUpload = []
  const allSize = []
  let startFunc
  let progressFunc
  let allProgressOld = 0
  // 开始通知
  uploadPromise.start = func => {
    startFunc = func
    return uploadPromise
  }
  // 进度通知
  uploadPromise.progress = func => {
    progressFunc = func
    return uploadPromise
  }
  // 取消上传
  uploadPromise.abort = () => {
    for (let i = 0; i < allUpload.length; i++) {
      allUpload[i].abort()
    }
    return uploadPromise
  }
  return uploadPromise
}

export {
  upload
}
