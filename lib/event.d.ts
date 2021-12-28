/**
 * 事件系统
 * @example
 * ```javascript
 * // 监听事件
 * const calback = res => {}
 * event.add('name', calback)
 *
 * // 触发事件
 * event.emit('name', { name: '这是参数' })
 *
 * // 取消监听
 * event.remove('name', calback)
 * ```
 */
export interface event {
  /**
   * 添加事件监听
   * @param name 事件名称
   * @param func 回调函数
   */
  add(name: string, func: Function): void,
  /**
   * 移除事件监听 不传第二个参数 则移除当前事件的所有函数
   * @param name 事件名称
   * @param func 要移除监听的函数
   */
  remove(name: string, func: Function): void
  /**
   * 触发事件
   * @param name 事件名称
   * @param args 事件参数
   */
  emit(name: string, ...args: any[]): void,
  /**
   * 判断是否存在事件 传入func则判断func绑定的事件
   * @param name
   * @param func
   * @return 是否存在
   */
  is(name: string, func: Function): boolean
}

/**
 * 阻止事件冒泡，将点击或者其他事件的参数传入此函数，多端调用这个函数不会报错
 * @param event 原生事件参数
 */
export function stopPropagation(event: EventTarget | any): void
