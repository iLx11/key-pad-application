import {app, BrowserWindow, IpcMainEvent, ipcMain } from 'electron'
import IWindowOption from '../interface/IWindowOption'
import IWindowConfig from '../interface/IWindowConfig'
const path = require('path')

// 窗口包含路由
interface IGroup {
  [props: string]: {
    route: string
    isMultiWindow: boolean
  }
}

export default class CreateWindow {
  private static group: IGroup = {}
  private static main: BrowserWindow | null | undefined = null

  // 窗口配置项
  private static windowsConfig: IWindowConfig = {
    id: null, //唯一 id
    title: '', //窗口标题
    width: null, //宽度
    height: null, //高度
    minWidth: null, //最小宽度
    minHeight: null, //最小高度
    route: '', // 页面路由 URL '/manage?id=123'
    resizable: true, //是否支持调整窗口大小
    maximize: false, //是否最大化
    backgroundColor: '#eee', //窗口背景色
    data: null, //数据
    isMultiWindow: false, //是否支持多开窗口 (如果为 false，当窗体存在，再次创建不会新建一个窗体 只 focus 显示即可，，如果为 true，即使窗体存在，也可以新建一个)
    isMainWin: false, //是否主窗口(当为 true 时会替代当前主窗口)
    parentId: null, //父窗口 id  创建父子窗口 -- 子窗口永远显示在父窗口顶部 【父窗口可以操作】
    modal: false //模态窗口 -- 模态窗口是禁用父窗口的子窗口，创建模态窗口必须设置 parent 和 modal 选项 【父窗口不能操作】
  }

  // 窗口默认配置
  private static windowOptions(options: Array<number> = []): IWindowOption {
    return {
      width: options[0],
      height: options[1],
      backgroundColor: '#f7f8fc',
      autoHideMenuBar: true,
      resizable: true,
      minimizable: true,
      maximizable: true,
      frame: true,
      show: false,
      minWidth: 0,
      minHeight: 0,
      modal: true,
      webPreferences: {
        contextIsolation: false, //上下文隔离
        nodeIntegration: true, //启用 Node 集成（是否完整的支持 node）
        webSecurity: false,
        preload: path.join(__dirname, '../preload/preload.js')
      }
    }
  }

  // 根据 id 的窗口
  public static getWindowById = (id: number): any => {
    return BrowserWindow.fromId(id)
  }

  // 创建窗口
  public static createWindow(options: object) {
    let args = Object.assign({}, this.windowsConfig, options)
    // 判断窗口是否存在
    for (let i in this.group) {
      if (this.getWindowById(Number(i)) && this.group[i].route == args.route && !this.group[i].isMultiWindow) {
        console.info('window already have')
        this.getWindowById(Number(i)).focus()
        return
      }
    }
    // 不存在就创建
    // 新窗口的大小
    let option = this.windowOptions([args.width || 500, args.height || 500])
    // 判断是否有父窗口
    if (args.parentId) {
      console.info('parentId:', args.parentId)
      option.parent = this.getWindowById(args.parentId) as BrowserWindow
    } else if (this.main) {
      // 当前为父窗口
    }

    // 根据传入配置项，修改窗口的相关参数
    option.modal = args.modal
    option.resizable = args.resizable // 窗口是否可缩放
    if (args.backgroundColor) option.backgroundColor = args.backgroundColor // 窗口背景色
    if (args.minWidth) option.minWidth = args.minWidth
    if (args.minHeight) option.minHeight = args.minHeight

    let win = new BrowserWindow(option)
    console.log('窗口 id:' + win.id)
    this.group[win.id] = {
      route: args.route,
      isMultiWindow: args.isMultiWindow
    }
    // 是否最大化
    if (args.maximize && args.resizable) {
      win.maximize()
    }
    // 是否主窗口
    if (args.isMainWin) {
      if (this.main) {
        console.log('主窗口存在')
        delete this.group[this.main.id]
        this.main.close()
      }
      this.main = win
    }
    args.id = win.id
    win.on('close', () => win.setOpacity(0))

    // 打开网址（加载页面）
    let winURL
    if (app.isPackaged) {
      winURL = args.route ? `app://./index.html${args.route}` : `app://./index.html`
    } else {
      winURL = args.route ? `http://${process.env['VITE_DEV_SERVER_HOST']}:${process.env['VITE_DEV_SERVER_PORT']}${args.route}?winId=${args.id}` : `http://${process.env['VITE_DEV_SERVER_HOST']}:${process.env['VITE_DEV_SERVER_PORT']}?winId=${args.id}`
    }
    console.log('新窗口地址:', winURL)
    win.loadURL(winURL)

    win.once('ready-to-show', () => {
      win.show()
    })
  }

  // 开启监听
  public static listen = () => {
    // 置顶
    ipcMain.on('pinUp', (event: IpcMainEvent, winId) => {
      event.preventDefault();
      if (winId && (this.main as BrowserWindow).id == winId) {
        let win: BrowserWindow = this.getWindowById(Number((this.main as BrowserWindow).id));
        if (win.isAlwaysOnTop()) {
          win.setAlwaysOnTop(false); // 取消置顶
        } else {
          win.setAlwaysOnTop(true); // 置顶
        }
      }
    })

    // 隐藏
    ipcMain.on("window-hide", (event, winId) => {
      if (winId) {
        this.getWindowById(Number(winId)).hide();
      } else {
        for (let i in this.group) {
          if (this.group[i]) this.getWindowById(Number(i)).hide();
        }
      }
    });

    // 显示
    ipcMain.on("window-show", (event, winId) => {
      if (winId) {
        this.getWindowById(Number(winId)).show();
      } else {
        for (let i in this.group) {
          if (this.group[i]) this.getWindowById(Number(i)).show();
        }
      }
    });

    // 最小化
    ipcMain.on("mini", (event, winId) => {
      console.log("最小化窗口 id", winId);
      if (winId) {
        this.getWindowById(Number(winId)).minimize();
      } else {
        for (let i in this.group) {
          if (this.group[i]) {
            this.getWindowById(Number(i)).minimize();
          }
        }
      }
    });

    // 最大化
    ipcMain.on("window-max", (event, winId) => {
      if (winId) {
        this.getWindowById(Number(winId)).maximize();
      } else {
        for (let i in this.group)
          if (this.group[i]) this.getWindowById(Number(i)).maximize();
      }
    });

    // 创建窗口
    ipcMain.on("window-new", (event, args) => this.createWindow(args));
  }
}
