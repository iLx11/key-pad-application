"use strict";
const { contextBridge, ipcRenderer, dialog } = require("electron");
const latestDownload = (link) => {
  ipcRenderer.send("latest-download", link);
};
const readShortcutsFile = async (filePath) => {
  return await ipcRenderer.invoke("get-shortcut", filePath);
};
const delItem = (name) => {
  ipcRenderer.send("del-item", name);
};
const storageMenu = (name, item) => {
  ipcRenderer.send("set-item", name, item);
};
const getMenu = async (name) => {
  return await ipcRenderer.invoke("get-item", name);
};
const setConfigStore = (obj) => {
  ipcRenderer.send("store-set", obj);
};
const writeConfigFile = async (fileName, context) => {
  return await ipcRenderer.invoke("write-config", fileName, context);
};
const getConfigFile = async () => {
  return await ipcRenderer.invoke("get-config");
};
const getFilePath = async () => {
  return await ipcRenderer.invoke("select-file");
};
const waitSign = async () => {
  return await ipcRenderer.invoke("wait-sign");
};
const connectHardware = async () => {
  return await ipcRenderer.invoke("connection-state");
};
const sendData = async (dataStr) => {
  return await ipcRenderer.invoke("send-data", dataStr);
};
const createNewWindow = (optionObj, configObj) => {
  ipcRenderer.send("window-create", optionObj, configObj);
};
const minimizeWindow = () => {
  ipcRenderer.send("window-min");
};
const maximizeWindow = () => {
  ipcRenderer.send("window-max");
};
const closeWindow = () => {
  ipcRenderer.send("window-close");
};
const resizeImage = async (resizeWidth, resizeHeight, editorPicData, colorMode) => {
  const data = await ipcRenderer.invoke("pic-data-editor", resizeWidth, resizeHeight, editorPicData, colorMode);
  return data;
};
const generateResultArray = async (picData, threshold = 120, ...configArray) => {
  const data = ipcRenderer.invoke("pic-data-parse", picData, threshold, ...configArray);
  return data;
};
contextBridge.exposeInMainWorld("myApi", {
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
  sendData,
  resizeImage,
  generateResultArray,
  // Pinia store 设置被动同步监听
  storeChangeListen: (callbacka) => ipcRenderer.on("store-get", (event, data) => {
    callbacka(data);
  })
});
window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element)
      element.innerText = text;
  };
  for (const dependency of ["chrome", "node", "electron"]) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});
