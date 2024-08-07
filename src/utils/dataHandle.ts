import { useConfigStore } from '../stores/configStore'
import {XBox} from '@/utils/xBox/xBox.js'

const configStore = useConfigStore()
const win = window as any
let signState = false

const waitSign = async (): Promise<boolean> => {
  return await win.myApi.waitSign()
}

// 测试连接
export const testConnection = async (): Promise<boolean> => {
  // console.info(conStore)
  if (await win.myApi.connectHardware()) {
    XBox.popMes('连接成功')
    return new Promise((resolve) => resolve(true))
  } else {
    XBox.popMes('连接失败，请检查硬件连接')
    return new Promise((resolve) => resolve(false))
  }
}

// 发送菜单
export const sendMenu = async () => {
  await win.myApi.sendData(new Uint8Array([0xaa, 0xbb, 0xdd]))
  await new Promise((resolve) => setTimeout(resolve, 2))
  let resultArr = new Uint8Array(31)
  resultArr[0] = 1
  // 获取是否配置数据
  let isData = 0
  for (let i = 0; i < 10; i++) {
    if (configStore.menuConfig[i].keyConfig.length == 0 || configStore.menuConfig[i].screenConfig.length == 0) {
      resultArr[i + 1] = 0
    } else {
      configStore.menuConfig[i].keyConfig.forEach((o) => {
        o.forEach((x) => {
          if (x.userKey != '' || x.genKey != '') isData = 1
        })
      })
      // console.info(configStore.menuConfig[i].screenConfig)
      configStore.menuConfig[i].screenConfig.forEach((o) => {
        if (o.baseData != '' || o.buffData.length != 0) isData = 1
      })
    }
    resultArr[i + 1] = isData
    configStore.setActiveMenu(i, isData)
    isData = 0
  }
  // console.info(resultArr)
  // console.info(configStore.activeMenu)
  await win.myApi.sendData(resultArr)
  await new Promise((resolve) => setTimeout(resolve, 150))
  // signState = await waitSign()
  // if (!signState) return
}

// 发送单色图片数据
export const sendOledScreen = async () => {
  let oledArr1 = configStore.screenData[1].buffData
  let oledArr2 = configStore.screenData[2].buffData
  if(oledArr1.length == 0) {
    oledArr1 = new Array(360).fill(0)
  } 
  if(oledArr2.length == 0) {
    oledArr2 = new Array(360).fill(0)
  }
  let oledArr = new Uint8Array(oledArr1.concat(oledArr2))
  // console.info(oledArr)
  // 发送单色屏信号
  await win.myApi.sendData(new Uint8Array([0xaa, 0xbb, 0xee]))
  await new Promise((resolve) => setTimeout(resolve, 1))
  // 分包数据
  await subpackageImageData(oledArr, 62, async (dataArr: any) => {
    for (let i = 0; i < dataArr.length; i++) {
      await win.myApi.sendData(dataArr[i])
      await new Promise((resolve) => setTimeout(resolve, 1))
    }
  })
  await new Promise((resolve) => setTimeout(resolve, 110))
  // signState = await waitSign()
  // if (!signState) return
}

// 发送彩色屏幕
export const sendColorScreen = async () => {
  let u8Arr = new Uint8Array(configStore.screenData[0].buffData)
  // 发送彩屏信号
  await win.myApi.sendData(new Uint8Array([0xaa, 0xbb, 0xff]))
  await new Promise((resolve) => setTimeout(resolve, 1))
  // 处理空数据
  if(u8Arr.length == 0) {
    await win.myApi.sendData(new Uint8Array([0x00, 0x11, 0x22]))
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return
  }
  // 分包数据
  await subpackageImageData(u8Arr, 4096, async (dataArr: any) => {
    for (let i = 0; i < dataArr.length; i++) {
      // console.info(dataArr[i])
      await subpackageImageData(dataArr[i], 62, async (sendArr: Uint8Array) => {
        for (let j = 0; j < sendArr.length; j++) {
          // console.info(sendArr[j])
          await win.myApi.sendData(sendArr[j])
          await new Promise((resolve) => setTimeout(resolve, 1))
        }
      })
      await new Promise((resolve) => setTimeout(resolve, 130))
      // signState = await waitSign()
      // if (!signState) return
    }
  })
  await new Promise((resolve) => setTimeout(resolve, 2000))
}

