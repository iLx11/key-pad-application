import { getStringMap } from "./hidKeyCode"

export const toHexStr = (value: number): string => {
  let str = value.toString(16).toUpperCase()
  return str.length < 2 ? '0' + str : str
}

export const genCompStr = (str: string) => {
  if (str == '') {
    return 'error 没有输入任何内容'
  }
  let genKeyStr: string = ''
  let state: number = 0
  let tempStr: string = ''
  let keyCount: number = 0

  try {
    for (let i = 0; i < str.length; i++) {
      // 特殊键值
      if (!/\r|\n/.test(str[i])) {
        if (/[A-Z]/.test(str[i]) || getStringMap().get(str[i]).kind > 1) {
          if (state != 3 && state != 0) {
            genKeyStr += `00${toHexStr(tempStr.length / 2)}${tempStr}`
            tempStr = ''
            keyCount++
          }
          state = 3
          tempStr += getStringMap().get(str[i]).hex
          continue
        }
      }
      // 普通键值
      if (state != 2 && state != 0) {
        genKeyStr += `02${toHexStr(tempStr.length / 2)}${tempStr}`
        tempStr = ''
        keyCount++
      }
      state = 2
      if (/\r|\n/.test(str[i])) {
        tempStr += getStringMap().get('Enter').hex
        continue
      }
      tempStr += getStringMap().get(str[i]).hex
    }
    if (state == 2) {
      genKeyStr += `00${toHexStr(tempStr.length / 2)}${tempStr}`
    }
    if (state == 3) {
      genKeyStr += `02${toHexStr(tempStr.length / 2)}${tempStr}`
    }
    keyCount += 2
    genKeyStr = `${toHexStr(keyCount)}${genKeyStr}`
  } catch (error) {
    return 'error 有错误产生，可能有不支持的字符'
  }
  return genKeyStr
}