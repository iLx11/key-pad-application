const { contextBridge, ipcRenderer, dialog } = require('electron')

const latestDownload = (link: string) => {
  ipcRenderer.send('latest-download', link)
}

const readShortcutsFile = async (filePath: string) => {
  return await ipcRenderer.invoke('get-shortcut', filePath)
}

const delItem = (name: string) => {
  ipcRenderer.send('del-item', name)
}

const storageMenu = (name: string, item: string) => {
  ipcRenderer.send('set-item', name, item)
  // setItem(name, item)
}

const getMenu = async (name: string) => {
  // return getItem(name)
  return await ipcRenderer.invoke('get-item', name)
}

// Pinia store 设置主动更改同步
const setConfigStore = (obj: object) => {
  // console.log(obj)
  ipcRenderer.send('store-set', obj)
}

// 获取文件目录
const writeConfigFile = async (fileName: string, context: string) => {
  return await ipcRenderer.invoke('write-config', fileName,  context)
}

// 获取配置文件
const getConfigFile = async () => {
  return await ipcRenderer.invoke('get-config')
}

//获取文件路径
const getFilePath = async () => {
  return await ipcRenderer.invoke('select-file')
}

// 等待信号
const waitSign = async () => {
  return await ipcRenderer.invoke('wait-sign')
}

// 连接硬件
const connectHardware = async () => {
  return await ipcRenderer.invoke('connection-state')
}

// 发送数据
const sendData = async (data: string | Uint8Array) => {
  return await ipcRenderer.invoke('send-data', data)
}

// 打开新窗口
const createNewWindow = (optionObj: object, configObj: object) => {
  ipcRenderer.send('window-create', optionObj, configObj)
}

// 最小化
const minimizeWindow = () => {
  ipcRenderer.send('window-min')
}

// 最大化
const maximizeWindow = () => {
  ipcRenderer.send('window-max')
}

// 关闭窗口
const closeWindow = () => {
  ipcRenderer.send('window-close')
}

// 裁剪图片
const resizeImage = async (resizeWidth, resizeHeight, editorPicData, colorMode) => {
  const data = await ipcRenderer.invoke('pic-data-editor', resizeWidth, resizeHeight, editorPicData, colorMode)
  return data
}

// 生成数据
const generateResultArray = async ( picData, threshold = 120, ...configArray) => {
  const data = ipcRenderer.invoke('pic-data-parse', picData, threshold, ...configArray)
  return data
}

contextBridge.exposeInMainWorld('myApi', {
  latestDownload,
  readShortcutsFile,
  delItem,
  storageMenu,
  getMenu,
  getConfigFile,
  writeConfigFile,
  minimizeWindow,
  maximizeWindow,
  closeWindow,
  createNewWindow,
  setConfigStore,
  getFilePath,
  waitSign,
  connectHardware,
  readDeviceScreens: (knownGeneration?: number) => ipcRenderer.invoke('device-screens', knownGeneration),
  readDeviceButtons: () => ipcRenderer.invoke('device-buttons'),
  setDeviceConfiguring: (enabled: boolean) => ipcRenderer.invoke('device-configuring', enabled),
  pcPerformance: () => ipcRenderer.invoke('pc-performance'),
  livePerformance: (menu: number, metrics?: number[]) => ipcRenderer.invoke('live-performance', menu, metrics),
  petAction: (command: number, value = 0) => ipcRenderer.invoke('pet-action', command, value),
  getPetAiActivity: () => ipcRenderer.invoke('pet-ai-activity-get'),
  onPetAiActivity: (callback: (activity: unknown) => void) => {
    const listener = (_event: unknown, activity: unknown) => callback(activity)
    ipcRenderer.on('pet-ai-activity', listener)
    return () => ipcRenderer.removeListener('pet-ai-activity', listener)
  },
  getPetAi: () => ipcRenderer.invoke('pet-ai-get'),
  savePetAi: (settings: object) => ipcRenderer.invoke('pet-ai-save', settings),
  testPetAi: (kind: 'connection' | 'blink') => ipcRenderer.invoke('pet-ai-test', kind),
  liveOled: (operation?: object) => ipcRenderer.invoke('live-oled', operation),
  fetchScreenValue: (url: string, field: string) => ipcRenderer.invoke('screen-api-value', url, field),
  updateFirmware: () => ipcRenderer.invoke('update-firmware'),
  sendData,
  resizeImage,
  generateResultArray,
  // Pinia store 设置被动同步监听
  storeChangeListen: (callbacka) =>
    ipcRenderer.on('store-get', (event, data) => {
      callbacka(data)
    })
})
// 所有的 Node.js API接口 都可以在 preload 进程中被调用.
// 它拥有与Chrome扩展一样的沙盒。
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})
