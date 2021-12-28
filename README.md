# TaroTools

Taro的常用函数封装

## 常用的函数封装
- 日期
- 颜色
- 事件
- 上传
- 请求
- 路由
- 字符串处理
- 数据验证

## 使用

### 安装

```bash
yarn add taro-tools
```

### 导入

```jsx
import { dateToStr, currentPage, asyncTimeOut } from 'taro-tools'

// 将当前时间格式化为指定格式
dateToStr('yyyy-MM-dd HH:mm:ss')

// 获取当前路由
currentPage()

// 异步定时器
asyncTimeOut(1000).then(() => {
  
})

// 更多函数请查看文档

```
## 完整的文档在[这里](https://shaogongbra.github.io/taro-tools)
