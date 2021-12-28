/**
 * html内容优化
 * 优化后端编辑器编辑的html方便在移动端展示
 * @param content 待处理的html
 */
export function htmlReplace(content: string): string

/**
 * 生成指定长度的随机字符串
 * @param len 长度 默认32
 */
export function randomString(len: number): string

/**
 * 获取一个唯一值
 * 用当前时间戳经过转换缩小长度生成的
 * 这只在你当前系统中的值是唯一的，如果你有两个相同的系统，则可能存在重复的值
 */
export function getKey(): string

/**
 * 判断是不是数字
 * @param string 传入的文本
 */
export function isNumber(): boolean

/**
 * 生成GUID
 */
export function guid(): string
