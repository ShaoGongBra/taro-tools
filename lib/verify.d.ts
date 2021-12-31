declare namespace verify {

  /** 验证参数 */
  interface Option {
    /**
     * 验证规则
     * required 必填, phone 手机号码, tel 电话号码, email 邮件, money 钱, idcard 身份证
     * 第一个不是required的话 为空不验证
     *
     * 长度验证
     * l5 长度为5
     * l5_ 长度大于等于5
     * l_6 长度小于等于6
     * l1_5 长度1-5
     *
     * and验证用|隔开 or验证用-隔开 and优先于or
     */
    reg: string
    /**
     * 当前这个字段的名称
     * 当你配置此参数后下面的三个错误信息字段可以不配置 将会自动生成
     */
    name?: string
    /** 为空时的错误提示 */
    emptyMsg?: string
    /** 验证不通过时的提示 */
    errMsg?: string
    /** 长度不符合要求的提示 */
    lengthErrMsg?: string
  }

  /**
   * 定义验证规则
   */
  interface RegsExt {
    [propName: string]: RegExp
  }

  /**
   * 批量验证value
   */
  interface VerifysValues {
    [propName: string]: string
  }

  /**
   * 批量验证规则
   */
  interface VerifysVerifys {
    [propName: string]: verify.Option
  }
}

/**
 * 内容验证
 * @param {string} value 要验证的值
 * @param verify 验证规则
 * ```javascript
 * {
 *  reg: 'required|phone-tel|l5_8',
 *  name: '字段名',
 *  emptyMsg: '为空提示',
 *  errMsg: '验证错误提示',
 *  lengthErrMsg: '长度错误提示'
 * }
 * ```
 * reg字段的用法如下
 *
 * required 必填, phone 手机号码, tel 电话号码, email 邮件, money 钱, idcard 身份证
 * 第一个不是required的话 为空不验证
 * 更多验证方式可以通过regsExt参数指定
 *
 * 长度验证
 * l5 长度为5
 * l5_ 长度大于等于5
 * l_6 长度小于等于6
 * l1_5 长度1-5
 *
 * and验证用|隔开 or验证用-隔开 and优先于or
 * @param regsExt 扩展验证
 * @param hideToast 是否隐藏验证提示
 * @return 是否验证通过 当传入hideToast时验证不通过会返回错误描述，所以验证请验证 === true表示为通过验证
 */
export function verify(
  value: string,
  verify: verify.Option,
  regsExt: verify.RegsExt,
  hideToast: boolean
): boolean | string

/**
 * 批量内容验证
 * @param values 要验证的值组成的对象 {key: 'value'}
 * @param verifylist 验证规则合集 {key: {}}
 * @param regsExt 扩展验证规则 单次生效
 * @param hideToast 是否隐藏错误提示
 * @param getKey 是否返回发生错误的字段名称 当此参数为true时，返回值可能是字符串，这时你验证通过需要判断是否全等于 === true
 * @return 是否验证通过
 */
export function verifys(
  values: verify.VerifysValues,
  verifylist: verify.VerifysVerifys,
  regsExt: verify.RegsExt,
  hideToast: boolean,
  getKey: boolean
): boolean | string

/**
 * 定义一个验证规则
 * @param name 规则标识
 * @param reg 规格正则表达式
 */
export function defineVerifyReg(name: string, reg: RegExp): void

/**
 * 定义多个验证规则
 * @param regs
 */
export function defineVerifyRegs(regs: verify.RegsExt): void
