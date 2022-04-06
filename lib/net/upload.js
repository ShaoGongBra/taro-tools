import Taro from '@tarojs/taro'
import { getUrl, execGetChild, execGetObject, getMedia } from './util'
import { config } from './config'

const { result: resultConfig, upload: uploadConfig, request: requestConfig } = config

const uploadFile = process.env.TARO_ENV === 'rn'
  ? (() => {
    const { Platform } = require('react-native')
    const isAndroid = Platform.OS === 'android';
    const createFormData = (filePath, body = {}, name) => {
      const data = new FormData();
      const uri = isAndroid ? filePath : filePath.replace('file://', '');
      const fileObj = { uri: uri, type: 'application/octet-stream', name: uri.substr(uri.lastIndexOf('/') + 1) || 'file' };
      Object.keys(body).forEach(key => {
        data.append(key, body[key]);
      });
      data.append(name, fileObj);
      return data;
    };

    return (opts) => {
      const { url, timeout = 60000, filePath, name, header, formData } = opts
      const xhr = new XMLHttpRequest()
      const execFetch = new Promise((resolve, reject) => {
        xhr.open('POST', url)
        xhr.responseType = 'text'
        // 上传进度
        xhr.upload.onprogress = e => {
          progressFunc && progressFunc({
            progress: e.lengthComputable ? e.loaded / e.total * 100 : 0,
            totalBytesSent: e.loaded,
            totalBytesExpectedToSend: e.total
          })
        }
        // 请求头
        const headers = {
          'Content-Type': 'multipart/form-data',
          ...header,
        }
        for (const key in headers) {
          if (headers.hasOwnProperty(key)) {
            xhr.setRequestHeader(key, headers[key])
          }
        }
        // 请求成功
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve({
              data: xhr.response,
              errMsg: 'ok',
              statusCode: 200
            })
          } else {
            reject({ errMsg: 'uploadFile fail: ' + xhr.responseText })
          }
        }
        // 请求失败
        xhr.onerror = e => {
          reject({ errMsg: 'uploadFile fail: ' + e.type })
        }
        xhr.send(createFormData(filePath, formData, name))

        setTimeout(() => {
          xhr.abort()
          reject({ errMsg: 'uploadFile fail: 请求超时' })
        }, timeout)
      })
      let progressFunc
      execFetch.progress = func => {
        progressFunc = func
        return execFetch
      }
      // 取消上传
      execFetch.abort = () => {
        xhr.abort()
        return execFetch
      }
      return execFetch
    }
  })()
  : Taro.uploadFile

const upload = (
  type = 'image',
  option
) => {
  const uploadPromise = getMedia(type, option).then(res => {
    for (let i = 0; i < res.length; i++) {
      allSize.push([res[i].size, 0])

      const params = {
        url: getUrl(uploadConfig.api),
        filePath: res[i].path,
        name: uploadConfig.requestField
      }

      params.header = execGetObject(requestConfig.header, params)

      const uploadFileRes = uploadFile(params).progress(e => {
        progress(i, e.totalBytesSent)
      })

      allUpload.push(uploadFileRes.then(response => {
        try {
          if (typeof response.data === 'string') {
            response.data = JSON.parse(response.data)
          }
          const code = execGetChild(resultConfig.code, response)
          const message = execGetChild(resultConfig.message, response)
          if (code == resultConfig.succesCode) {
            return execGetChild(uploadConfig.resultField, response)
          } else {
            throw { code, message }
          }
        } catch (error) {
          throw { message: '数据格式错误', code: resultConfig.errorCode, error, data: response.data }
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
