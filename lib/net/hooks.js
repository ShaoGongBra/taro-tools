import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { request, throttleRequest } from './request'

export const useRequest = (option, onError) => {
  const [data, setData] = useState({})

  const reload = useCallback(() => {
    if (!option) {
      return
    }
    request(option).then(setData).catch(onError)
  }, [option])

  useEffect(() => {
    reload()
  }, [reload])

  return [data, { reload }]
}

export const useThrottleRequest = (option, mark, onError) => {
  const [data, setData] = useState({})

  const reload = useCallback(() => {
    if (!option) {
      return
    }
    throttleRequest(option, mark).then(setData).catch(onError)
  }, [option])

  useEffect(() => {
    reload()
  }, [reload])

  return [data, { reload }]
}

export const usePageData = (url, data, option) => {

  const currentData = useRef({ url, option, data, page: 1, loadEnd: false })
  const [list, setList] = useState([])

  const [loading, setLoading] = useState(false)

  const [refresh, setRefresh] = useState(false)

  const [loadEnd, setLoadEnd] = useState(false)

  const getList = useCallback(() => {
    const _data = currentData.current
    setLoading(true)
    if (_data.page === 1) {
      setRefresh(true)
    }
    request({
      url: _data.url,
      data: { ..._data.data, page: _data.page },
      method: _data.option?.method || 'GET',
      toast: _data.option?.method || true
    }).then(res => {
      const field = _data.option?.field || 'list'
      let _list = res[field]
      if (!_list) {
        return console.error('获取列表数据错误：' + field + '字段不存在')
      }
      if (_data.option?.listCallback) {
        _list = _data.option?.listCallback(_list)
      }
      if (!_list?.length) {
        currentData.current.loadEnd = true
        setLoadEnd(true)
      }
      setList(old => {
        if (_data.page > 1) {
          return [...old, ..._list]
        } else {
          return _list
        }
      })
    }).finally(() => {
      setLoading(false)
      setRefresh(false)
    })
  }, [])

  const next = useCallback(() => {
    if (currentData.current.loadEnd) {
      return console.log('数据已经加载完成')
    }
    currentData.current.page++
    getList()
  }, [getList])

  const reload = useCallback(() => {
    if (currentData.current.loadEnd) {
      currentData.current.loadEnd = false
      setLoadEnd(false)
    }
    currentData.current.page = 1
    getList()
  }, [getList])

  useEffect(() => {
    currentData.current.data = { ...data }
    reload()
  }, [data, reload])

  const resultData = useMemo(() => {
    return {
      list,
      loading,
      currentData: currentData.current,
      refresh,
      loadEnd,
      next,
      reload
    }
  }, [list, loading, refresh, loadEnd, next, reload])

  return resultData
}