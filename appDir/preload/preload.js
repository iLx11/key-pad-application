"use strict";
const { contextBridge, ipcRenderer } = require("electron");
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
  createNewWindow
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
