declare namespace date {
  /** 时间间隔 */
  interface DateInterval {
    /** 年 */
    y
    /** 月 */
    m
    /** 日 */
    d
    /** 星期 */
    w
    /** 小时 */
    h
    /** 分钟 */
    n
    /** 秒 */
    s
  }

  interface EndTimeKeys {
    /** 天 */
    d: number
    /** 小时 */
    h: number
    /** 分钟 */
    m: number
    /** 秒 */
    s: number
    /** 毫秒 */
    ms: number
  }
}

/**
 * 日期对象转换为指定格式的字符串
 * @param formatStr 日期格式,格式定义如下 yyyy-MM-dd HH:mm:ss
 * @param date Date日期对象或者时间戳或者带毫秒的时间戳, 如果缺省，则为当前时间
 * YYYY/yyyy/YY/yy 表示年份
 * MM/M 月份
 * W/w 星期
 * dd/DD/d/D 日期
 * hh/HH/h/H 时间
 * mm/m 分钟
 * ss/SS/s/S 秒
 * @return string 指定格式的时间字符串
 */
export function dateToStr(formatStr: string, date: Date | string | number): string

/**
 * 将10位或者13位的时间戳转为时间对象
 * @param date Date日期对象或者时间戳或者带毫秒的时间戳, 如果缺省，则为当前时间
 * @return
 */
export function timeStampToDate(date: Date | string | number): Date

/**
 * 比较日期差 dtEnd 格式为日期型或者有效日期格式字符串
 * @param strInterval 可选值 y 年 m月 d日 w星期 ww周 h时 n分 s秒
 * @param dtStart 开始时间
 * @param dtEnd 结束时间
 */
export function dateDiff(strInterval: keyof date.DateInterval, dtStart: Date | number, dtEnd: Date | number): number

/**
 * 日期计算
 * @param strInterval 可选值 y 年 m月 d日 w星期 ww周 h时 n分 s秒
 * @param num 对应数值
 * @param date 日期对象 默认当前时间
 * @return 返回计算后的日期对象
 */
export function dateAdd(strInterval: keyof date.DateInterval, num: number, date: Date): Date

/**
 * 判断闰年
 * @param date Date日期对象或者时间字符串 默认当前时间
 * @return
 */
export function isLeapYear(date: Date | string): boolean

/**
 * 把指定格式的字符串转换为日期对象
 * @param formatStr 待转换的时间的时间格式 yyyy-MM-dd HH:mm:ss
 * @param dateStr 待转换的时间字符串
 * @return 转换后的日期对象
 */
export function strFormatToDate(formatStr: string, dateStr: string): Date

/**
 * 日期对象转换为毫秒数
 * @param date 日期对象
 */
export function dateToLong(date: Date): number

/**
 * 毫秒转换为日期对象
 * @param dateVal 日期的毫秒数
 * @return 转换后的日期对象
 */
export function longToDate(dateVal: number): Date

/**
 * 判断字符串是否为日期格式
 * @param str 字符串
 * @param formatStr 日期格式， 如下 yyyy-MM-dd
 * @return
 */
export function isDate(str: string, formatStr: string): boolean

/**
 * 返回月份的最大天数
 * @param year 年
 * @param month 月
 * @return 当前月的最大天数
 */
export function getMaxDay(year: number, month: number): number

/**
 * 取得当前日期所在月的最大天数
 * @param date 日期对象
 * @return
 */
export function maxDayOfDate(): number

/**
 * 取得指定日期数据信息
 * @param interval 表示数据类型 y 年 M月 d日 w星期 ww周 h时 n分 s秒
 * @param myDate 日期对象
 * @return 指定的数据信息 星期返回中文的星期信息
 */
export function datePart(interval: keyof date.DateInterval, myDate: Date): string | number

/**
 * 计算倒计时
 * @param time 根据类型传入不同的参数
 * @param formatStr d h m s ms 分别代表天、小时、分钟、秒、毫秒 将他们变为大写会补全为2位数 毫秒补全为3位数
 * @param isEndTime true 第一个参数是结束时间 false 第一个参数是剩余秒数
 * @param getAll true 返回所有类型时间
 * @return 返回天时分秒对象 或者返回格式化后的时间字符串
 */
export function endTime(time: Date | string, formatStr: string, isEndTime: boolean, getAll: boolean): date.EndTimeKeys | string

/**
 * 倒计时类
 * @example ```
 * const timer = new countDown()
 * timer.onTime(e => console.log(e))
 * // 100秒
 * timer.start(100000, 'M:S')
 * ```
 */
export class countDown {
  /**
   * 监听时间改变
   * @param callback 回调函数
   */
  onTime(callback: (time: string | date.EndTimeKeys) => void): void

  /**
   * 监听倒计时结束
   * @param callback 回调函数
   */
  onStop(callback: () => void): void

  /**
   * 开始倒计时
   * @param time 时间
   * @param formatStr 格式化
   * @param isEndTime 是否是结束时间
   * @param interval 定时器执行间隔
   */
  start(time: number | string, formatStr: string, isEndTime: boolean, interval: number): void

  /**
   * 停止定时器
   * 手动定制的定时器不会触发onStop事件
   */
  stop(): void
}

/**
 * 时间美化 一般用户聊天界面显示消息发送时间
 * @param date 时间对象或时间戳
 * @return 美化后的时间
 */
export function dateBeautiful(date: Date | string | number): string

/**
 * 用于监听某个时间点，类似与闹钟的功能
 */
export interface Timer {

  /**
   * 监听多个时间点
   * @param timers 多个未来的时间戳组成的数组
   * @param callback 到指定时间触发的回调函数
   */
  onTime(timers: number[], callback: Function): void

  /**
   * 取消某个函数的监听
   * @param callback onTime传入的函数，会取消这个函数的全部时间监听
   */
  offTime(callback: Function): void
}
