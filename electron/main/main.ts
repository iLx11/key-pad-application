const { app, protocol, BrowserWindow, ipcMain } = require('electron')
// 需在当前文件内开头引入 Node.js 的 'path' 模块
const path = require('path')

import { windowControlListener } from '../controller/windowControl'
import CreateWindow from '../controller/createWindow'
import { getFilePath } from '../controller/fileDialog'
import SerialConnect from '../controller/serialPort'
import { eventNames } from 'process'
// 窗口监听
windowControlListener()

// 创建其他窗口
ipcMain.on('window-create', (event, optionObj: object, configObj: object) => {
  let cw = new CreateWindow()
  cw.createWindow(optionObj, configObj)
})

// 选取文件
ipcMain.handle('select-file', async () => {
  return await getFilePath()
})

// pinia
ipcMain.on('store-set', (event, objData) => {
  // 遍历窗口发送
  for(const cur of BrowserWindow.getAllWindows()) {
    if(cur != BrowserWindow.fromWebContents(event.sender)) {
      cur.webContents.send('store-get', objData)
    }
  }
})

// 硬件连接
ipcMain.handle('connection-state', async () => {
  // 创建窗口之后连接硬件
  return await SerialConnect.connectHardware()
})


// 创建主窗口
const createMainWindow = async () => {
  let mainW = new CreateWindow()
  mainW.createWindow({
    route: '/home',
    isMainWin: true,
  }, {
    width: 680,
    height: 500,
    maxWidth: 680,
    maxHeight: 500,
  })
}

app.commandLine.appendSwitch('--ignore-certificate-errors', 'true')
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])

app.whenReady().then(() => {
  // 创建窗口
  createMainWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

// 关闭所有窗口
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
