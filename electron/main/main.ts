const { app, protocol, BrowserWindow, ipcMain, dialog } = require('electron')
// 需在当前文件内开头引入 Node.js 的 'path' 模块
const path = require('path')

import { windowControlListener } from '../controller/windowControl'
import CreateWindow from '../controller/createWindow'
import { getFilePath, getConfigFile, writeConfigFile } from '../controller/fileDialog'
import SerialConnect from '../controller/serialPort'
import { picDataListener } from '../controller/picDataEditor'
import { setItem, getItem } from "../controller/storage"
import { fileReadListener } from "../controller/fileRead"
// 窗口监听
windowControlListener()
// 图片处理监听
picDataListener()
// 文件读取
fileReadListener()

ipcMain.on('set-item', (event, name: string, item: string) => {
  setItem(name, item)
})

ipcMain.handle('get-item', async (event, name: string) => {
  return await getItem(name)
})

// 创建其他窗口
ipcMain.on('window-create', (event, optionObj: object, configObj: object) => {
  let cw = new CreateWindow()
  cw.createWindow(optionObj, configObj)
})

// 选择文件夹
ipcMain.handle('write-config', async (event, fileName: string, context: string) => {
  return await writeConfigFile(fileName, context)
})

// 选取文件
ipcMain.handle('select-file', async () => {
  return await getFilePath()
})

// 选取配置文件 
ipcMain.handle('get-config', async () => {
  return await getConfigFile()
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

// 等待信号
ipcMain.handle('wait-sign', async () => {
  return await SerialConnect.waitSign()
})

// 硬件连接
ipcMain.handle('connection-state', async () => {
  // 创建窗口之后连接硬件
  return await SerialConnect.connectHardware()
})

// 发送数据
ipcMain.handle('send-data', async (event, dataStr: string) => {
  return await SerialConnect.sendData(dataStr)
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
