interface TimeOutTask extends Promise<TimeOutTask> {
  /** 清除定时器 */
  clear(): void
}

/**
 * 设置页面标题
 * @param title 标题
 */
export function setNavigationBarTitle(title: string): void

/**
 * 判断是不是有刘海的机型
 */
export function isIphoneX(): boolean

/**
 * 定时器的Promise用法
 * @param timeout 定时时间
 */
export function asyncTimeOut(timeout: number): TimeOutTask

/**
 * 一个空函数
 */
export function noop(): void
