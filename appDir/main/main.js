"use strict";
const electron = require("electron");
const require$$1 = require("path");
const require$$0$2 = require("fs");
const require$$0 = require("constants");
const require$$0$1 = require("stream");
const require$$4 = require("util");
const require$$5 = require("assert");
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
const path$f = require("path");
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
      minWidth: 680,
      minHeight: 500,
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
        preload: path$f.join(__dirname, "../preload/preload.js")
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
      win.loadFile(require$$1.join(__dirname, "../../dist/index.html"), { hash: windowConfig.route });
    } else {
      winURL = windowConfig.route ? `http://localhost:${process.env["VITE_DEV_SERVER_PORT"]}/#${windowConfig.route}` : `http://localhost:${process.env["VITE_DEV_SERVER_PORT"]}/#`;
      win.loadURL(winURL);
    }
    console.info("new window address -> ", winURL);
    win.setMenu(null);
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
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var fs$j = {};
var universalify$1 = {};
universalify$1.fromCallback = function(fn) {
  return Object.defineProperty(function(...args) {
    if (typeof args[args.length - 1] === "function")
      fn.apply(this, args);
    else {
      return new Promise((resolve, reject) => {
        fn.call(
          this,
          ...args,
          (err, res) => err != null ? reject(err) : resolve(res)
        );
      });
    }
  }, "name", { value: fn.name });
};
universalify$1.fromPromise = function(fn) {
  return Object.defineProperty(function(...args) {
    const cb = args[args.length - 1];
    if (typeof cb !== "function")
      return fn.apply(this, args);
    else
      fn.apply(this, args.slice(0, -1)).then((r) => cb(null, r), cb);
  }, "name", { value: fn.name });
};
var constants = require$$0;
var origCwd = process.cwd;
var cwd = null;
var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;
process.cwd = function() {
  if (!cwd)
    cwd = origCwd.call(process);
  return cwd;
};
try {
  process.cwd();
} catch (er) {
}
if (typeof process.chdir === "function") {
  var chdir = process.chdir;
  process.chdir = function(d) {
    cwd = null;
    chdir.call(process, d);
  };
  if (Object.setPrototypeOf)
    Object.setPrototypeOf(process.chdir, chdir);
}
var polyfills$1 = patch$1;
function patch$1(fs2) {
  if (constants.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
    patchLchmod(fs2);
  }
  if (!fs2.lutimes) {
    patchLutimes(fs2);
  }
  fs2.chown = chownFix(fs2.chown);
  fs2.fchown = chownFix(fs2.fchown);
  fs2.lchown = chownFix(fs2.lchown);
  fs2.chmod = chmodFix(fs2.chmod);
  fs2.fchmod = chmodFix(fs2.fchmod);
  fs2.lchmod = chmodFix(fs2.lchmod);
  fs2.chownSync = chownFixSync(fs2.chownSync);
  fs2.fchownSync = chownFixSync(fs2.fchownSync);
  fs2.lchownSync = chownFixSync(fs2.lchownSync);
  fs2.chmodSync = chmodFixSync(fs2.chmodSync);
  fs2.fchmodSync = chmodFixSync(fs2.fchmodSync);
  fs2.lchmodSync = chmodFixSync(fs2.lchmodSync);
  fs2.stat = statFix(fs2.stat);
  fs2.fstat = statFix(fs2.fstat);
  fs2.lstat = statFix(fs2.lstat);
  fs2.statSync = statFixSync(fs2.statSync);
  fs2.fstatSync = statFixSync(fs2.fstatSync);
  fs2.lstatSync = statFixSync(fs2.lstatSync);
  if (fs2.chmod && !fs2.lchmod) {
    fs2.lchmod = function(path2, mode, cb) {
      if (cb)
        process.nextTick(cb);
    };
    fs2.lchmodSync = function() {
    };
  }
  if (fs2.chown && !fs2.lchown) {
    fs2.lchown = function(path2, uid, gid, cb) {
      if (cb)
        process.nextTick(cb);
    };
    fs2.lchownSync = function() {
    };
  }
  if (platform === "win32") {
    fs2.rename = typeof fs2.rename !== "function" ? fs2.rename : function(fs$rename) {
      function rename2(from, to, cb) {
        var start = Date.now();
        var backoff = 0;
        fs$rename(from, to, function CB(er) {
          if (er && (er.code === "EACCES" || er.code === "EPERM" || er.code === "EBUSY") && Date.now() - start < 6e4) {
            setTimeout(function() {
              fs2.stat(to, function(stater, st) {
                if (stater && stater.code === "ENOENT")
                  fs$rename(from, to, CB);
                else
                  cb(er);
              });
            }, backoff);
            if (backoff < 100)
              backoff += 10;
            return;
          }
          if (cb)
            cb(er);
        });
      }
      if (Object.setPrototypeOf)
        Object.setPrototypeOf(rename2, fs$rename);
      return rename2;
    }(fs2.rename);
  }
  fs2.read = typeof fs2.read !== "function" ? fs2.read : function(fs$read) {
    function read(fd, buffer, offset, length, position, callback_) {
      var callback;
      if (callback_ && typeof callback_ === "function") {
        var eagCounter = 0;
        callback = function(er, _, __) {
          if (er && er.code === "EAGAIN" && eagCounter < 10) {
            eagCounter++;
            return fs$read.call(fs2, fd, buffer, offset, length, position, callback);
          }
          callback_.apply(this, arguments);
        };
      }
      return fs$read.call(fs2, fd, buffer, offset, length, position, callback);
    }
    if (Object.setPrototypeOf)
      Object.setPrototypeOf(read, fs$read);
    return read;
  }(fs2.read);
  fs2.readSync = typeof fs2.readSync !== "function" ? fs2.readSync : function(fs$readSync) {
    return function(fd, buffer, offset, length, position) {
      var eagCounter = 0;
      while (true) {
        try {
          return fs$readSync.call(fs2, fd, buffer, offset, length, position);
        } catch (er) {
          if (er.code === "EAGAIN" && eagCounter < 10) {
            eagCounter++;
            continue;
          }
          throw er;
        }
      }
    };
  }(fs2.readSync);
  function patchLchmod(fs3) {
    fs3.lchmod = function(path2, mode, callback) {
      fs3.open(
        path2,
        constants.O_WRONLY | constants.O_SYMLINK,
        mode,
        function(err, fd) {
          if (err) {
            if (callback)
              callback(err);
            return;
          }
          fs3.fchmod(fd, mode, function(err2) {
            fs3.close(fd, function(err22) {
              if (callback)
                callback(err2 || err22);
            });
          });
        }
      );
    };
    fs3.lchmodSync = function(path2, mode) {
      var fd = fs3.openSync(path2, constants.O_WRONLY | constants.O_SYMLINK, mode);
      var threw = true;
      var ret;
      try {
        ret = fs3.fchmodSync(fd, mode);
        threw = false;
      } finally {
        if (threw) {
          try {
            fs3.closeSync(fd);
          } catch (er) {
          }
        } else {
          fs3.closeSync(fd);
        }
      }
      return ret;
    };
  }
  function patchLutimes(fs3) {
    if (constants.hasOwnProperty("O_SYMLINK") && fs3.futimes) {
      fs3.lutimes = function(path2, at, mt, cb) {
        fs3.open(path2, constants.O_SYMLINK, function(er, fd) {
          if (er) {
            if (cb)
              cb(er);
            return;
          }
          fs3.futimes(fd, at, mt, function(er2) {
            fs3.close(fd, function(er22) {
              if (cb)
                cb(er2 || er22);
            });
          });
        });
      };
      fs3.lutimesSync = function(path2, at, mt) {
        var fd = fs3.openSync(path2, constants.O_SYMLINK);
        var ret;
        var threw = true;
        try {
          ret = fs3.futimesSync(fd, at, mt);
          threw = false;
        } finally {
          if (threw) {
            try {
              fs3.closeSync(fd);
            } catch (er) {
            }
          } else {
            fs3.closeSync(fd);
          }
        }
        return ret;
      };
    } else if (fs3.futimes) {
      fs3.lutimes = function(_a, _b, _c, cb) {
        if (cb)
          process.nextTick(cb);
      };
      fs3.lutimesSync = function() {
      };
    }
  }
  function chmodFix(orig) {
    if (!orig)
      return orig;
    return function(target, mode, cb) {
      return orig.call(fs2, target, mode, function(er) {
        if (chownErOk(er))
          er = null;
        if (cb)
          cb.apply(this, arguments);
      });
    };
  }
  function chmodFixSync(orig) {
    if (!orig)
      return orig;
    return function(target, mode) {
      try {
        return orig.call(fs2, target, mode);
      } catch (er) {
        if (!chownErOk(er))
          throw er;
      }
    };
  }
  function chownFix(orig) {
    if (!orig)
      return orig;
    return function(target, uid, gid, cb) {
      return orig.call(fs2, target, uid, gid, function(er) {
        if (chownErOk(er))
          er = null;
        if (cb)
          cb.apply(this, arguments);
      });
    };
  }
  function chownFixSync(orig) {
    if (!orig)
      return orig;
    return function(target, uid, gid) {
      try {
        return orig.call(fs2, target, uid, gid);
      } catch (er) {
        if (!chownErOk(er))
          throw er;
      }
    };
  }
  function statFix(orig) {
    if (!orig)
      return orig;
    return function(target, options, cb) {
      if (typeof options === "function") {
        cb = options;
        options = null;
      }
      function callback(er, stats) {
        if (stats) {
          if (stats.uid < 0)
            stats.uid += 4294967296;
          if (stats.gid < 0)
            stats.gid += 4294967296;
        }
        if (cb)
          cb.apply(this, arguments);
      }
      return options ? orig.call(fs2, target, options, callback) : orig.call(fs2, target, callback);
    };
  }
  function statFixSync(orig) {
    if (!orig)
      return orig;
    return function(target, options) {
      var stats = options ? orig.call(fs2, target, options) : orig.call(fs2, target);
      if (stats) {
        if (stats.uid < 0)
          stats.uid += 4294967296;
        if (stats.gid < 0)
          stats.gid += 4294967296;
      }
      return stats;
    };
  }
  function chownErOk(er) {
    if (!er)
      return true;
    if (er.code === "ENOSYS")
      return true;
    var nonroot = !process.getuid || process.getuid() !== 0;
    if (nonroot) {
      if (er.code === "EINVAL" || er.code === "EPERM")
        return true;
    }
    return false;
  }
}
var Stream = require$$0$1.Stream;
var legacyStreams = legacy$1;
function legacy$1(fs2) {
  return {
    ReadStream,
    WriteStream
  };
  function ReadStream(path2, options) {
    if (!(this instanceof ReadStream))
      return new ReadStream(path2, options);
    Stream.call(this);
    var self2 = this;
    this.path = path2;
    this.fd = null;
    this.readable = true;
    this.paused = false;
    this.flags = "r";
    this.mode = 438;
    this.bufferSize = 64 * 1024;
    options = options || {};
    var keys = Object.keys(options);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options[key];
    }
    if (this.encoding)
      this.setEncoding(this.encoding);
    if (this.start !== void 0) {
      if ("number" !== typeof this.start) {
        throw TypeError("start must be a Number");
      }
      if (this.end === void 0) {
        this.end = Infinity;
      } else if ("number" !== typeof this.end) {
        throw TypeError("end must be a Number");
      }
      if (this.start > this.end) {
        throw new Error("start must be <= end");
      }
      this.pos = this.start;
    }
    if (this.fd !== null) {
      process.nextTick(function() {
        self2._read();
      });
      return;
    }
    fs2.open(this.path, this.flags, this.mode, function(err, fd) {
      if (err) {
        self2.emit("error", err);
        self2.readable = false;
        return;
      }
      self2.fd = fd;
      self2.emit("open", fd);
      self2._read();
    });
  }
  function WriteStream(path2, options) {
    if (!(this instanceof WriteStream))
      return new WriteStream(path2, options);
    Stream.call(this);
    this.path = path2;
    this.fd = null;
    this.writable = true;
    this.flags = "w";
    this.encoding = "binary";
    this.mode = 438;
    this.bytesWritten = 0;
    options = options || {};
    var keys = Object.keys(options);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options[key];
    }
    if (this.start !== void 0) {
      if ("number" !== typeof this.start) {
        throw TypeError("start must be a Number");
      }
      if (this.start < 0) {
        throw new Error("start must be >= zero");
      }
      this.pos = this.start;
    }
    this.busy = false;
    this._queue = [];
    if (this.fd === null) {
      this._open = fs2.open;
      this._queue.push([this._open, this.path, this.flags, this.mode, void 0]);
      this.flush();
    }
  }
}
var clone_1 = clone$1;
var getPrototypeOf = Object.getPrototypeOf || function(obj) {
  return obj.__proto__;
};
function clone$1(obj) {
  if (obj === null || typeof obj !== "object")
    return obj;
  if (obj instanceof Object)
    var copy2 = { __proto__: getPrototypeOf(obj) };
  else
    var copy2 = /* @__PURE__ */ Object.create(null);
  Object.getOwnPropertyNames(obj).forEach(function(key) {
    Object.defineProperty(copy2, key, Object.getOwnPropertyDescriptor(obj, key));
  });
  return copy2;
}
var fs$i = require$$0$2;
var polyfills = polyfills$1;
var legacy = legacyStreams;
var clone = clone_1;
var util$1 = require$$4;
var gracefulQueue;
var previousSymbol;
if (typeof Symbol === "function" && typeof Symbol.for === "function") {
  gracefulQueue = Symbol.for("graceful-fs.queue");
  previousSymbol = Symbol.for("graceful-fs.previous");
} else {
  gracefulQueue = "___graceful-fs.queue";
  previousSymbol = "___graceful-fs.previous";
}
function noop() {
}
function publishQueue(context, queue) {
  Object.defineProperty(context, gracefulQueue, {
    get: function() {
      return queue;
    }
  });
}
var debug = noop;
if (util$1.debuglog)
  debug = util$1.debuglog("gfs4");
