import Taro from '@tarojs/taro'

let DeviceInfo
if (process.env.TARO_ENV === 'rn') {
  DeviceInfo = require('react-native').DeviceInfo
}

/**
 * 显示一个轻提示
 * @param {string | object} msg 显示内容
 */
const toast = msg => {
  Taro.showToast({
    title: typeof msg === 'object' ? JSON.stringify(msg) : msg,
    icon: 'none'
  })
}

/**
 * 设置页面标题 主要用户h5端
 * @param {string} title
 */
const setNavigationBarTitle = title => {
  if (process.env.TARO_ENV === 'h5') {
    title && Taro.setNavigationBarTitle({
      title
    })
  }
}

/**
 * 判断是不是iphoneX
 */
const isIphoneX = () => {
  if (process.env.TARO_ENV === 'rn') {
    return DeviceInfo.isIPhoneX_deprecated
  } else {
    const phoneMarks = ['iPhone X', 'iPhone 11', 'iPhone 12', 'iPhone 13', 'iPhone 14']
    const { model = '' } = global.systemInfo
    for (let i = 0, l = phoneMarks.length; i < l; i++) {
      if ((model || '').startsWith(phoneMarks[i])) return true
    }
    return false
  }

}

/**
 * 执行定时时间后的异步任务
 * @param {number} time 毫秒
 */
const asyncTimeOut = time => {
  let resolveFunc
  let rejectFunc
  const pro = new Promise((resolve, reject) => {
    resolveFunc = resolve
    rejectFunc = reject
  })
  const timer = setTimeout(() => resolveFunc({ code: 200, message: '倒计时结束', type: 'timeout' }), time)
  pro.clear = () => {
    clearTimeout(timer)
    rejectFunc({ code: 500, message: '清除倒计时' })
  }
  return pro
}

/**
 * 一个空函数
 */
const noop = () => { }

export {
  toast,
  setNavigationBarTitle,
  isIphoneX,
  asyncTimeOut,
  noop
}