// 分包图片数据(4096) -> (60)
const subpackageImageData = async (dataArr: Uint8Array, subSize: number, callBack: Function) => {
  let tempArr: Uint8Array[] = []
  for (let i = 0; i < dataArr.length; i += subSize) {
    tempArr.push(dataArr.slice(i, i + subSize))
  }
  await callBack(tempArr)
}

// 发送配置的数据到硬件，键值与图片用 (4096) 分隔，再用 (60) 分包
export const sendConfigData = async () => {
  // 开始拼接单层的键值数据并发送
  let tempObj = {}
  let beginIndex = 0
  configStore.layerKeyConfig.forEach((o, i) => {
    if (o.length != 0) {
      o.forEach((x, j) => {
        if (x.genKey != '') tempObj[`${beginIndex > 9 ? beginIndex : '0' + beginIndex}`] = x.genKey
        if (i < 8 && j < 2) beginIndex++
        if (i > 7) beginIndex++
      })
    } else {
      if (i < 8) beginIndex += 2
      else beginIndex += 6
    }
  })
  let dataStr = JSON.stringify(tempObj)
  // console.info('tempObj', dataStr)
  if(dataStr.length < 5) {
    await win.myApi.sendData(dataStr)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    return
  }
  // 分割为（4096）
  await subpackageSend(4096, dataStr, async (reduceStr: string) => {
    // 分包（60）发送
    await subpackageSend(62, reduceStr, async (str: string) => {
      // console.info(str)
      let state = await win.myApi.sendData(str)
      // await new Promise((resolve) => setTimeout(resolve, 1))
      if (!state) {
        XBox.popMes('发送数据出错')
      }
      // configStore.setProgressMes(Math.ceil((right / dataStr.length) * 100))
    })
    await new Promise((resolve) => setTimeout(resolve, 1200))
    // signState = await waitSign()
    // if (!signState) return
  })
}
// 分包发送函数
const subpackageSend = async (dataLimit: number, dataStr: string, callBack: Function) => {
  let left = 0,
    right = 0
  do {
    right = dataStr.length > dataLimit ? (right += dataLimit) : dataStr.length
    await callBack(dataStr.substring(left, right))
    left = right
  } while (right < dataStr.length)
}

// 重置数据
export const resetData = () => {
  // 清空屏幕配置数组
  for (let i = 0; i < 3; i++) {
    configStore.setCurScreen(i)
    let temp = {
      baseData: '',
      buffData: []
    }
    configStore.setScreenData(JSON.stringify(temp))
  }
  // 清空键值配置数组
  for (let i = 0; i < 11; i++) {
    configStore.setConfigIndex(i)
    configStore.setLayerKeyConfig(JSON.stringify([]))
  }
}

// 赋值数据
export const loadMenu = () => {
  // 赋值数据
  if (configStore.menuConfig[configStore.curMenu].screenConfig) {
    let temp = {
      screenData: configStore.menuConfig[configStore.curMenu].screenConfig,
      keyData: configStore.menuConfig[configStore.curMenu].keyConfig
    }
    // console.info(temp.screenData)
    if (temp.screenData.length != 0) {
      for (let i = 0; i < 3; i++) {
        configStore.setCurScreen(i)
        let curScreen = temp.screenData[i]
        configStore.setScreenData(JSON.stringify(curScreen))
      }
    }
    if (temp.keyData.length != 0) {
      for (let i = 0; i < 11; i++) {
        configStore.setConfigIndex(i)
        let curKey = temp.keyData[i]
        configStore.setLayerKeyConfig(JSON.stringify(curKey))
      }
    }
  }
}

// 解析配置文件并赋值
export const parseMenuConfig = (jsonStr: string) => {
  let jsonObj = JSON.parse(jsonStr)
  for(let i = 0; i < 10; i ++) {
    configStore.setCurMenu(i)
    let tempObj = {
      keyConfig: jsonObj[i].keyConfig || [],
      screenConfig: jsonObj[i].screenConfig || []
    }
    // 存储在全层数据
    configStore.setMenuConfig(JSON.stringify(tempObj))
  }
  // 显示菜单
  resetData()
  configStore.setCurMenu(0)
  loadMenu()
  // 显示图片
  let img = document.querySelectorAll('img')
  for (let i = 0; i < 3; i++) {
    let baseStr = configStore.screenData[i].baseData
    if (baseStr != '') img[i].src = `data:image/png;base64,${baseStr}`
    else img[i].src = ''
  }
}