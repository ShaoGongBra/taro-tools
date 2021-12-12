interface method {
  /** GET请求 */
  'GET',
  /** POST请求 */
  'POST'
}

type RequestOption = {
  /** 请求链接 */
  url: string
  /** 附加header */
  header?: object
  /** 请求数据 根据method会加在对应位置 */
  data?: object
  /** 请求类型 */
  method?: keyof method
  /** 请求超时事件（ms） 默认30000 */
  tomeout: number
}

type RequestTask = Promise<{
  /** 请求成功执行回调 */
  then: (result: {
    code: number
    message: string
    result: object
  } & any) => void
  /** 请求失败执行 */
  catch: (result: {
    code: number
    message: string
  } & any) => void
}>

/**
 * 统一请求方法
 * @param {Option} option
 * @return Promise
 */
export const request = (option: RequestOption): RequestTask => {

}
