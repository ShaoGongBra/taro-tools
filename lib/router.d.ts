interface CurrentPageTask extends Promise<CurrentPageTask> {
}

/**
 * 获取当前顶层页面的页面路由地址
 * @return 当前路由 如 `main/index/index`
 */
export function currentPage(): string

/**
* 异步获取当前顶层页面的页面路由地址
* Taro3页面跳转后不会立即获得当前页面的路由地址 如果你需要在页面跳转后获得地址，建议用此异步函数获取
* @return
*/
export function currentPageAsync(): CurrentPageTask
