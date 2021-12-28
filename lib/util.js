import Taro from '@tarojs/taro'

let DeviceInfo
if (process.env.TARO_ENV === 'rn') {
  DeviceInfo = require('react-native').DeviceInfo
}

const toast = msg => {
  Taro.showToast({
    title: typeof msg === 'object' ? JSON.stringify(msg) : msg,
    icon: 'none'
  })
}

const setNavigationBarTitle = title => {
  if (process.env.TARO_ENV === 'h5') {
    title && Taro.setNavigationBarTitle({
      title
    })
  }
}

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

const noop = () => { }

export {
  toast,
  setNavigationBarTitle,
  isIphoneX,
  asyncTimeOut,
  noop
}
