import { toast } from './util'

/**
 * 验证规则合集
 * phone 手机号
 * tel 座机号
 * email 邮件
 * money 金钱验证 不包含￥$符号
 * idcard 身份证
 */
const localRegs = {
  phone: /^1\d{10}$/,
  tel: /^([0-9]{3,4}-)?[0-9]{7,8}$/,
  email: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
  money: /^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/,
  idcard: /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
  password: /^[0-9A-Za-z`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*]*$/,
  url: /[a-zA-z]+:\/\/[^\s]*/,
  number: /^-?[1-9]\d*$/
}

export const verify = (value, rule, regsExt = {}, hideToast = false) => {
  const verifyRegs = { ...localRegs, ...regsExt }
  let regs = []
  // 兼容后台编辑的验证方式
  if (typeof rule.reg === 'object') {
    // 必填验证
    if (rule.required) {
      regs.push('required')
    }
    // 正则验证
    if (rule.reg.length > 0) {
      regs.push(rule.reg.join('_'))
    }
    // 长度验证
    if (rule.lenType !== '') {
      switch (rule.lenType) {
        case '==':
          regs.push('l' + rule.len)
          break
        case '>=':
          regs.push(`l${rule.lenMin}_`)
          break
        case '<=':
          regs.push(`l_${rule.lenMin}`)
          break
        case 'between':
          regs.push(`l${rule.lenMin}_${rule.lenMin}`)
          break
        default:
          break
      }
    }
  } else {
    regs = rule.reg.split("|")
  }
  for (let i = 0, l1 = regs.length; i < l1; i++) {
    const regOr = regs[i].split('-')
    // 是否验证通过
    let flag = false
    let errType = 'required'
    let lenErrText = ''
    for (let j = 0, l2 = regOr.length; j < l2; j++) {
      if (flag) break
      const reg = regOr[j]
      if (reg === 'required') {
        flag = !!value
        continue
      }
      if (verifyRegs[reg]) {
        // 为空不验证
        if (!value) {
          flag = true
          continue
        }
        flag = verifyRegs[reg].test(value)
        errType = 'error'
        continue
      }
      if (/^l(\d{1,}$|\d{1,}_$|\d{1,}_\d{1,}$|_\d{1,}$)/.test(reg)) {
        // 为空不验证
        if (!value) {
          flag = true
          continue
        }
        // 长度验证
        let underLen = reg.indexOf('_')
        let start
        let end
        if (underLen === -1) {
          // 等于
          start = Number(reg.substr(1))
          flag = value.length === start
          lenErrText = '长度需等于' + start
        } else if (underLen === 1) {
          // 小于等于
          end = Number(reg.substr(2))
          flag = value.length <= end
          lenErrText = '长度需小于等于' + end
        } else {
          start = Number(reg.substr(1, underLen - 1))
          end = reg.substr(underLen + 1) ? Number(reg.substr(underLen + 1)) : 0
          if (!end) {
            // 大于等于
            flag = value.length >= start
            lenErrText = '长度需大于等于' + start
          } else {
            // 介于
            flag = value.length >= start && value.length <= end
            lenErrText = '长度需介于' + start + ' ~ ' + end
          }
        }
        errType = 'length'
        continue
      }
      // 找不到任何验证方式 则通过验证
      flag = true
    }
    let errMsg = ''
    if (errType === 'required') {
      errMsg = rule.emptyMsg || '请输入' + rule.name
    } else if (errType === 'error') {
      errMsg = rule.errMsg || '请输入正确的' + rule.name
    } else if (errType === 'length') {
      errMsg = rule.lengthErrMsg || rule.name + lenErrText
    }
    if (!flag && !hideToast) {
      toast(errMsg)
    }
    if (!flag) {
      return errMsg
    }
  }
  return true
}

export const verifys = (values, verifylist, regsExt = {}, hideToast = false, getKey = false) => {
  for (const key in verifylist) {
    if (verifylist.hasOwnProperty(key) && values[key] !== undefined && verify(values[key], verifylist[key], regsExt, hideToast) !== true) {
      return getKey ? key : false
    }
  }
  return true
}

export const defineVerifyReg = (name, reg) => {
  if (localRegs[name]) {
    return console.log(name + '已经被定义为：' + localRegs[name])
  }
  localRegs[name] = reg
}

export const defineVerifyRegs = regs => {
  for (const key in regs) {
    if (Object.hasOwnProperty.call(regs, key)) {
      defineVerifyReg(key, regs[key])
    }
  }
}
