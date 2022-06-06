interface RequestConfig {
  /**
   * 请求配置
   * 请求支持json及form格式
   */
  request: {
    // 请求域名及端口号 请勿以/结尾
    origin: string,
    // 公共请求路径
    path: string,
    /**
     * Content-Type 请求媒体类型 有效值如下
     * 设置这个值将用户post请求的时候设置请求body类型
     * application/json
     * application/x-www-form-urlencoded
     */
    contentType: string,
    /**
     * 公共请求header
     * 可以传入函数或者对象 函数需要返回一个对象
     */
    header: object | Function,
    /**
     * 要携带在请求上的参数
     * 根据method请求类型 参数自动设置在GET或者POST
     * 可以传入函数或者对象 函数需要返回一个对象
     */
    data: object | Function,
    /**
     * 要携带在请求url上的参数
     * 即使使用POST请求时 也在GET参数上
     * 可以传入函数或者对象 函数需要返回一个对象
     */
    getData: object | Function
  },
  /**
   * 返回结果配置
   * 返回结果仅支持JSON格式数据
   */
  result: {
    /**
     * 成功的code
     * code对不上，请求将会走catch方法
     */
    succesCode: number,
    /**
     * 请求失败的标准code
     * 这个code将用于内部使用
     */
    errorCode: number,
    /**
     * 返回值获取code字段
     * 多级请用数组表示
     * 可以传入函数处理数据
     */
    code: string | string[] | Function,
    /**
     * 返回值获取提示信息的字段
     * 多级请用数组表示
     * 可以传入函数处理数据
     */
    message: string | string[] | Function,
    /**
     * 要返回到请求结果的字段
     * 当code对比成功时返回此值
     * 多级请用数组表示
     * 可以传入函数处理数据
     */
    data: string | string[] | Function,
  },
  /**
   * 上传配置
   * 上传的请求头将强制设置为 文件流
   */
  upload: {
    // 上传api api后可以携带参数
    api: string,
    // 上传文件时的字段名，因小程序限制，单次上传仅能上传一个文件所以只能设置一个名称
    requestField: string | string[] | Function,
    // 返回值的图片路径的url 如果有多级可以配置数组 如[0, url] 或者函数
    resultField: string | string[] | Function,
  }
}

/**
 * 设置请求配置 设置后 从taro-tools导出的request函数将按照此配置请求
 * @param data 要设置的配置
 */
export function setRequestConfig(option: RequestConfig): RequestConfig

/**
 * 合并并返回一个请求配置，不会改变原配置
 * @param data 要设置的配置
 */
export function getRequestConfig(option: RequestConfig): RequestConfig

declare namespace request {
  interface method {
    /** GET请求 */
    GET
    /** POST请求 */
    POST
  }

  interface RequestOption {
    /** 请求链接 相对地址 */
    url: string
    /** 附加header */
    header?: object
    /** 请求数据 根据method会加在对应位置 */
    data?: object
    /** 请求类型 */
    method?: keyof method
    /** 请求超时时间（ms） 默认30000 */
    tomeout?: number
    /**
     * 防止重复请求的时间间隔，在这个事件内如果发生相同参数的请求将被拦截触发catch
     * catch将返回，下面的数据，如果你不想使用，可以把这个值设置为0
     * ```javascript
     * { code: 3, message: '重复请求' }
     * ```
     * @default 500
     */
    repeatTime?: number
    /**
     * 是否在请求过程中显示loading
     * 传入一个字符串，将在请求的时候显示这个字符串
     * 传入一个loading函数，将会执行这个函数，并且要求这个函数返回这个停止loading的函数
     */
    loading?: boolean | string | (() => () => void)
    /**
     * 是否在请求至catch的时候toast一个错误提示
     */
    toast?: boolean
    /** 请求配置 用于覆盖默认配置 */
    config?: RequestConfig,
    /** 中间件 用于覆盖默认配置的中间件 */
    middle?: {
      request?: () => void[]
      result?: () => void[]
      error?: () => void[]
    }
  }
}

interface RequestTask extends Promise<RequestTask> {
  /** 取消请求 */
  abort(): void
}

interface ThrottleRequestTask extends Promise<ThrottleRequestTask> {

}

