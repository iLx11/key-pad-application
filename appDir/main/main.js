"use strict";
const electron = require("electron");
const path$3 = require("path");
const { ipcMain: ipcMain$2, BrowserWindow: BrowserWindow$1 } = require("electron");
const windowControlListener = () => {
  ipcMain$2.on("window-min", (event) => {
    const webContent = event.sender;
    const win = BrowserWindow$1.fromWebContents(webContent);
    win.minimize();
  });
  ipcMain$2.on("window-max", (event) => {
    const webContent = event.sender;
    const win = BrowserWindow$1.fromWebContents(webContent);
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });
  ipcMain$2.on("window-close", (event) => {
    const webContent = event.sender;
    const win = BrowserWindow$1.fromWebContents(webContent);
    win.close();
  });
};
const path$2 = require("path");
const _CreateWindow = class _CreateWindow2 {
  constructor() {
    this.getWindowById = (id) => {
      return electron.BrowserWindow.fromId(id);
    };
    this.defaultConfig = {
      id: null,
      //唯一 id
      title: "",
      //窗口标题
      width: null,
      //宽度
      height: null,
      //高度
      minWidth: null,
      //最小宽度
      minHeight: null,
      //最小高度
      route: "",
      // 页面路由 URL '/manage?id=123'
      resizable: true,
      //是否支持调整窗口大小
      maximize: false,
      //是否最大化
      backgroundColor: "#eee",
      //窗口背景色
      data: null,
      //数据
      isMultiWindow: false,
      //是否支持多开窗口 (如果为 false，当窗体存在，再次创建不会新建一个窗体 只 focus 显示即可，，如果为 true，即使窗体存在，也可以新建一个)
      isMainWin: false,
      //是否主窗口创建父子窗口 --(当为 true 时会替代当前主窗口)
      parentId: null,
      //父窗口 id   子窗口永远显示在父窗口顶部 【父窗口可以操作】
      modal: true
      //模态窗口 -- 模态窗口是禁用父窗口的子窗口，创建模态窗口必须设置 parent 和 modal 选项 【父窗口不能操作】
    };
    this.defaultOptions = {
      width: 900,
      height: 700,
      //窗口是否在屏幕居中. 默认值为 false
      center: true,
      //设置为 false 时可以创建一个无边框窗口 默认值为 true。
      frame: false,
      //窗口是否在创建时显示。 默认值为 true。
      show: true,
      transparent: true,
      maxWidth: null,
      maxHeight: null,
      minWidth: 630,
      minHeight: 450,
      backgroundColor: "rgba(0,0,0,0)",
      autoHideMenuBar: true,
      resizable: true,
      minimizable: true,
      maximizable: true,
      /* 
        【父窗口不能操作】
         模态窗口 -- 模态窗口是禁用父窗口的子窗口，创
         建模态窗口必须设置 parent 和 modal 选项
      */
      modal: true,
      parent: null,
      webPreferences: {
        // nodeIntegration: true,
        contextIsolation: true,
        // nodeIntegrationInWorker: true,
        webSecurity: false,
        // sandbox: false,
        nodeIntegration: true,
        preload: path$2.join(__dirname, "../preload/preload.js")
      }
    };
  }
  // 创建窗口
  createWindow(configurations, options) {
    var _a;
    let windowId = 0;
    if (_CreateWindow2.group.some((o, i) => {
      windowId = i;
      return o.route === configurations.route;
    })) {
      console.info("window is already created");
      (_a = this.getWindowById(windowId + 1)) == null ? void 0 : _a.blur();
      return;
    }
    let windowConfig = Object.assign({}, this.defaultConfig, configurations);
    let windowOptions = Object.assign({}, this.defaultOptions, options);
    if (!windowConfig.isMainWin && _CreateWindow2.main) {
      windowOptions.parent = _CreateWindow2.main;
    }
    let win = new electron.BrowserWindow(windowOptions);
    console.log("window id:" + win.id);
    _CreateWindow2.group[win.id - 1] = {
      windowId: win.id,
      route: windowConfig.route
    };
    if (windowConfig.maximize && windowConfig.resizable) {
      win.maximize();
    }
    if (windowConfig.isMainWin) {
      if (_CreateWindow2.main) {
        console.info("main window already created");
        delete _CreateWindow2.group[0];
        _CreateWindow2.main.close();
      }
      _CreateWindow2.main = win;
    }
    let that = this;
    win.on("close", () => {
      _CreateWindow2.group.forEach((o, i) => {
        if (this.getWindowById(o.windowId) == win)
          delete _CreateWindow2.group[i];
        if (win == that.main)
          electron.app.quit();
      });
      win.setOpacity(0);
    });
    let winURL;
    if (electron.app.isPackaged) {
      win.loadFile(path$3.join(__dirname, "../../dist/index.html"), { hash: windowConfig.route });
    } else {
      winURL = windowConfig.route ? `http://localhost:${process.env["VITE_DEV_SERVER_PORT"]}/#${windowConfig.route}` : `http://localhost:${process.env["VITE_DEV_SERVER_PORT"]}/#`;
      win.loadURL(winURL);
    }
    console.info("new window address -> ", winURL);
    win.setMenu(null);
    win.webContents.openDevTools();
    win.on("hide", () => win.webContents.closeDevTools());
    electron.globalShortcut.register("CommandOrControl+Shift+i", function() {
      win.webContents.openDevTools();
    });
    win.once("ready-to-show", () => {
      win.show();
    });
    return win;
  }
};
_CreateWindow.group = [];
_CreateWindow.main = null;
let CreateWindow = _CreateWindow;
const { dialog } = require("electron");
const getFilePath = async () => {
  let filePath = await dialog.showOpenDialog({
    title: "选择一个文件",
    buttonLabel: "确认选择",
    // defaultPath: app.getPath('pictures'),
    // 多选文件
    // properties: ["multiSelections"],
    filters: [
      // 文件类型
      { name: "应用/文件" }
    ]
  });
  return filePath;
};
const { SerialPort } = require("serialport");
const _SerialConnect = class _SerialConnect2 {
};
_SerialConnect.connectState = false;
_SerialConnect.HardwarePort = {};
_SerialConnect.connectHardware = async () => {
  let portLists = [];
  try {
    portLists = await SerialPort.list();
  } catch (err) {
    console.info(err);
    _SerialConnect.connectState = false;
    return new Promise((resolve2) => resolve2(false));
  }
  if (portLists.length == 0) {
    console.info("no serial port");
    _SerialConnect.connectState = false;
    return new Promise((resolve2) => resolve2(false));
  }
  let connectCount = 3;
  while (!_SerialConnect.connectState && connectCount > 0) {
    console.info(connectCount);
    for (let i = 0; i < portLists.length; i++) {
      let port = new SerialPort({ path: portLists[i].path, baudRate: 115200 }, (err) => {
        if (err) {
          console.log("port open failed");
          _SerialConnect.connectState = false;
          return new Promise((resolve2) => resolve2(false));
        }
        console.log("port open success");
      });
      port.on("error", (err) => {
        console.info(err);
        _SerialConnect.connectState = false;
        return new Promise((resolve2) => resolve2(false));
      });
      port.on("data", (buff) => {
        if (buff[0] == 170 && buff[1] == 187 && buff[2] == 204) {
          _SerialConnect.HardwarePort = port;
          _SerialConnect.connectState = true;
        }
        _SerialConnect.dataHandle(buff);
      });
      port.on("close", () => {
        _SerialConnect.connectState = false;
        return new Promise((resolve2) => resolve2(false));
      });
      port.write(new Uint8Array([170, 187, 204]));
      port.drain((err) => {
        if (err) {
          _SerialConnect.connectState = false;
          return new Promise((resolve2) => resolve2(false));
        }
        console.info("send ok");
      });
      await new Promise((resolve2) => setTimeout(resolve2, 500));
      connectCount--;
      if (!_SerialConnect.connectState) {
        port.close((err) => {
          if (err)
            console.info("close failed");
          _SerialConnect.connectState = false;
          console.info("close success");
        });
      }
    }
  }
  if (_SerialConnect.connectState == true) {
    console.info("connect success");
    return new Promise((resolve2) => resolve2(true));
  } else {
    console.info("no hardware input");
    return new Promise((resolve2) => resolve2(false));
  }
};
_SerialConnect.sendData = async (data) => {
  var _a, _b;
  if (_SerialConnect.connectState && Object.keys(_SerialConnect.HardwarePort).length != 0) {
    (_a = _SerialConnect.HardwarePort) == null ? void 0 : _a.write(Buffer.from(data));
    (_b = _SerialConnect.HardwarePort) == null ? void 0 : _b.drain((err) => {
      if (err)
        return new Promise((resolve2) => resolve2(false));
      return new Promise((resolve2) => resolve2(true));
    });
    return new Promise((resolve2) => resolve2(true));
  }
};
_SerialConnect.dataHandle = (buff) => {
  console.info(buff);
};
let SerialConnect = _SerialConnect;
const os$1 = require("os");
const path$1 = require("path");
const Crypto$1 = require("crypto");
const pngparse = require("pngparse");
const sharp$1 = require("sharp");
const fs$1 = require("fs-extra");
const _ImageToHexArray = class _ImageToHexArray2 {
  // 根据 base64 生成临时文件
  static generateTemFile(base64) {
    let hashname = Crypto$1.createHash("md5").update("angular-tmp-img").digest("hex") + ".bmp";
    let temFilePath = path$1.join(os$1.tmpdir(), hashname);
    let dataBuffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), "base64");
    fs$1.writeFileSync(temFilePath, dataBuffer);
    return temFilePath;
  }
  // ---------------------------------- TODO ---------------------------------------
  static convert(filename, callback) {
    let _this = this;
    _this.pngtolcd(filename, function(err, buffer) {
      err ? callback(err, null) : callback(null, _this.configArray[3] == 0 ? _this.hex2hex(buffer.toString("hex")) : buffer);
    });
  }
};
_ImageToHexArray.generate = (picData, thresholdData, config) => {
  _ImageToHexArray.configArray = config;
  _ImageToHexArray.threshold = thresholdData;
  return new Promise((resolve, reject) => {
    _ImageToHexArray.convert(_ImageToHexArray.generateTemFile(picData), function(err, hex) {
      if (!err) {
        resolve(hex);
      } else {
        reject(err);
      }
    });
  });
};
_ImageToHexArray.pngtolcd = (filename, callback) => {
  let _this = _ImageToHexArray;
  pngparse.parseFile(filename, function(err, img) {
    if (err) {
      let bufferStirng = _this.imgFileToBuffer(filename);
      return callback(null, bufferStirng);
    }
    let buffer = _this.imageDataToHexArray(img);
    callback(null, buffer);
  });
};
_ImageToHexArray.imgFileToBuffer = (filename) => {
  sharp$1(filename).toBuffer().then((outputBuffer) => {
    return outputBuffer;
  });
};
_ImageToHexArray.imageDataToHexArray = (imageData) => {
  const pimage = _ImageToHexArray.createImageDate(imageData);
  let pixels = pimage.data;
  let height = pimage.height;
  let width = pimage.width;
  let pixelsLen = pixels.length;
  if (_ImageToHexArray.configArray[4] == 1) {
    let threshold = _ImageToHexArray.threshold;
    let unpackedBuffer = [];
    let depth = 4;
    let pixelVal;
    for (let i = 0; i < pixelsLen; i += depth) {
      pixelVal = pixels[i + 1] = pixels[i + 2] = pixels[i];
      pixelVal > threshold ? pixelVal = 1 : pixelVal = 0;
      unpackedBuffer[i / depth] = pixelVal;
    }
    return _ImageToHexArray.imageSamplingArr[_ImageToHexArray.configArray[1]](unpackedBuffer, width, height);
  } else {
    return _ImageToHexArray.colorImageSampling(pixels, width, height);
  }
};
_ImageToHexArray.colorImageSampling = (pixels, width, height) => {
  const buffer = Buffer.alloc(width * height * 2);
  let i = 0, j = 0;
  while (i < buffer.length && j < pixels.length) {
    buffer[i] |= pixels[j] >> 3 << 3;
    buffer[i] |= pixels[j + 1] >> 5;
    buffer[i + 1] |= pixels[j + 1] >> 2 << 5;
    buffer[i + 1] |= pixels[j + 2] >> 3;
    if (_ImageToHexArray.configArray[0] == 0 || _ImageToHexArray.configArray[2] == 1) {
      buffer[i] = ~buffer[i];
      buffer[i + 1] = ~buffer[i + 1];
    }
    i += 2;
    j += 4;
  }
  return buffer;
};
_ImageToHexArray.ImageSamplingRow = (unpackedBuffer, width, height) => {
  const buffer = Buffer.alloc(width * height / 8);
  for (let i = 0; i < unpackedBuffer.length; i++) {
    let x = Math.floor(i % width);
    let y = Math.floor(i / width);
    let byte = 0;
    let page = y;
    let pageShift = 1 << x % 8;
    if (_ImageToHexArray.configArray[2] != 0)
      pageShift = 1 << 7 - x % 8;
    byte = page * Math.floor(width / 8) + Math.floor(x / 8);
    if (_ImageToHexArray.configArray[0] !== 0)
      unpackedBuffer[i] === 0 ? unpackedBuffer[i] = 1 : unpackedBuffer[i] = 0;
    if (unpackedBuffer[i] === 0) {
      buffer[byte] |= pageShift;
    } else {
      buffer[byte] &= ~pageShift;
    }
  }
  return buffer;
};
_ImageToHexArray.ImageSamplingCol = (unpackedBuffer, width, height) => {
  const buffer = Buffer.alloc(width * height / 8);
  for (let i = 0; i < unpackedBuffer.length; i++) {
    let x = Math.floor(i % width);
    let y = Math.floor(i / width);
    let byte = 0;
    let page = x;
    let pageShift = 1 << y % 8;
    if (_ImageToHexArray.configArray[2] != 0)
      pageShift = 1 << 7 - y % 8;
    byte = page * Math.floor(height / 8) + Math.floor(y / 8);
    if (_ImageToHexArray.configArray[0] !== 0)
      unpackedBuffer[i] === 0 ? unpackedBuffer[i] = 1 : unpackedBuffer[i] = 0;
    if (unpackedBuffer[i] === 0) {
      buffer[byte] |= pageShift;
    } else {
      buffer[byte] &= ~pageShift;
    }
  }
  return buffer;
};
_ImageToHexArray.ImageSamplingColRow = (unpackedBuffer, width, height) => {
  const buffer = Buffer.alloc(width * height / 8);
  for (let i = 0; i < unpackedBuffer.length; i++) {
    let x = Math.floor(i % width);
    let y = Math.floor(i / width);
    let byte = 0;
    let page = Math.floor(y / 8);
    let pageShift = 1 << y - 8 * page;
    if (_ImageToHexArray.configArray[2] != 0)
      pageShift = 1 << 7 - (y - 8 * page);
    page === 0 ? byte = x : byte = x + width * page;
    if (_ImageToHexArray.configArray[0] !== 0)
      unpackedBuffer[i] === 0 ? unpackedBuffer[i] = 1 : unpackedBuffer[i] = 0;
    if (unpackedBuffer[i] === 0) {
      buffer[byte] |= pageShift;
    } else {
      buffer[byte] &= ~pageShift;
    }
  }
  return buffer;
};
_ImageToHexArray.ImageSamplingRowCol = (unpackedBuffer, width, height) => {
  const buffer = Buffer.alloc(width * height / 8);
  for (let i = 0; i < unpackedBuffer.length; i++) {
    let x = Math.floor(i % width);
    let y = Math.floor(i / width);
    let byte = 0;
    let page = Math.floor(x / 8);
    let pageShift = 1 << x % 8;
    if (_ImageToHexArray.configArray[2] != 0)
      pageShift = 1 << 7 - x % 8;
    byte = page * height + y;
    if (_ImageToHexArray.configArray[0] !== 0)
      unpackedBuffer[i] === 0 ? unpackedBuffer[i] = 1 : unpackedBuffer[i] = 0;
    if (unpackedBuffer[i] === 0) {
      buffer[byte] |= pageShift;
    } else {
      buffer[byte] &= ~pageShift;
    }
  }
  return buffer;
};
_ImageToHexArray.imageSamplingArr = [_ImageToHexArray.ImageSamplingRow, _ImageToHexArray.ImageSamplingCol, _ImageToHexArray.ImageSamplingColRow, _ImageToHexArray.ImageSamplingRowCol];
_ImageToHexArray.createImageDate = (imageData) => {
  let buffer = Buffer.alloc(imageData.width * imageData.height * 4);
  for (let y = 0, pos = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; x++) {
      buffer.writeUInt32BE(_ImageToHexArray.getPixel(imageData, x, y), pos);
      pos += 4;
    }
  }
  imageData.data.set(buffer);
  return imageData;
};
_ImageToHexArray.getPixel = (image, x, y) => {
  x = x | 0;
  y = y | 0;
  if (x < 0 || y < 0 || x >= image.width || y >= image.height)
    return 0;
  let index = (y * image.width + x) * image.channels, r, g, b, a;
  switch (image.channels) {
    case 1:
      r = g = b = image.data[index];
      a = 255;
      break;
    case 2:
      r = g = b = image.data[index];
      a = image.data[index + 1];
      break;
    case 3:
      r = image.data[index];
      g = image.data[index + 1];
      b = image.data[index + 2];
      a = 255;
      break;
    case 4:
      r = image.data[index];
      g = image.data[index + 1];
      b = image.data[index + 2];
      a = image.data[index + 3];
      break;
  }
  return (r << 24 | g << 16 | b << 8 | a) >>> 0;
};
_ImageToHexArray.hex2hex = (hex) => {
  for (var bytes = [], c = 0; c < hex.length; c += 2) {
    bytes.push("0x" + hex.substr(c, 2));
  }
  return bytes;
};
_ImageToHexArray.pngtohexarray = (filename, callback) => {
  _ImageToHexArray.pngtolcd(filename, function(err, buffer) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, this.hex2hex(buffer.toString("hex")));
    }
  });
};
let ImageToHexArray = _ImageToHexArray;
const { ipcMain: ipcMain$1 } = require("electron");
const sharp = require("sharp");
const Crypto = require("crypto");
const os = require("os");
const fs = require("fs-extra");
const path = require("path");
let resultPicData = "";
const imgEditorHandle = async (width, height, picData, colorMode) => {
  if (width == 0 || height == 0)
    return;
  let hashname = Crypto.createHash("md5").update("angular-cir-img").digest("hex") + ".bmp";
  let originFilePath = path.join(os.tmpdir(), hashname);
  let dataBuffer = Buffer.from(picData.replace(/^data:image\/\w+;base64,/, ""), "base64");
  fs.writeFileSync(originFilePath, dataBuffer);
  path.join(
    // 临时文件夹目录
    os.tmpdir(),
    Crypto.createHash("md5").update("angular-cir-img-zoom").digest("hex") + ".bmp"
  );
  if (!colorMode) {
    sharp(originFilePath).resize(width, height).toBuffer().then((outputBuffer) => {
      let base64String = outputBuffer.toString("base64");
      resultPicData = base64String;
    });
  } else {
    sharp(originFilePath).resize(width, height).greyscale().toBuffer().then((outputBuffer) => {
      let base64String = outputBuffer.toString("base64");
      resultPicData = base64String;
    });
  }
};
const picDataListener = () => {
  ipcMain$1.handle("pic-data-editor", async (event, width, height, picData, colorMode) => {
    imgEditorHandle(width, height, picData, colorMode);
    await new Promise((resolve) => setTimeout(resolve, 700));
    return resultPicData;
  });
  ipcMain$1.handle("pic-data-parse", async (event, data, threshold, ...configArray) => {
    const result = await ImageToHexArray.generate(data, threshold, configArray);
    return result;
  });
};
const { app, protocol, BrowserWindow, ipcMain } = require("electron");
require("path");
windowControlListener();
picDataListener();
ipcMain.on("window-create", (event, optionObj, configObj) => {
  let cw = new CreateWindow();
  cw.createWindow(optionObj, configObj);
});
ipcMain.handle("select-file", async () => {
  return await getFilePath();
});
ipcMain.on("store-set", (event, objData) => {
  for (const cur of BrowserWindow.getAllWindows()) {
    if (cur != BrowserWindow.fromWebContents(event.sender)) {
      cur.webContents.send("store-get", objData);
    }
  }
});
ipcMain.handle("connection-state", async () => {
  return await SerialConnect.connectHardware();
});
ipcMain.handle("send-data", async (event, dataStr) => {
  return await SerialConnect.sendData(dataStr);
});
const createMainWindow = async () => {
  let mainW = new CreateWindow();
  mainW.createWindow({
    route: "/home",
    isMainWin: true
  }, {
    width: 680,
    height: 500,
    maxWidth: 680,
    maxHeight: 500
  });
};
app.commandLine.appendSwitch("--ignore-certificate-errors", "true");
protocol.registerSchemesAsPrivileged([{ scheme: "app", privileges: { secure: true, standard: true } }]);
app.whenReady().then(() => {
  createMainWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0)
      createMainWindow();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin")
    app.quit();
});
