import { ipcMain } from 'electron'
import ImageToHexArray from './ImageToHexArray'

const sharp = require('sharp')

export const picDataListener = () => {
  ipcMain.handle('pic-data-editor', async (_event, width, height, picData, colorMode) => {
    const buffer = Buffer.from(picData.replace(/^data:image\/\w+;base64,/, ''), 'base64')
    const image = sharp(buffer).resize(width, height).flatten({ background: '#000000' })
    if (colorMode) image.greyscale().threshold(121)
    return (await image.png().toBuffer()).toString('base64')
  })

  ipcMain.handle('pic-data-parse', (_event, data, threshold, ...configArray) => {
    return ImageToHexArray.generate(data, threshold, configArray)
  })
}
