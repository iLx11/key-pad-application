const { ipcMain } = require("electron");

const utils = require("../utils/ImageToHexArray");
const {getResultData, imageResize} = require("../utils/ImageResize")

ipcMain.handle("pic-data-editor", async (event, width, height, picData) => {
  imageResize(width, height, picData);
  // 等待 700 ms
  await new Promise((resolve) => setTimeout(resolve, 700));
  return getResultData();
});

ipcMain.handle("pic-data-parse", async (event, data, ...configArray) => {
  const result = await utils.ImageToHexArray.generate(data, configArray);
  return result;
});
