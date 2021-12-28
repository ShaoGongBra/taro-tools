const htmlReplace = html => {
  if (typeof html === 'string') {
    return html
      .replace(/<img/g, '<img style="max-width:100%;height:auto;display:block;" ')
      .replace(/section/g, 'div')
  } else {
    return ''
  }
}

const randomString = (len = 16) => {
  len = len || 32
  const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
  const maxPos = $chars.length
  let pwd = ''
  for (let i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos))
  }
  return pwd
}

/**
 * 10进制转为64进制
 * @param {*} number
 * @returns
 */
const to62 = number => {
  let chars = '0123456789abcdefghigklmnopqrstuvwxyzABCDEFGHIGKLMNOPQRSTUVWXYZ'.split(''),
    radix = chars.length,
    qutient = +number,
    arr = [],
    mod
  do {
    mod = qutient % radix
    qutient = (qutient - mod) / radix
    arr.unshift(chars[mod])
  } while (qutient)
  return arr.join('')
}

let oldTime = 0
const getKey = () => {
  const time = Date.now()
  if (oldTime >= time) {
    oldTime++
  } else {
    oldTime = time
  }
  return to62(oldTime)
}

const isNumber = string => {
  if (string === '' || string == null) {
    return false
  }
  // eslint-disable-next-line no-restricted-globals
  if (!isNaN(string)) {
    // 对于空数组和只有一个数值成员的数组或全是数字组成的字符串，isNaN返回false，例如：'123'、[]、[2]、['123'],isNaN返回false,
    // 所以如果不需要val包含这些特殊情况，则这个判断改写为if(!isNaN(val) && typeof val === 'number' )
    return true
  }
  return false
}

const guid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
  let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
  return v.toString(16)
})

export {
  htmlReplace,
  randomString,
  getKey,
  isNumber,
  guid
}
