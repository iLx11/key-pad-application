const { contextBridge, ipcRenderer, dialog } = require('electron')

// Pinia store 设置主动更改同步
const setConfigStore = (obj: object) => {
  // console.log(obj)
  ipcRenderer.send('store-set', obj)
}
//获取文件路径
const getFilePath = async () => {
  return await ipcRenderer.invoke('select-file')
}

// 连接硬件
const connectHardware = async () => {
  return await ipcRenderer.invoke('connection-state')
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

contextBridge.exposeInMainWorld('myApi', {
  minimizeWindow,
  maximizeWindow,
  closeWindow,
  createNewWindow,
  setConfigStore,
  getFilePath,
  connectHardware,
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
