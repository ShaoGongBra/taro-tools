import Taro from '@tarojs/taro'
import { asyncTimeOut } from './util'

/**
 * 获取当前顶层页面的页面路由地址
 * @returns
 */
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

/**
 * 异步 获取当前顶层页面的页面路由地址
 * Taro3页面跳转后不会立即获得当前页面的路由地址 如果你需要在页面跳转后获得地址，建议用此异步函数获取
 * @returns
 */
const currentPageAsync = async () => {
  await asyncTimeOut(20)
  return currentPage()
}

export {
  currentPage,
  currentPageAsync
}