/**
 * 发起请求函数
 * @param option 填写一个url或者一个请求配置
 * @example
 * ```javascript
 * request('index/index/list').then(res => {
 *  console.log(res)
 * })
 * request({
 *  url: 'index/index/list'
 * }).then(res => {
 *  console.log(res)
 * })
 * ```
 */
export function request(option: string | request.RequestOption): RequestTask

/**
 * 发起一个节流请求函数
 * @param option 请求参数同 request
 * @param mark 当前标识 当你的url和data均相同时，可以添加一个mark区分他们
 * @example
 * ```javascript
 * throttleRequest({
 *  url: 'api/test'
 * }).then(res => {
 *  // then里面的数据是经过节流处理的
 * }).catch(err => {
 *  // err.code === 1 // 过快请求
 *  // err.code === 2 // 请求被覆盖
 * })
 * ```
 */
export function throttleRequest(option: request.RequestOption, mark?: string): ThrottleRequestTask

export namespace requestMiddle {
  /**
   * 请求参数中间件 在发起请求之前将处理过的请求参数传入
   * @param callback
   */
  function request(callback: (requestParams: {
    url: string,
    data: object | string,
    header: object,
    method: keyof request.method,
    timeout: number
  }, params: request.RequestOption) => object | Promise<object>): void
  function result(callback: (result: object, params: request.RequestOption) => object | Promise<object>): void
  function error(callback: (error: {
    code: number,
    message: string
  } | object, params: request.RequestOption) => object | Promise<object>): void
}


declare namespace upload {

  /** 上传参数 */
  interface Option {
    /**
     * 最大数量
     * 仅在类型为image时有效
     * @default 1
     */
    count?: number
    /** 用户替换默认设置的api */
    api?: string
    /** 用户替换默认的上传字段 */
    requestField?: string | string[] | Function
    /** 用户替换默认的返回值字段 */
    resultField?: string | string[] | Function
    /** 选择图片的来源 */
    sourceType?: Array<keyof sourceType>
    /** 图片压缩类型 */
    sizeType?: Array<keyof sizeType>
    /** 视频压缩 */
    compressed?: boolean
    /** 拍摄时的最大时长 单位秒 */
    maxDuration?: number
    /** 默认拉起的是前置或者后置摄像头。部分 Android 手机下由于系统 ROM 不支持无法生效 */
    camera?: keyof camera
  }

  /**
   * 上传类型
   */
  interface Type {
    /** 图片 */
    'image',
    /** 视频 */
    'video'
  }


  /**
   * 来源
   */
  interface sourceType {
    /** 从相册选图 */
    album
    /** 使用相机 */
    camera
    /** 使用前置摄像头(仅H5纯浏览器使用) */
    user
    /** 使用后置摄像头(仅H5纯浏览器) */
    environment
  }

  /**
   * 图片压缩
   */
  interface sizeType {
    /** 原图 */
    original
    /** 压缩图 */
    compressed
  }

  /**
   * 摄像头
   */
  interface camera {
    /** 默认拉起后置摄像头 */
    back
    /** 默认拉起前置摄像头 */
    front

  }
}

declare namespace uploadTask {
  /** 上传进度回调数据 */
  interface ProgressOption {
    /** 上传进度百分比 */
    progress: number
    /** 预期需要上传的数据总长度，单位 Bytes */
    totalBytesExpectedToSend: number
    /** 已经上传的数据长度，单位 Bytes */
    totalBytesSent: number
  }
}

interface UploadTask extends Promise<UploadTask> {
  /** 取消请求 */
  abort(): void
  /**
   * 监听上传进度
   * @param callback 回调函数
   */
  progress(callback: (res: uploadTask.ProgressOption) => void): UploadTask
  /**
   * 选择完成后 开始上传通知
   * @param callback
   */
  start(callback: Function): UploadTask
}

/**
 * 图片及视频上传方法，包含从选择到上传两个过程
 * @param type 类型 支持图片或者视频
 * @param option 选项
 * @example
 * ```javascript
 * upload('image', { count: 1, sourceType: ['album', 'camera'] })
 * upload('video', { sourceType: ['album', 'camera'] })
 * ```
 */
export function upload(type: keyof upload.Type, option: upload.Option): UploadTask
