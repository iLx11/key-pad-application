"use strict";
const electron = require("electron");
const path$1 = require("path");
const { ipcMain: ipcMain$1, BrowserWindow: BrowserWindow$1 } = require("electron");
const windowControlListener = () => {
  ipcMain$1.on("window-min", (event) => {
    const webContent = event.sender;
    const win = BrowserWindow$1.fromWebContents(webContent);
    win.minimize();
  });
  ipcMain$1.on("window-max", (event) => {
    const webContent = event.sender;
    const win = BrowserWindow$1.fromWebContents(webContent);
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });
  ipcMain$1.on("window-close", (event) => {
    const webContent = event.sender;
    const win = BrowserWindow$1.fromWebContents(webContent);
    win.close();
  });
};
const path = require("path");
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
        preload: path.join(__dirname, "../preload/preload.js")
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
      win.loadFile(path$1.join(__dirname, "../../dist/index.html"), { hash: windowConfig.route });
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
    return new Promise((resolve2) => resolve2(1));
  }
  if (portLists.length == 0) {
    console.info("no serial port");
    _SerialConnect.connectState = false;
    return new Promise((resolve2) => resolve2(1));
  }
  let connectCount = 3;
  while (!_SerialConnect.connectState && connectCount > 0) {
    console.info(connectCount);
    for (let i = 0; i < portLists.length; i++) {
      let port = new SerialPort({ path: portLists[i].path, baudRate: 115200 }, (err) => {
        if (err) {
          console.log("port open failed");
          _SerialConnect.connectState = false;
          return new Promise((resolve2) => resolve2(1));
        }
        console.log("port open success");
      });
      port.on("error", (err) => {
        console.info(err);
        _SerialConnect.connectState = falseb;
        return new Promise((resolve2) => resolve2(1));
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
        return new Promise((resolve2) => resolve2(1));
      });
      port.write(new Uint8Array([170, 187, 204]));
      port.drain((err) => {
        if (err) {
          _SerialConnect.connectState = false;
          return new Promise((resolve2) => resolve2(1));
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
    return new Promise((resolve2) => resolve2(0));
  } else {
    console.info("no hardware input");
    return new Promise((resolve2) => resolve2(1));
  }
};
_SerialConnect.sendData = async (data) => {
  var _a, _b;
  if (_SerialConnect.connectState && Object.keys(_SerialConnect.HardwarePort).length != 0) {
    (_a = _SerialConnect.HardwarePort) == null ? void 0 : _a.write(Buffer.from(data));
    (_b = _SerialConnect.HardwarePort) == null ? void 0 : _b.drain((err) => {
      if (err)
        return new Promise((resolve2) => resolve2(1));
      console.info("send ok");
    });
  }
};
_SerialConnect.dataHandle = (buff) => {
  console.info(buff);
};
let SerialConnect = _SerialConnect;
const { app, protocol, BrowserWindow, ipcMain } = require("electron");
require("path");
windowControlListener();
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
