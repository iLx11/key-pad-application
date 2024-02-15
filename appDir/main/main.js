"use strict";
const { ipcMain, BrowserWindow: BrowserWindow$1 } = require("electron");
const windowControlListener = () => {
  ipcMain.on("window-min", (event) => {
    const webContent = event.sender;
    const win = BrowserWindow$1.fromWebContents(webContent);
    win.minimize();
  });
  ipcMain.on("window-max", (event) => {
    const webContent = event.sender;
    const win = BrowserWindow$1.fromWebContents(webContent);
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });
  ipcMain.on("window-close", (event) => {
    const webContent = event.sender;
    const win = BrowserWindow$1.fromWebContents(webContent);
    win.close();
  });
};
const { app, protocol, BrowserWindow, globalShortcut } = require("electron");
const path = require("path");
windowControlListener();
app.commandLine.appendSwitch("--ignore-certificate-errors", "true");
protocol.registerSchemesAsPrivileged([{ scheme: "app", privileges: { secure: true, standard: true } }]);
const createWindow = () => {
  const win = new BrowserWindow({
    //窗口是否在屏幕居中. 默认值为 false
    center: true,
    //设置为 false 时可以创建一个无边框窗口 默认值为 true。
    frame: false,
    //窗口是否在创建时显示。 默认值为 true。
    show: true,
    width: 999,
    height: 773,
    transparent: true,
    maxWidth: 999,
    maxHeight: 773,
    minWidth: 688,
    minHeight: 560,
    webPreferences: {
      // nodeIntegration: true,
      // contextIsolation:false,
      // nodeIntegrationInWorker: true,
      // webSecurity: false,
      // sandbox: false,
      nodeIntegration: true,
      preload: path.join(__dirname, "../preload/preload.js")
    }
  });
  win.setMenu(null);
  if (app.isPackaged) {
    win.loadURL(`file://${path.join(__dirname, "../../dist/index.html")}`);
    win.webContents.openDevTools();
  } else {
    win.loadURL("http://localhost:5173/");
    win.webContents.openDevTools();
  }
  globalShortcut.register("CommandOrControl+Shift+i", function() {
    win.webContents.openDevTools();
  });
};
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin")
    app.quit();
});
