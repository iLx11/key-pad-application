const { dialog } = require('electron')

export const getFilePath = async () => {
  let filePath = await  dialog.showOpenDialog({
    title: "选择一个文件",
      buttonLabel: "确认选择",
      // defaultPath: app.getPath('pictures'),
      // 多选文件
      // properties: ["multiSelections"],
      filters: [
          // 文件类型
          {name: "应用/文件", extensions:[]},
      ]
  })
  return filePath
}