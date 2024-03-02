export const toHexStr = (value: number): string => {
  let str = value.toString(16).toUpperCase()
  return str.length < 2 ? '0' + str : str
}