import { useConfigStore } from '../stores/configStore'
import { XBox } from 'ilx1-x-box'
import type { ScreenFrame } from '../components/screenPage/screenContent'

const configStore = useConfigStore()
const win = window as any

const sendData = async (data: string | Uint8Array) => {
  if (!await win.myApi.sendData(data)) throw new Error('串口写入失败')
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
  await sendData(new Uint8Array([0xaa, 0xbb, 0xdd]))
  await new Promise((resolve) => setTimeout(resolve, 2))
  let resultArr = new Uint8Array(31)
  resultArr[0] = 1
  // 获取是否配置数据
  for (let i = 0; i < 10; i++) {
    const { keyConfig, screenConfig } = configStore.menuConfig[i]
    const hasKeys = keyConfig.some((events: { userKey: string; genKey: string }[]) =>
      events?.some(event => event?.userKey || event?.genKey))
    const hasScreens = screenConfig.some((screen: ScreenFrame) => screen?.content || screen?.baseData || screen?.buffData?.length)
    const isData = Number(hasKeys || hasScreens)
    resultArr[i + 1] = isData
    configStore.setActiveMenu(i, isData)
  }
  const firstMenu = configStore.activeMenu.findIndex(Boolean)
  if (firstMenu !== -1) resultArr[0] = firstMenu + 1
  // console.info(resultArr)
  // console.info(configStore.activeMenu)
  await sendData(resultArr)
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
  let oledArr = Uint8Array.from(oledArr1.concat(oledArr2), Number)
  // console.info(oledArr)
  // 发送单色屏信号
  await sendData(new Uint8Array([0xaa, 0xbb, 0xee]))
  await new Promise((resolve) => setTimeout(resolve, 1))
  // 分包数据
  await subpackageImageData(oledArr, 62, async dataArr => {
    for (let i = 0; i < dataArr.length; i++) {
      await sendData(dataArr[i])
      await new Promise((resolve) => setTimeout(resolve, 1))
    }
  })
  await new Promise((resolve) => setTimeout(resolve, 110))
  // signState = await waitSign()
  // if (!signState) return
}

// 发送彩色屏幕
export const sendColorScreen = async () => {
  let u8Arr = Uint8Array.from(configStore.screenData[0].buffData, Number)
  // 发送彩屏信号
  await sendData(new Uint8Array([0xaa, 0xbb, 0xff]))
  await new Promise((resolve) => setTimeout(resolve, 1))
  // 处理空数据
  if(u8Arr.length == 0) {
    await sendData(new Uint8Array([0x00, 0x11, 0x22]))
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return
  }
  // 分包数据
  await subpackageImageData(u8Arr, 4096, async dataArr => {
    for (let i = 0; i < dataArr.length; i++) {
      // console.info(dataArr[i])
      await subpackageImageData(dataArr[i], 62, async sendArr => {
        for (let j = 0; j < sendArr.length; j++) {
          // console.info(sendArr[j])
          await sendData(sendArr[j])
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
const subpackageImageData = async (
  dataArr: Uint8Array, subSize: number, callBack: (chunks: Uint8Array[]) => Promise<void>
) => {
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
    await sendData(dataStr)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    return
  }
  // 分割为（4096）
  await subpackageSend(4096, dataStr, async (reduceStr: string) => {
    // 分包（60）发送
    await subpackageSend(62, reduceStr, async (str: string) => {
      await sendData(str)
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
        const curScreen = temp.screenData[i] ?? { baseData: '', buffData: [] }
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
}
