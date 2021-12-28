import Taro from '@tarojs/taro'
import { asyncTimeOut } from './util'

const currentPage = () => {
  let path
  if (process.env.TARO_ENV === 'h5') {
    const len = window.location.hash.indexOf('?')
    const maxlen = window.location.hash.length
    path = window.location.hash.substr(1, len === -1 ? maxlen : len)
  } else {
    const pages = Taro.getCurrentPages()
    const current = pages[pages.length - 1]
    path = current.path || current.route
  }
  if (path.startsWith('/')) {
    path = path.substr(1)
  }
  return path
}

const currentPageAsync = async () => {
  await asyncTimeOut(20)
  return currentPage()
}

export {
  currentPage,
  currentPageAsync
}
