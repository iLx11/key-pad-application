const { contextBridge, ipcRenderer, dialog } = require('electron')

const latestDownload = (link: string) => {
  ipcRenderer.send('latest-download', link)
}

const readShortcutsFile = async (filePath: string) => {
  return await ipcRenderer.invoke('get-shortcut', filePath)
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
const sendData = async (dataStr: string) => {
  return await ipcRenderer.invoke('send-data', dataStr)
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
