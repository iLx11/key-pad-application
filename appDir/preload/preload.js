"use strict";
const { contextBridge, ipcRenderer, dialog } = require("electron");
const setConfigStore = (obj) => {
  ipcRenderer.send("store-set", obj);
};
const getFilePath = async () => {
  return await ipcRenderer.invoke("select-file");
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
contextBridge.exposeInMainWorld("myApi", {
  minimizeWindow,
  maximizeWindow,
  closeWindow,
  createNewWindow,
  setConfigStore,
  getFilePath,
  connectHardware,
  sendData,
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
