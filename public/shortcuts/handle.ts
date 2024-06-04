let str = ``
let CStr = ``

let tStr = ``

let thReg = /(?<=<th.*>)(.+)(?=<\/th)/gm
let tdReg = /(?<=<td.*>)(.+)(?=<\/td)/gm

export const shortcutHandle = (): object => {
  let strObj = {}
  let tempStr = ''
  let thStr = ''
  let thArr: any = str.match(thReg)
  thArr.forEach(o => {
    thStr = thStr + (o + '\n')
  })
  let i = 0
  str.split(thReg).forEach((o) => {
    // 每一区
    if (o.match(tdReg) != null) {
      
      let matchArr = o.match(tdReg)

      matchArr?.forEach((x) => {
        let content = x.split('</td><td>')
        tempStr = tempStr + (content[0] + '\n')
        strObj[thArr[i]] = []
        let temp = {
          keyName: content[0],
          keyTrans: CStr.split(/\r|\n/g)[i],
          keyValue: content[1],
        }
        strObj[thArr[i ++]].push(temp)
      })
    }
  })
  strObj['toolTrans'] = tStr.split(/\r|\n/g)
  console.info(thStr)
  console.info(JSON.stringify(strObj))
  console.info(tempStr)
  return strObj
}