else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ""))
  debug = function() {
    var m = util$1.format.apply(util$1, arguments);
    m = "GFS4: " + m.split(/\n/).join("\nGFS4: ");
    console.error(m);
  };
if (!fs$i[gracefulQueue]) {
  var queue = commonjsGlobal[gracefulQueue] || [];
  publishQueue(fs$i, queue);
  fs$i.close = function(fs$close) {
    function close(fd, cb) {
      return fs$close.call(fs$i, fd, function(err) {
        if (!err) {
          resetQueue();
        }
        if (typeof cb === "function")
          cb.apply(this, arguments);
      });
    }
    Object.defineProperty(close, previousSymbol, {
      value: fs$close
    });
    return close;
  }(fs$i.close);
  fs$i.closeSync = function(fs$closeSync) {
    function closeSync(fd) {
      fs$closeSync.apply(fs$i, arguments);
      resetQueue();
    }
    Object.defineProperty(closeSync, previousSymbol, {
      value: fs$closeSync
    });
    return closeSync;
  }(fs$i.closeSync);
  if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || "")) {
    process.on("exit", function() {
      debug(fs$i[gracefulQueue]);
      require$$5.equal(fs$i[gracefulQueue].length, 0);
    });
  }
}
if (!commonjsGlobal[gracefulQueue]) {
  publishQueue(commonjsGlobal, fs$i[gracefulQueue]);
}
var gracefulFs = patch(clone(fs$i));
if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs$i.__patched) {
  gracefulFs = patch(fs$i);
  fs$i.__patched = true;
}
function patch(fs2) {
  polyfills(fs2);
  fs2.gracefulify = patch;
  fs2.createReadStream = createReadStream;
  fs2.createWriteStream = createWriteStream;
  var fs$readFile = fs2.readFile;
  fs2.readFile = readFile2;
  function readFile2(path2, options, cb) {
    if (typeof options === "function")
      cb = options, options = null;
    return go$readFile(path2, options, cb);
    function go$readFile(path3, options2, cb2, startTime) {
      return fs$readFile(path3, options2, function(err) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([go$readFile, [path3, options2, cb2], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb2 === "function")
            cb2.apply(this, arguments);
        }
      });
    }
  }
  var fs$writeFile = fs2.writeFile;
  fs2.writeFile = writeFile2;
  function writeFile2(path2, data, options, cb) {
    if (typeof options === "function")
      cb = options, options = null;
    return go$writeFile(path2, data, options, cb);
    function go$writeFile(path3, data2, options2, cb2, startTime) {
      return fs$writeFile(path3, data2, options2, function(err) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([go$writeFile, [path3, data2, options2, cb2], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb2 === "function")
            cb2.apply(this, arguments);
        }
      });
    }
  }
  var fs$appendFile = fs2.appendFile;
  if (fs$appendFile)
    fs2.appendFile = appendFile;
  function appendFile(path2, data, options, cb) {
    if (typeof options === "function")
      cb = options, options = null;
    return go$appendFile(path2, data, options, cb);
    function go$appendFile(path3, data2, options2, cb2, startTime) {
      return fs$appendFile(path3, data2, options2, function(err) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([go$appendFile, [path3, data2, options2, cb2], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb2 === "function")
            cb2.apply(this, arguments);
        }
      });
    }
  }
  var fs$copyFile = fs2.copyFile;
  if (fs$copyFile)
    fs2.copyFile = copyFile2;
  function copyFile2(src, dest, flags, cb) {
    if (typeof flags === "function") {
      cb = flags;
      flags = 0;
    }
    return go$copyFile(src, dest, flags, cb);
    function go$copyFile(src2, dest2, flags2, cb2, startTime) {
      return fs$copyFile(src2, dest2, flags2, function(err) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([go$copyFile, [src2, dest2, flags2, cb2], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb2 === "function")
            cb2.apply(this, arguments);
        }
      });
    }
  }
  var fs$readdir = fs2.readdir;
  fs2.readdir = readdir;
  var noReaddirOptionVersions = /^v[0-5]\./;
  function readdir(path2, options, cb) {
    if (typeof options === "function")
      cb = options, options = null;
    var go$readdir = noReaddirOptionVersions.test(process.version) ? function go$readdir2(path3, options2, cb2, startTime) {
      return fs$readdir(path3, fs$readdirCallback(
        path3,
        options2,
        cb2,
        startTime
      ));
    } : function go$readdir2(path3, options2, cb2, startTime) {
      return fs$readdir(path3, options2, fs$readdirCallback(
        path3,
        options2,
        cb2,
        startTime
      ));
    };
    return go$readdir(path2, options, cb);
    function fs$readdirCallback(path3, options2, cb2, startTime) {
      return function(err, files) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([
            go$readdir,
            [path3, options2, cb2],
            err,
            startTime || Date.now(),
            Date.now()
          ]);
        else {
          if (files && files.sort)
            files.sort();
          if (typeof cb2 === "function")
            cb2.call(this, err, files);
        }
      };
    }
  }
  if (process.version.substr(0, 4) === "v0.8") {
    var legStreams = legacy(fs2);
    ReadStream = legStreams.ReadStream;
    WriteStream = legStreams.WriteStream;
  }
  var fs$ReadStream = fs2.ReadStream;
  if (fs$ReadStream) {
    ReadStream.prototype = Object.create(fs$ReadStream.prototype);
    ReadStream.prototype.open = ReadStream$open;
  }
  var fs$WriteStream = fs2.WriteStream;
  if (fs$WriteStream) {
    WriteStream.prototype = Object.create(fs$WriteStream.prototype);
    WriteStream.prototype.open = WriteStream$open;
  }
  Object.defineProperty(fs2, "ReadStream", {
    get: function() {
      return ReadStream;
    },
    set: function(val) {
      ReadStream = val;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(fs2, "WriteStream", {
    get: function() {
      return WriteStream;
    },
    set: function(val) {
      WriteStream = val;
    },
    enumerable: true,
    configurable: true
  });
  var FileReadStream = ReadStream;
  Object.defineProperty(fs2, "FileReadStream", {
    get: function() {
      return FileReadStream;
    },
    set: function(val) {
      FileReadStream = val;
    },
    enumerable: true,
    configurable: true
  });
  var FileWriteStream = WriteStream;
  Object.defineProperty(fs2, "FileWriteStream", {
    get: function() {
      return FileWriteStream;
    },
    set: function(val) {
      FileWriteStream = val;
    },
    enumerable: true,
    configurable: true
  });
  function ReadStream(path2, options) {
    if (this instanceof ReadStream)
      return fs$ReadStream.apply(this, arguments), this;
    else
      return ReadStream.apply(Object.create(ReadStream.prototype), arguments);
  }
  function ReadStream$open() {
    var that = this;
    open(that.path, that.flags, that.mode, function(err, fd) {
      if (err) {
        if (that.autoClose)
          that.destroy();
        that.emit("error", err);
      } else {
        that.fd = fd;
        that.emit("open", fd);
        that.read();
      }
    });
  }
  function WriteStream(path2, options) {
    if (this instanceof WriteStream)
      return fs$WriteStream.apply(this, arguments), this;
    else
      return WriteStream.apply(Object.create(WriteStream.prototype), arguments);
  }
  function WriteStream$open() {
    var that = this;
    open(that.path, that.flags, that.mode, function(err, fd) {
      if (err) {
        that.destroy();
        that.emit("error", err);
      } else {
        that.fd = fd;
        that.emit("open", fd);
      }
    });
  }
  function createReadStream(path2, options) {
    return new fs2.ReadStream(path2, options);
  }
  function createWriteStream(path2, options) {
    return new fs2.WriteStream(path2, options);
  }
  var fs$open = fs2.open;
  fs2.open = open;
  function open(path2, flags, mode, cb) {
    if (typeof mode === "function")
      cb = mode, mode = null;
    return go$open(path2, flags, mode, cb);
    function go$open(path3, flags2, mode2, cb2, startTime) {
      return fs$open(path3, flags2, mode2, function(err, fd) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([go$open, [path3, flags2, mode2, cb2], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb2 === "function")
            cb2.apply(this, arguments);
        }
      });
    }
  }
  return fs2;
}
function enqueue(elem) {
  debug("ENQUEUE", elem[0].name, elem[1]);
  fs$i[gracefulQueue].push(elem);
  retry();
}
var retryTimer;
function resetQueue() {
  var now = Date.now();
  for (var i = 0; i < fs$i[gracefulQueue].length; ++i) {
    if (fs$i[gracefulQueue][i].length > 2) {
      fs$i[gracefulQueue][i][3] = now;
      fs$i[gracefulQueue][i][4] = now;
    }
  }
  retry();
}
function retry() {
  clearTimeout(retryTimer);
  retryTimer = void 0;
  if (fs$i[gracefulQueue].length === 0)
    return;
  var elem = fs$i[gracefulQueue].shift();
  var fn = elem[0];
  var args = elem[1];
  var err = elem[2];
  var startTime = elem[3];
  var lastTime = elem[4];
  if (startTime === void 0) {
    debug("RETRY", fn.name, args);
    fn.apply(null, args);
  } else if (Date.now() - startTime >= 6e4) {
    debug("TIMEOUT", fn.name, args);
    var cb = args.pop();
    if (typeof cb === "function")
      cb.call(null, err);
  } else {
    var sinceAttempt = Date.now() - lastTime;
    var sinceStart = Math.max(lastTime - startTime, 1);
    var desiredDelay = Math.min(sinceStart * 1.2, 100);
    if (sinceAttempt >= desiredDelay) {
      debug("RETRY", fn.name, args);
      fn.apply(null, args.concat([startTime]));
    } else {
      fs$i[gracefulQueue].push(elem);
    }
  }
  if (retryTimer === void 0) {
    retryTimer = setTimeout(retry, 0);
  }
}
(function(exports) {
  const u2 = universalify$1.fromCallback;
  const fs2 = gracefulFs;
  const api = [
    "access",
    "appendFile",
    "chmod",
    "chown",
    "close",
    "copyFile",
    "fchmod",
    "fchown",
    "fdatasync",
    "fstat",
    "fsync",
    "ftruncate",
    "futimes",
    "lchmod",
    "lchown",
    "link",
    "lstat",
    "mkdir",
    "mkdtemp",
    "open",
    "opendir",
    "readdir",
    "readFile",
    "readlink",
    "realpath",
    "rename",
    "rm",
    "rmdir",
    "stat",
    "symlink",
    "truncate",
    "unlink",
    "utimes",
    "writeFile"
  ].filter((key) => {
    return typeof fs2[key] === "function";
  });
  Object.assign(exports, fs2);
  api.forEach((method) => {
    exports[method] = u2(fs2[method]);
  });
  exports.exists = function(filename, callback) {
    if (typeof callback === "function") {
      return fs2.exists(filename, callback);
    }
    return new Promise((resolve) => {
      return fs2.exists(filename, resolve);
    });
  };
  exports.read = function(fd, buffer, offset, length, position, callback) {
    if (typeof callback === "function") {
      return fs2.read(fd, buffer, offset, length, position, callback);
    }
    return new Promise((resolve, reject) => {
      fs2.read(fd, buffer, offset, length, position, (err, bytesRead, buffer2) => {
        if (err)
          return reject(err);
        resolve({ bytesRead, buffer: buffer2 });
      });
    });
  };
  exports.write = function(fd, buffer, ...args) {
    if (typeof args[args.length - 1] === "function") {
      return fs2.write(fd, buffer, ...args);
    }
    return new Promise((resolve, reject) => {
      fs2.write(fd, buffer, ...args, (err, bytesWritten, buffer2) => {
        if (err)
          return reject(err);
        resolve({ bytesWritten, buffer: buffer2 });
      });
    });
  };
  exports.readv = function(fd, buffers, ...args) {
    if (typeof args[args.length - 1] === "function") {
      return fs2.readv(fd, buffers, ...args);
    }
    return new Promise((resolve, reject) => {
      fs2.readv(fd, buffers, ...args, (err, bytesRead, buffers2) => {
        if (err)
          return reject(err);
        resolve({ bytesRead, buffers: buffers2 });
      });
    });
  };
  exports.writev = function(fd, buffers, ...args) {
    if (typeof args[args.length - 1] === "function") {
      return fs2.writev(fd, buffers, ...args);
    }
    return new Promise((resolve, reject) => {
      fs2.writev(fd, buffers, ...args, (err, bytesWritten, buffers2) => {
        if (err)
          return reject(err);
        resolve({ bytesWritten, buffers: buffers2 });
      });
    });
  };
  if (typeof fs2.realpath.native === "function") {
    exports.realpath.native = u2(fs2.realpath.native);
  } else {
    process.emitWarning(
      "fs.realpath.native is not a function. Is fs being monkey-patched?",
      "Warning",
      "fs-extra-WARN0003"
    );
  }
})(fs$j);
var makeDir$1 = {};
var utils$1 = {};
const path$e = require$$1;
utils$1.checkPath = function checkPath(pth) {
  if (process.platform === "win32") {
    const pathHasInvalidWinCharacters = /[<>:"|?*]/.test(pth.replace(path$e.parse(pth).root, ""));
    if (pathHasInvalidWinCharacters) {
      const error = new Error(`Path contains invalid characters: ${pth}`);
      error.code = "EINVAL";
      throw error;
    }
  }
};
const fs$h = fs$j;
const { checkPath: checkPath2 } = utils$1;
const getMode = (options) => {
  const defaults = { mode: 511 };
  if (typeof options === "number")
    return options;
  return { ...defaults, ...options }.mode;
};
makeDir$1.makeDir = async (dir, options) => {
  checkPath2(dir);
  return fs$h.mkdir(dir, {
    mode: getMode(options),
    recursive: true
  });
};
makeDir$1.makeDirSync = (dir, options) => {
  checkPath2(dir);
  return fs$h.mkdirSync(dir, {
    mode: getMode(options),
    recursive: true
  });
};
const u$a = universalify$1.fromPromise;
const { makeDir: _makeDir, makeDirSync } = makeDir$1;
const makeDir = u$a(_makeDir);
var mkdirs$2 = {
  mkdirs: makeDir,
  mkdirsSync: makeDirSync,
  // alias
  mkdirp: makeDir,
  mkdirpSync: makeDirSync,
  ensureDir: makeDir,
  ensureDirSync: makeDirSync
};
const u$9 = universalify$1.fromPromise;
const fs$g = fs$j;
function pathExists$6(path2) {
  return fs$g.access(path2).then(() => true).catch(() => false);
}
var pathExists_1 = {
  pathExists: u$9(pathExists$6),
  pathExistsSync: fs$g.existsSync
};
const fs$f = gracefulFs;
function utimesMillis$1(path2, atime, mtime, callback) {
  fs$f.open(path2, "r+", (err, fd) => {
    if (err)
      return callback(err);
    fs$f.futimes(fd, atime, mtime, (futimesErr) => {
      fs$f.close(fd, (closeErr) => {
        if (callback)
          callback(futimesErr || closeErr);
      });
    });
  });
}
function utimesMillisSync$1(path2, atime, mtime) {
  const fd = fs$f.openSync(path2, "r+");
  fs$f.futimesSync(fd, atime, mtime);
  return fs$f.closeSync(fd);
}
var utimes = {
  utimesMillis: utimesMillis$1,
  utimesMillisSync: utimesMillisSync$1
};
const fs$e = fs$j;
const path$d = require$$1;
const util = require$$4;
function getStats$2(src, dest, opts) {
  const statFunc = opts.dereference ? (file2) => fs$e.stat(file2, { bigint: true }) : (file2) => fs$e.lstat(file2, { bigint: true });
  return Promise.all([
    statFunc(src),
    statFunc(dest).catch((err) => {
      if (err.code === "ENOENT")
        return null;
      throw err;
    })
  ]).then(([srcStat, destStat]) => ({ srcStat, destStat }));
}
function getStatsSync(src, dest, opts) {
  let destStat;
  const statFunc = opts.dereference ? (file2) => fs$e.statSync(file2, { bigint: true }) : (file2) => fs$e.lstatSync(file2, { bigint: true });
  const srcStat = statFunc(src);
  try {
    destStat = statFunc(dest);
  } catch (err) {
    if (err.code === "ENOENT")
      return { srcStat, destStat: null };
    throw err;
  }
  return { srcStat, destStat };
}
function checkPaths(src, dest, funcName, opts, cb) {
  util.callbackify(getStats$2)(src, dest, opts, (err, stats) => {
    if (err)
      return cb(err);
    const { srcStat, destStat } = stats;
    if (destStat) {
      if (areIdentical$2(srcStat, destStat)) {
        const srcBaseName = path$d.basename(src);
        const destBaseName = path$d.basename(dest);
        if (funcName === "move" && srcBaseName !== destBaseName && srcBaseName.toLowerCase() === destBaseName.toLowerCase()) {
          return cb(null, { srcStat, destStat, isChangingCase: true });
        }
        return cb(new Error("Source and destination must not be the same."));
      }
      if (srcStat.isDirectory() && !destStat.isDirectory()) {
        return cb(new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`));
      }
      if (!srcStat.isDirectory() && destStat.isDirectory()) {
        return cb(new Error(`Cannot overwrite directory '${dest}' with non-directory '${src}'.`));
      }
    }
    if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
      return cb(new Error(errMsg(src, dest, funcName)));
    }
    return cb(null, { srcStat, destStat });
  });
}
function checkPathsSync(src, dest, funcName, opts) {
  const { srcStat, destStat } = getStatsSync(src, dest, opts);
  if (destStat) {
    if (areIdentical$2(srcStat, destStat)) {
      const srcBaseName = path$d.basename(src);
      const destBaseName = path$d.basename(dest);
      if (funcName === "move" && srcBaseName !== destBaseName && srcBaseName.toLowerCase() === destBaseName.toLowerCase()) {
        return { srcStat, destStat, isChangingCase: true };
      }
      throw new Error("Source and destination must not be the same.");
    }
    if (srcStat.isDirectory() && !destStat.isDirectory()) {
      throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`);
    }
    if (!srcStat.isDirectory() && destStat.isDirectory()) {
      throw new Error(`Cannot overwrite directory '${dest}' with non-directory '${src}'.`);
    }
  }
  if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
    throw new Error(errMsg(src, dest, funcName));
  }
  return { srcStat, destStat };
}
function checkParentPaths(src, srcStat, dest, funcName, cb) {
  const srcParent = path$d.resolve(path$d.dirname(src));
  const destParent = path$d.resolve(path$d.dirname(dest));
  if (destParent === srcParent || destParent === path$d.parse(destParent).root)
    return cb();
  fs$e.stat(destParent, { bigint: true }, (err, destStat) => {
    if (err) {
      if (err.code === "ENOENT")
        return cb();
      return cb(err);
    }
    if (areIdentical$2(srcStat, destStat)) {
      return cb(new Error(errMsg(src, dest, funcName)));
    }
    return checkParentPaths(src, srcStat, destParent, funcName, cb);
  });
}
function checkParentPathsSync(src, srcStat, dest, funcName) {
  const srcParent = path$d.resolve(path$d.dirname(src));
  const destParent = path$d.resolve(path$d.dirname(dest));
  if (destParent === srcParent || destParent === path$d.parse(destParent).root)
    return;
  let destStat;
  try {
    destStat = fs$e.statSync(destParent, { bigint: true });
  } catch (err) {
    if (err.code === "ENOENT")
      return;
    throw err;
  }
  if (areIdentical$2(srcStat, destStat)) {
    throw new Error(errMsg(src, dest, funcName));
  }
  return checkParentPathsSync(src, srcStat, destParent, funcName);
}
function areIdentical$2(srcStat, destStat) {
  return destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev;
}
function isSrcSubdir(src, dest) {
  const srcArr = path$d.resolve(src).split(path$d.sep).filter((i) => i);
  const destArr = path$d.resolve(dest).split(path$d.sep).filter((i) => i);
  return srcArr.reduce((acc, cur, i) => acc && destArr[i] === cur, true);
}
function errMsg(src, dest, funcName) {
  return `Cannot ${funcName} '${src}' to a subdirectory of itself, '${dest}'.`;
}
var stat$4 = {
  checkPaths,
  checkPathsSync,
  checkParentPaths,
  checkParentPathsSync,
  isSrcSubdir,
  areIdentical: areIdentical$2
};
const fs$d = gracefulFs;
const path$c = require$$1;
const mkdirs$1 = mkdirs$2.mkdirs;
const pathExists$5 = pathExists_1.pathExists;
const utimesMillis = utimes.utimesMillis;
const stat$3 = stat$4;
function copy$2(src, dest, opts, cb) {
  if (typeof opts === "function" && !cb) {
    cb = opts;
    opts = {};
  } else if (typeof opts === "function") {
    opts = { filter: opts };
  }
  cb = cb || function() {
  };
  opts = opts || {};
  opts.clobber = "clobber" in opts ? !!opts.clobber : true;
  opts.overwrite = "overwrite" in opts ? !!opts.overwrite : opts.clobber;
  if (opts.preserveTimestamps && process.arch === "ia32") {
    process.emitWarning(
      "Using the preserveTimestamps option in 32-bit node is not recommended;\n\n	see https://github.com/jprichardson/node-fs-extra/issues/269",
      "Warning",
      "fs-extra-WARN0001"
    );
  }
  stat$3.checkPaths(src, dest, "copy", opts, (err, stats) => {
    if (err)
      return cb(err);
    const { srcStat, destStat } = stats;
    stat$3.checkParentPaths(src, srcStat, dest, "copy", (err2) => {
      if (err2)
        return cb(err2);
      runFilter(src, dest, opts, (err3, include) => {
        if (err3)
          return cb(err3);
        if (!include)
          return cb();
        checkParentDir(destStat, src, dest, opts, cb);
      });
    });
  });
}
function checkParentDir(destStat, src, dest, opts, cb) {
  const destParent = path$c.dirname(dest);
  pathExists$5(destParent, (err, dirExists) => {
    if (err)
      return cb(err);
    if (dirExists)
      return getStats$1(destStat, src, dest, opts, cb);
    mkdirs$1(destParent, (err2) => {
      if (err2)
        return cb(err2);
      return getStats$1(destStat, src, dest, opts, cb);
    });
  });
}
function runFilter(src, dest, opts, cb) {
  if (!opts.filter)
    return cb(null, true);
  Promise.resolve(opts.filter(src, dest)).then((include) => cb(null, include), (error) => cb(error));
}
function getStats$1(destStat, src, dest, opts, cb) {
  const stat2 = opts.dereference ? fs$d.stat : fs$d.lstat;
  stat2(src, (err, srcStat) => {
    if (err)
      return cb(err);
    if (srcStat.isDirectory())
      return onDir$1(srcStat, destStat, src, dest, opts, cb);
    else if (srcStat.isFile() || srcStat.isCharacterDevice() || srcStat.isBlockDevice())
      return onFile$1(srcStat, destStat, src, dest, opts, cb);
    else if (srcStat.isSymbolicLink())
      return onLink$1(destStat, src, dest, opts, cb);
    else if (srcStat.isSocket())
      return cb(new Error(`Cannot copy a socket file: ${src}`));
    else if (srcStat.isFIFO())
      return cb(new Error(`Cannot copy a FIFO pipe: ${src}`));
    return cb(new Error(`Unknown file: ${src}`));
  });
}
function onFile$1(srcStat, destStat, src, dest, opts, cb) {
  if (!destStat)
    return copyFile$1(srcStat, src, dest, opts, cb);
  return mayCopyFile$1(srcStat, src, dest, opts, cb);
}
function mayCopyFile$1(srcStat, src, dest, opts, cb) {
  if (opts.overwrite) {
    fs$d.unlink(dest, (err) => {
      if (err)
        return cb(err);
      return copyFile$1(srcStat, src, dest, opts, cb);
    });
  } else if (opts.errorOnExist) {
    return cb(new Error(`'${dest}' already exists`));
  } else
    return cb();
}
function copyFile$1(srcStat, src, dest, opts, cb) {
  fs$d.copyFile(src, dest, (err) => {
    if (err)
      return cb(err);
    if (opts.preserveTimestamps)
      return handleTimestampsAndMode(srcStat.mode, src, dest, cb);
    return setDestMode$1(dest, srcStat.mode, cb);
  });
}
function handleTimestampsAndMode(srcMode, src, dest, cb) {
  if (fileIsNotWritable$1(srcMode)) {
    return makeFileWritable$1(dest, srcMode, (err) => {
      if (err)
        return cb(err);
      return setDestTimestampsAndMode(srcMode, src, dest, cb);
    });
  }
  return setDestTimestampsAndMode(srcMode, src, dest, cb);
}
function fileIsNotWritable$1(srcMode) {
  return (srcMode & 128) === 0;
}
function makeFileWritable$1(dest, srcMode, cb) {
  return setDestMode$1(dest, srcMode | 128, cb);
}
function setDestTimestampsAndMode(srcMode, src, dest, cb) {
  setDestTimestamps$1(src, dest, (err) => {
    if (err)
      return cb(err);
    return setDestMode$1(dest, srcMode, cb);
  });
}
function setDestMode$1(dest, srcMode, cb) {
  return fs$d.chmod(dest, srcMode, cb);
}
function setDestTimestamps$1(src, dest, cb) {
  fs$d.stat(src, (err, updatedSrcStat) => {
    if (err)
      return cb(err);
    return utimesMillis(dest, updatedSrcStat.atime, updatedSrcStat.mtime, cb);
  });
}
function onDir$1(srcStat, destStat, src, dest, opts, cb) {
  if (!destStat)
    return mkDirAndCopy$1(srcStat.mode, src, dest, opts, cb);
  return copyDir$1(src, dest, opts, cb);
}
function mkDirAndCopy$1(srcMode, src, dest, opts, cb) {
  fs$d.mkdir(dest, (err) => {
    if (err)
      return cb(err);
    copyDir$1(src, dest, opts, (err2) => {
      if (err2)
        return cb(err2);
      return setDestMode$1(dest, srcMode, cb);
    });
  });
}
function copyDir$1(src, dest, opts, cb) {
  fs$d.readdir(src, (err, items) => {
    if (err)
      return cb(err);
    return copyDirItems(items, src, dest, opts, cb);
  });
}
function copyDirItems(items, src, dest, opts, cb) {
  const item = items.pop();
  if (!item)
    return cb();
  return copyDirItem$1(items, item, src, dest, opts, cb);
}
function copyDirItem$1(items, item, src, dest, opts, cb) {
  const srcItem = path$c.join(src, item);
  const destItem = path$c.join(dest, item);
  runFilter(srcItem, destItem, opts, (err, include) => {
    if (err)
      return cb(err);
    if (!include)
      return copyDirItems(items, src, dest, opts, cb);
    stat$3.checkPaths(srcItem, destItem, "copy", opts, (err2, stats) => {
      if (err2)
        return cb(err2);
      const { destStat } = stats;
      getStats$1(destStat, srcItem, destItem, opts, (err3) => {
        if (err3)
          return cb(err3);
        return copyDirItems(items, src, dest, opts, cb);
      });
    });
  });
}
function onLink$1(destStat, src, dest, opts, cb) {
  fs$d.readlink(src, (err, resolvedSrc) => {
    if (err)
      return cb(err);
    if (opts.dereference) {
      resolvedSrc = path$c.resolve(process.cwd(), resolvedSrc);
    }
    if (!destStat) {
      return fs$d.symlink(resolvedSrc, dest, cb);
    } else {
      fs$d.readlink(dest, (err2, resolvedDest) => {
        if (err2) {
          if (err2.code === "EINVAL" || err2.code === "UNKNOWN")
            return fs$d.symlink(resolvedSrc, dest, cb);
          return cb(err2);
        }
        if (opts.dereference) {
          resolvedDest = path$c.resolve(process.cwd(), resolvedDest);
        }
        if (stat$3.isSrcSubdir(resolvedSrc, resolvedDest)) {
          return cb(new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`));
        }
        if (stat$3.isSrcSubdir(resolvedDest, resolvedSrc)) {
          return cb(new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`));
        }
        return copyLink$1(resolvedSrc, dest, cb);
      });
    }
  });
}
function copyLink$1(resolvedSrc, dest, cb) {
  fs$d.unlink(dest, (err) => {
    if (err)
      return cb(err);
    return fs$d.symlink(resolvedSrc, dest, cb);
  });
}
var copy_1 = copy$2;
const fs$c = gracefulFs;
const path$b = require$$1;
const mkdirsSync$1 = mkdirs$2.mkdirsSync;
const utimesMillisSync = utimes.utimesMillisSync;
const stat$2 = stat$4;
function copySync$1(src, dest, opts) {
  if (typeof opts === "function") {
    opts = { filter: opts };
  }
  opts = opts || {};
  opts.clobber = "clobber" in opts ? !!opts.clobber : true;
  opts.overwrite = "overwrite" in opts ? !!opts.overwrite : opts.clobber;
  if (opts.preserveTimestamps && process.arch === "ia32") {
    process.emitWarning(
      "Using the preserveTimestamps option in 32-bit node is not recommended;\n\n	see https://github.com/jprichardson/node-fs-extra/issues/269",
      "Warning",
      "fs-extra-WARN0002"
    );
  }
  const { srcStat, destStat } = stat$2.checkPathsSync(src, dest, "copy", opts);
  stat$2.checkParentPathsSync(src, srcStat, dest, "copy");
  if (opts.filter && !opts.filter(src, dest))
    return;
  const destParent = path$b.dirname(dest);
  if (!fs$c.existsSync(destParent))
    mkdirsSync$1(destParent);
  return getStats(destStat, src, dest, opts);
}
function getStats(destStat, src, dest, opts) {
  const statSync = opts.dereference ? fs$c.statSync : fs$c.lstatSync;
  const srcStat = statSync(src);
  if (srcStat.isDirectory())
    return onDir(srcStat, destStat, src, dest, opts);
  else if (srcStat.isFile() || srcStat.isCharacterDevice() || srcStat.isBlockDevice())
    return onFile(srcStat, destStat, src, dest, opts);
  else if (srcStat.isSymbolicLink())
    return onLink(destStat, src, dest, opts);
  else if (srcStat.isSocket())
    throw new Error(`Cannot copy a socket file: ${src}`);
  else if (srcStat.isFIFO())
    throw new Error(`Cannot copy a FIFO pipe: ${src}`);
  throw new Error(`Unknown file: ${src}`);
}
function onFile(srcStat, destStat, src, dest, opts) {
  if (!destStat)
    return copyFile(srcStat, src, dest, opts);
  return mayCopyFile(srcStat, src, dest, opts);
}
function mayCopyFile(srcStat, src, dest, opts) {
  if (opts.overwrite) {
    fs$c.unlinkSync(dest);
    return copyFile(srcStat, src, dest, opts);
  } else if (opts.errorOnExist) {
    throw new Error(`'${dest}' already exists`);
  }
}
function copyFile(srcStat, src, dest, opts) {
  fs$c.copyFileSync(src, dest);
  if (opts.preserveTimestamps)
    handleTimestamps(srcStat.mode, src, dest);
  return setDestMode(dest, srcStat.mode);
}
function handleTimestamps(srcMode, src, dest) {
  if (fileIsNotWritable(srcMode))
    makeFileWritable(dest, srcMode);
  return setDestTimestamps(src, dest);
}
function fileIsNotWritable(srcMode) {
  return (srcMode & 128) === 0;
}
function makeFileWritable(dest, srcMode) {
  return setDestMode(dest, srcMode | 128);
}
function setDestMode(dest, srcMode) {
  return fs$c.chmodSync(dest, srcMode);
}
function setDestTimestamps(src, dest) {
  const updatedSrcStat = fs$c.statSync(src);
  return utimesMillisSync(dest, updatedSrcStat.atime, updatedSrcStat.mtime);
}
function onDir(srcStat, destStat, src, dest, opts) {
  if (!destStat)
    return mkDirAndCopy(srcStat.mode, src, dest, opts);
  return copyDir(src, dest, opts);
}
function mkDirAndCopy(srcMode, src, dest, opts) {
  fs$c.mkdirSync(dest);
  copyDir(src, dest, opts);
  return setDestMode(dest, srcMode);
}
function copyDir(src, dest, opts) {
  fs$c.readdirSync(src).forEach((item) => copyDirItem(item, src, dest, opts));
}
function copyDirItem(item, src, dest, opts) {
  const srcItem = path$b.join(src, item);
  const destItem = path$b.join(dest, item);
  if (opts.filter && !opts.filter(srcItem, destItem))
    return;
  const { destStat } = stat$2.checkPathsSync(srcItem, destItem, "copy", opts);
  return getStats(destStat, srcItem, destItem, opts);
}
function onLink(destStat, src, dest, opts) {
  let resolvedSrc = fs$c.readlinkSync(src);
  if (opts.dereference) {
    resolvedSrc = path$b.resolve(process.cwd(), resolvedSrc);
  }
  if (!destStat) {
    return fs$c.symlinkSync(resolvedSrc, dest);
  } else {
    let resolvedDest;
    try {
      resolvedDest = fs$c.readlinkSync(dest);
    } catch (err) {
      if (err.code === "EINVAL" || err.code === "UNKNOWN")
        return fs$c.symlinkSync(resolvedSrc, dest);
      throw err;
    }
    if (opts.dereference) {
      resolvedDest = path$b.resolve(process.cwd(), resolvedDest);
    }
    if (stat$2.isSrcSubdir(resolvedSrc, resolvedDest)) {
      throw new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`);
    }
    if (stat$2.isSrcSubdir(resolvedDest, resolvedSrc)) {
      throw new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`);
    }
    return copyLink(resolvedSrc, dest);
  }
}
function copyLink(resolvedSrc, dest) {
  fs$c.unlinkSync(dest);
  return fs$c.symlinkSync(resolvedSrc, dest);
}
var copySync_1 = copySync$1;
const u$8 = universalify$1.fromCallback;
var copy$1 = {
  copy: u$8(copy_1),
  copySync: copySync_1
};
const fs$b = gracefulFs;
const u$7 = universalify$1.fromCallback;
function remove$2(path2, callback) {
  fs$b.rm(path2, { recursive: true, force: true }, callback);
}
function removeSync$1(path2) {
  fs$b.rmSync(path2, { recursive: true, force: true });
}
var remove_1 = {
  remove: u$7(remove$2),
  removeSync: removeSync$1
};
const u$6 = universalify$1.fromPromise;
const fs$a = fs$j;
const path$a = require$$1;
const mkdir$3 = mkdirs$2;
const remove$1 = remove_1;
const emptyDir = u$6(async function emptyDir2(dir) {
  let items;
  try {
    items = await fs$a.readdir(dir);
  } catch {
    return mkdir$3.mkdirs(dir);
  }
  return Promise.all(items.map((item) => remove$1.remove(path$a.join(dir, item))));
});
function emptyDirSync(dir) {
  let items;
  try {
    items = fs$a.readdirSync(dir);
  } catch {
    return mkdir$3.mkdirsSync(dir);
  }
  items.forEach((item) => {
    item = path$a.join(dir, item);
    remove$1.removeSync(item);
  });
}
var empty = {
  emptyDirSync,
  emptydirSync: emptyDirSync,
  emptyDir,
  emptydir: emptyDir
};
const u$5 = universalify$1.fromCallback;
const path$9 = require$$1;
const fs$9 = gracefulFs;
const mkdir$2 = mkdirs$2;
function createFile$1(file2, callback) {
  function makeFile() {
    fs$9.writeFile(file2, "", (err) => {
      if (err)
        return callback(err);
      callback();
    });
  }
  fs$9.stat(file2, (err, stats) => {
    if (!err && stats.isFile())
      return callback();
    const dir = path$9.dirname(file2);
    fs$9.stat(dir, (err2, stats2) => {
      if (err2) {
        if (err2.code === "ENOENT") {
          return mkdir$2.mkdirs(dir, (err3) => {
            if (err3)
              return callback(err3);
            makeFile();
          });
        }
        return callback(err2);
      }
      if (stats2.isDirectory())
        makeFile();
      else {
        fs$9.readdir(dir, (err3) => {
          if (err3)
            return callback(err3);
        });
      }
    });
  });
}
function createFileSync$1(file2) {
  let stats;
  try {
    stats = fs$9.statSync(file2);
  } catch {
  }
  if (stats && stats.isFile())
    return;
  const dir = path$9.dirname(file2);
  try {
    if (!fs$9.statSync(dir).isDirectory()) {
      fs$9.readdirSync(dir);
    }
  } catch (err) {
    if (err && err.code === "ENOENT")
      mkdir$2.mkdirsSync(dir);
    else
      throw err;
  }
  fs$9.writeFileSync(file2, "");
}
var file = {
  createFile: u$5(createFile$1),
  createFileSync: createFileSync$1
};
const u$4 = universalify$1.fromCallback;
const path$8 = require$$1;
const fs$8 = gracefulFs;
const mkdir$1 = mkdirs$2;
const pathExists$4 = pathExists_1.pathExists;
const { areIdentical: areIdentical$1 } = stat$4;
function createLink$1(srcpath, dstpath, callback) {
  function makeLink(srcpath2, dstpath2) {
    fs$8.link(srcpath2, dstpath2, (err) => {
      if (err)
        return callback(err);
      callback(null);
    });
  }
  fs$8.lstat(dstpath, (_, dstStat) => {
    fs$8.lstat(srcpath, (err, srcStat) => {
      if (err) {
        err.message = err.message.replace("lstat", "ensureLink");
        return callback(err);
      }
      if (dstStat && areIdentical$1(srcStat, dstStat))
        return callback(null);
      const dir = path$8.dirname(dstpath);
      pathExists$4(dir, (err2, dirExists) => {
        if (err2)
          return callback(err2);
        if (dirExists)
          return makeLink(srcpath, dstpath);
        mkdir$1.mkdirs(dir, (err3) => {
          if (err3)
            return callback(err3);
          makeLink(srcpath, dstpath);
        });
      });
    });
  });
}
function createLinkSync$1(srcpath, dstpath) {
  let dstStat;
  try {
    dstStat = fs$8.lstatSync(dstpath);
  } catch {
  }
  try {
    const srcStat = fs$8.lstatSync(srcpath);
    if (dstStat && areIdentical$1(srcStat, dstStat))
      return;
  } catch (err) {
    err.message = err.message.replace("lstat", "ensureLink");
    throw err;
  }
  const dir = path$8.dirname(dstpath);
  const dirExists = fs$8.existsSync(dir);
  if (dirExists)
    return fs$8.linkSync(srcpath, dstpath);
  mkdir$1.mkdirsSync(dir);
  return fs$8.linkSync(srcpath, dstpath);
}
var link = {
  createLink: u$4(createLink$1),
  createLinkSync: createLinkSync$1
};
const path$7 = require$$1;
const fs$7 = gracefulFs;
const pathExists$3 = pathExists_1.pathExists;
function symlinkPaths$1(srcpath, dstpath, callback) {
  if (path$7.isAbsolute(srcpath)) {
    return fs$7.lstat(srcpath, (err) => {
      if (err) {
        err.message = err.message.replace("lstat", "ensureSymlink");
        return callback(err);
      }
      return callback(null, {
        toCwd: srcpath,
        toDst: srcpath
      });
    });
  } else {
    const dstdir = path$7.dirname(dstpath);
    const relativeToDst = path$7.join(dstdir, srcpath);
    return pathExists$3(relativeToDst, (err, exists) => {
      if (err)
        return callback(err);
      if (exists) {
        return callback(null, {
          toCwd: relativeToDst,
          toDst: srcpath
        });
      } else {
        return fs$7.lstat(srcpath, (err2) => {
          if (err2) {
            err2.message = err2.message.replace("lstat", "ensureSymlink");
            return callback(err2);
          }
          return callback(null, {
            toCwd: srcpath,
            toDst: path$7.relative(dstdir, srcpath)
          });
        });
      }
    });
  }
}
function symlinkPathsSync$1(srcpath, dstpath) {
  let exists;
  if (path$7.isAbsolute(srcpath)) {
    exists = fs$7.existsSync(srcpath);
    if (!exists)
      throw new Error("absolute srcpath does not exist");
    return {
      toCwd: srcpath,
      toDst: srcpath
    };
  } else {
    const dstdir = path$7.dirname(dstpath);
    const relativeToDst = path$7.join(dstdir, srcpath);
    exists = fs$7.existsSync(relativeToDst);
    if (exists) {
      return {
        toCwd: relativeToDst,
        toDst: srcpath
      };
    } else {
      exists = fs$7.existsSync(srcpath);
      if (!exists)
        throw new Error("relative srcpath does not exist");
      return {
        toCwd: srcpath,
        toDst: path$7.relative(dstdir, srcpath)
      };
    }
  }
}
var symlinkPaths_1 = {
  symlinkPaths: symlinkPaths$1,
  symlinkPathsSync: symlinkPathsSync$1
};
const fs$6 = gracefulFs;
function symlinkType$1(srcpath, type, callback) {
  callback = typeof type === "function" ? type : callback;
  type = typeof type === "function" ? false : type;
  if (type)
    return callback(null, type);
  fs$6.lstat(srcpath, (err, stats) => {
    if (err)
      return callback(null, "file");
    type = stats && stats.isDirectory() ? "dir" : "file";
    callback(null, type);
  });
}
function symlinkTypeSync$1(srcpath, type) {
  let stats;
  if (type)
    return type;
  try {
    stats = fs$6.lstatSync(srcpath);
  } catch {
    return "file";
  }
  return stats && stats.isDirectory() ? "dir" : "file";
}
var symlinkType_1 = {
  symlinkType: symlinkType$1,
  symlinkTypeSync: symlinkTypeSync$1
};
const u$3 = universalify$1.fromCallback;
const path$6 = require$$1;
const fs$5 = fs$j;
const _mkdirs = mkdirs$2;
const mkdirs = _mkdirs.mkdirs;
const mkdirsSync = _mkdirs.mkdirsSync;
const _symlinkPaths = symlinkPaths_1;
const symlinkPaths = _symlinkPaths.symlinkPaths;
const symlinkPathsSync = _symlinkPaths.symlinkPathsSync;
const _symlinkType = symlinkType_1;
const symlinkType = _symlinkType.symlinkType;
const symlinkTypeSync = _symlinkType.symlinkTypeSync;
const pathExists$2 = pathExists_1.pathExists;
const { areIdentical } = stat$4;
function createSymlink$1(srcpath, dstpath, type, callback) {
  callback = typeof type === "function" ? type : callback;
  type = typeof type === "function" ? false : type;
  fs$5.lstat(dstpath, (err, stats) => {
    if (!err && stats.isSymbolicLink()) {
      Promise.all([
        fs$5.stat(srcpath),
        fs$5.stat(dstpath)
      ]).then(([srcStat, dstStat]) => {
        if (areIdentical(srcStat, dstStat))
          return callback(null);
        _createSymlink(srcpath, dstpath, type, callback);
      });
    } else
      _createSymlink(srcpath, dstpath, type, callback);
  });
}
function _createSymlink(srcpath, dstpath, type, callback) {
  symlinkPaths(srcpath, dstpath, (err, relative) => {
    if (err)
      return callback(err);
    srcpath = relative.toDst;
    symlinkType(relative.toCwd, type, (err2, type2) => {
      if (err2)
        return callback(err2);
      const dir = path$6.dirname(dstpath);
      pathExists$2(dir, (err3, dirExists) => {
        if (err3)
          return callback(err3);
        if (dirExists)
          return fs$5.symlink(srcpath, dstpath, type2, callback);
        mkdirs(dir, (err4) => {
          if (err4)
            return callback(err4);
          fs$5.symlink(srcpath, dstpath, type2, callback);
        });
      });
    });
  });
}
function createSymlinkSync$1(srcpath, dstpath, type) {
  let stats;
  try {
    stats = fs$5.lstatSync(dstpath);
  } catch {
  }
  if (stats && stats.isSymbolicLink()) {
    const srcStat = fs$5.statSync(srcpath);
    const dstStat = fs$5.statSync(dstpath);
    if (areIdentical(srcStat, dstStat))
      return;
  }
  const relative = symlinkPathsSync(srcpath, dstpath);
  srcpath = relative.toDst;
  type = symlinkTypeSync(relative.toCwd, type);
  const dir = path$6.dirname(dstpath);
  const exists = fs$5.existsSync(dir);
  if (exists)
    return fs$5.symlinkSync(srcpath, dstpath, type);
  mkdirsSync(dir);
  return fs$5.symlinkSync(srcpath, dstpath, type);
}
var symlink = {
  createSymlink: u$3(createSymlink$1),
  createSymlinkSync: createSymlinkSync$1
};
const { createFile, createFileSync } = file;
const { createLink, createLinkSync } = link;
const { createSymlink, createSymlinkSync } = symlink;
var ensure = {
  // file
  createFile,
  createFileSync,
  ensureFile: createFile,
  ensureFileSync: createFileSync,
  // link
  createLink,
  createLinkSync,
  ensureLink: createLink,
  ensureLinkSync: createLinkSync,
  // symlink
  createSymlink,
  createSymlinkSync,
  ensureSymlink: createSymlink,
  ensureSymlinkSync: createSymlinkSync
};
function stringify$3(obj, { EOL = "\n", finalEOL = true, replacer = null, spaces } = {}) {
  const EOF = finalEOL ? EOL : "";
  const str = JSON.stringify(obj, replacer, spaces);
  return str.replace(/\n/g, EOL) + EOF;
}
function stripBom$1(content) {
  if (Buffer.isBuffer(content))
    content = content.toString("utf8");
  return content.replace(/^\uFEFF/, "");
}
var utils = { stringify: stringify$3, stripBom: stripBom$1 };
let _fs;
try {
  _fs = gracefulFs;
} catch (_) {
  _fs = require$$0$2;
}
const universalify = universalify$1;
const { stringify: stringify$2, stripBom } = utils;
async function _readFile(file2, options = {}) {
  if (typeof options === "string") {
    options = { encoding: options };
  }
  const fs2 = options.fs || _fs;
  const shouldThrow = "throws" in options ? options.throws : true;
  let data = await universalify.fromCallback(fs2.readFile)(file2, options);
  data = stripBom(data);
  let obj;
  try {
    obj = JSON.parse(data, options ? options.reviver : null);
  } catch (err) {
    if (shouldThrow) {
      err.message = `${file2}: ${err.message}`;
      throw err;
    } else {
      return null;
    }
  }
  return obj;
}
const readFile = universalify.fromPromise(_readFile);
function readFileSync(file2, options = {}) {
  if (typeof options === "string") {
    options = { encoding: options };
  }
  const fs2 = options.fs || _fs;
  const shouldThrow = "throws" in options ? options.throws : true;
  try {
    let content = fs2.readFileSync(file2, options);
    content = stripBom(content);
    return JSON.parse(content, options.reviver);
  } catch (err) {
    if (shouldThrow) {
      err.message = `${file2}: ${err.message}`;
      throw err;
    } else {
      return null;
    }
  }
}
async function _writeFile(file2, obj, options = {}) {
  const fs2 = options.fs || _fs;
  const str = stringify$2(obj, options);
  await universalify.fromCallback(fs2.writeFile)(file2, str, options);
}
const writeFile = universalify.fromPromise(_writeFile);
function writeFileSync(file2, obj, options = {}) {
  const fs2 = options.fs || _fs;
  const str = stringify$2(obj, options);
  return fs2.writeFileSync(file2, str, options);
}
const jsonfile$1 = {
  readFile,
  readFileSync,
  writeFile,
  writeFileSync
};
var jsonfile_1 = jsonfile$1;
const jsonFile$1 = jsonfile_1;
var jsonfile = {
  // jsonfile exports
  readJson: jsonFile$1.readFile,
  readJsonSync: jsonFile$1.readFileSync,
  writeJson: jsonFile$1.writeFile,
  writeJsonSync: jsonFile$1.writeFileSync
};
const u$2 = universalify$1.fromCallback;
const fs$4 = gracefulFs;
const path$5 = require$$1;
const mkdir = mkdirs$2;
const pathExists$1 = pathExists_1.pathExists;
function outputFile$1(file2, data, encoding, callback) {
  if (typeof encoding === "function") {
    callback = encoding;
    encoding = "utf8";
  }
  const dir = path$5.dirname(file2);
  pathExists$1(dir, (err, itDoes) => {
    if (err)
      return callback(err);
    if (itDoes)
      return fs$4.writeFile(file2, data, encoding, callback);
    mkdir.mkdirs(dir, (err2) => {
      if (err2)
        return callback(err2);
      fs$4.writeFile(file2, data, encoding, callback);
    });
  });
}
function outputFileSync$1(file2, ...args) {
  const dir = path$5.dirname(file2);
  if (fs$4.existsSync(dir)) {
    return fs$4.writeFileSync(file2, ...args);
  }
  mkdir.mkdirsSync(dir);
  fs$4.writeFileSync(file2, ...args);
}
var outputFile_1 = {
  outputFile: u$2(outputFile$1),
  outputFileSync: outputFileSync$1
};
const { stringify: stringify$1 } = utils;
const { outputFile } = outputFile_1;
async function outputJson(file2, data, options = {}) {
  const str = stringify$1(data, options);
  await outputFile(file2, str, options);
}
var outputJson_1 = outputJson;
const { stringify } = utils;
const { outputFileSync } = outputFile_1;
function outputJsonSync(file2, data, options) {
  const str = stringify(data, options);
  outputFileSync(file2, str, options);
}
var outputJsonSync_1 = outputJsonSync;
const u$1 = universalify$1.fromPromise;
const jsonFile = jsonfile;
jsonFile.outputJson = u$1(outputJson_1);
jsonFile.outputJsonSync = outputJsonSync_1;
jsonFile.outputJSON = jsonFile.outputJson;
jsonFile.outputJSONSync = jsonFile.outputJsonSync;
jsonFile.writeJSON = jsonFile.writeJson;
jsonFile.writeJSONSync = jsonFile.writeJsonSync;
jsonFile.readJSON = jsonFile.readJson;
jsonFile.readJSONSync = jsonFile.readJsonSync;
var json = jsonFile;
const fs$3 = gracefulFs;
const path$4 = require$$1;
const copy = copy$1.copy;
const remove = remove_1.remove;
const mkdirp = mkdirs$2.mkdirp;
const pathExists = pathExists_1.pathExists;
const stat$1 = stat$4;
function move$1(src, dest, opts, cb) {
  if (typeof opts === "function") {
    cb = opts;
    opts = {};
  }
  opts = opts || {};
  const overwrite = opts.overwrite || opts.clobber || false;
  stat$1.checkPaths(src, dest, "move", opts, (err, stats) => {
    if (err)
      return cb(err);
    const { srcStat, isChangingCase = false } = stats;
    stat$1.checkParentPaths(src, srcStat, dest, "move", (err2) => {
      if (err2)
        return cb(err2);
      if (isParentRoot$1(dest))
        return doRename$1(src, dest, overwrite, isChangingCase, cb);
      mkdirp(path$4.dirname(dest), (err3) => {
        if (err3)
          return cb(err3);
        return doRename$1(src, dest, overwrite, isChangingCase, cb);
      });
    });
  });
}
function isParentRoot$1(dest) {
  const parent = path$4.dirname(dest);
  const parsedPath = path$4.parse(parent);
  return parsedPath.root === parent;
}
function doRename$1(src, dest, overwrite, isChangingCase, cb) {
  if (isChangingCase)
    return rename$1(src, dest, overwrite, cb);
  if (overwrite) {
    return remove(dest, (err) => {
      if (err)
        return cb(err);
      return rename$1(src, dest, overwrite, cb);
    });
  }
  pathExists(dest, (err, destExists) => {
    if (err)
      return cb(err);
    if (destExists)
      return cb(new Error("dest already exists."));
    return rename$1(src, dest, overwrite, cb);
  });
}
function rename$1(src, dest, overwrite, cb) {
  fs$3.rename(src, dest, (err) => {
    if (!err)
      return cb();
    if (err.code !== "EXDEV")
      return cb(err);
    return moveAcrossDevice$1(src, dest, overwrite, cb);
  });
}
function moveAcrossDevice$1(src, dest, overwrite, cb) {
  const opts = {
    overwrite,
    errorOnExist: true,
    preserveTimestamps: true
  };
  copy(src, dest, opts, (err) => {
    if (err)
      return cb(err);
    return remove(src, cb);
  });
}
var move_1 = move$1;
const fs$2 = gracefulFs;
const path$3 = require$$1;
const copySync = copy$1.copySync;
const removeSync = remove_1.removeSync;
const mkdirpSync = mkdirs$2.mkdirpSync;
const stat = stat$4;
function moveSync(src, dest, opts) {
  opts = opts || {};
  const overwrite = opts.overwrite || opts.clobber || false;
  const { srcStat, isChangingCase = false } = stat.checkPathsSync(src, dest, "move", opts);
  stat.checkParentPathsSync(src, srcStat, dest, "move");
  if (!isParentRoot(dest))
    mkdirpSync(path$3.dirname(dest));
  return doRename(src, dest, overwrite, isChangingCase);
}
function isParentRoot(dest) {
  const parent = path$3.dirname(dest);
  const parsedPath = path$3.parse(parent);
  return parsedPath.root === parent;
}
function doRename(src, dest, overwrite, isChangingCase) {
  if (isChangingCase)
    return rename(src, dest, overwrite);
  if (overwrite) {
    removeSync(dest);
    return rename(src, dest, overwrite);
  }
  if (fs$2.existsSync(dest))
    throw new Error("dest already exists.");
  return rename(src, dest, overwrite);
}
function rename(src, dest, overwrite) {
  try {
    fs$2.renameSync(src, dest);
  } catch (err) {
    if (err.code !== "EXDEV")
      throw err;
    return moveAcrossDevice(src, dest, overwrite);
  }
}
function moveAcrossDevice(src, dest, overwrite) {
  const opts = {
    overwrite,
    errorOnExist: true,
    preserveTimestamps: true
  };
  copySync(src, dest, opts);
  return removeSync(src);
}
var moveSync_1 = moveSync;
const u = universalify$1.fromCallback;
var move = {
  move: u(move_1),
  moveSync: moveSync_1
};
var lib = {
  // Export promiseified graceful-fs:
  ...fs$j,
  // Export extra methods:
  ...copy$1,
  ...empty,
  ...ensure,
  ...json,
  ...mkdirs$2,
  ...move,
  ...outputFile_1,
  ...pathExists_1,
  ...remove_1
};
const { dialog: dialog$1 } = require("electron");
const path$2 = require("path");
const getFilePath = async () => {
  let filePath = await dialog$1.showOpenDialog({
    title: "选择一个文件",
    buttonLabel: "确认选择",
    // defaultPath: app.getPath('pictures'),
    // 多选文件
    // properties: ["multiSelections"],
    filters: [
      // 文件类型
      { name: "应用/文件", extensions: [] }
    ]
  });
  return filePath;
};
const getConfigFile = async () => {
  let filePath = await dialog$1.showOpenDialog({
    title: "选择配置文件",
    buttonLabel: "确认选择",
    filters: [
      { name: "JSON配置文件", extensions: ["json"] }
    ]
  });
  if (filePath == void 0)
    return;
  return lib.readJsonSync(path$2.join(filePath.filePaths[0]));
};
const writeConfigFile = async (fileName, context) => {
  let dirPath = await selectDir();
  if (dirPath == "" && dirPath == void 0)
    return;
  lib.writeJsonSync(path$2.join(dirPath, `${fileName}.json`), context);
};
const selectDir = async () => {
  let path2 = await dialog$1.showOpenDialog({
    properties: ["openDirectory"]
  }).then((result) => {
    if (!result.canceled) {
      return result.filePaths[0];
    }
  }).catch((err) => {
    console.error(err);
  });
  return path2;
};
const { SerialPort } = require("serialport");
const _SerialConnect = class _SerialConnect2 {
};
_SerialConnect.wait = null;
_SerialConnect.waitState = false;
_SerialConnect.connectState = false;
_SerialConnect.HardwarePort = {};
_SerialConnect.connectHardware = async () => {
  if (_SerialConnect.connectState)
    return new Promise((resolve2) => resolve2(true));
  let portLists = [];
  try {
    portLists = await SerialPort.list();
  } catch (err) {
    console.info(err);
    _SerialConnect.connectState = false;
    _SerialConnect.HardwarePort = {};
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
        if (err)
          return _SerialConnect.errorHandle(err);
        console.log("port open success");
      });
      port.on("error", (err) => {
        return _SerialConnect.errorHandle(err);
      });
      port.on("data", (buff) => {
        if (buff[0] == 170 && buff[1] == 187 && buff[2] == 204) {
          _SerialConnect.HardwarePort = port;
          _SerialConnect.connectState = true;
          return;
        }
        _SerialConnect.dataHandle(buff);
      });
      port.on("close", () => {
        console.info("serial close listen");
        return _SerialConnect.errorHandle();
      });
      port.write(new Uint8Array([170, 187, 204]));
      port.drain((err) => {
        if (err)
          return _SerialConnect.errorHandle(err);
        console.info("send ok");
      });
      await new Promise((resolve2) => setTimeout(resolve2, 500));
      connectCount--;
      if (!_SerialConnect.connectState) {
        _SerialConnect.HardwarePort = {};
        port.close((err) => {
          if (err)
            return _SerialConnect.errorHandle(err);
          console.info("close success");
        });
      }
    }
  }
  if (_SerialConnect.connectState) {
    console.info("connect success");
    return new Promise((resolve2) => resolve2(true));
  } else {
    console.info("no hardware input");
    return new Promise((resolve2) => resolve2(false));
  }
};
_SerialConnect.errorHandle = async (err) => {
  var _a;
  if (_SerialConnect.connectState) {
    (_a = _SerialConnect.HardwarePort) == null ? void 0 : _a.close((err2) => {
      if (err2)
        return _SerialConnect.errorHandle(err2);
      console.info("close success");
    });
  }
  _SerialConnect.connectState = false;
  _SerialConnect.HardwarePort = {};
  return new Promise((resolve2) => resolve2(false));
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
  return new Promise((resolve2) => resolve2(false));
};
_SerialConnect.dataHandle = (buff) => {
  if (buff[0] == 119) {
    _SerialConnect.waitState = true;
    console.info("data send");
  }
};
_SerialConnect.waitSign = async () => {
  await new Promise(
    (resolve2) => _SerialConnect.wait = setInterval(() => {
      if (_SerialConnect.waitState) {
        clearInterval(_SerialConnect.wait);
        _SerialConnect.wait = null;
        _SerialConnect.waitState = false;
        resolve2(true);
      }
    }, 1)
  ).catch(() => {
    return new Promise((resolve2) => resolve2(false));
  });
  return new Promise((resolve2) => resolve2(true));
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
const Store = require("electron-store");
const store = new Store();
const setItem = (name, item) => {
  store.set(name, item);
};
const getItem = (name) => {
  return store.get(name);
};
const { app, protocol, BrowserWindow, ipcMain, dialog } = require("electron");
require("path");
windowControlListener();
picDataListener();
ipcMain.on("set-item", (event, name, item) => {
  setItem(name, item);
});
ipcMain.handle("get-item", async (event, name) => {
  return await getItem(name);
});
ipcMain.on("window-create", (event, optionObj, configObj) => {
  let cw = new CreateWindow();
  cw.createWindow(optionObj, configObj);
});
ipcMain.handle("write-config", async (event, fileName, context) => {
  return await writeConfigFile(fileName, context);
});
ipcMain.handle("select-file", async () => {
  return await getFilePath();
});
ipcMain.handle("get-config", async () => {
  return await getConfigFile();
});
ipcMain.on("store-set", (event, objData) => {
  for (const cur of BrowserWindow.getAllWindows()) {
    if (cur != BrowserWindow.fromWebContents(event.sender)) {
      cur.webContents.send("store-get", objData);
    }
  }
});
ipcMain.handle("wait-sign", async () => {
  return await SerialConnect.waitSign();
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
