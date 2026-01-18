## key-pad-application 

此开源代码版本为早期开发版本，可能会有些问题，代码也不是很简洁或优雅，还请多多包涵。

最新版本为闭源，并不对外公开，谢谢理解。

### 安装项目包

可能会遇到安装包失败的问题，可以复制错误信息让 AI 提供解决方式或者在网上搜索，对于 npm 或 pnpm 网上的教程也很多，是一个包管理器，下载安装 node.js 就有的

```
pnpm install

#or 

npm install
```

### 开发软件

进入开发调试的模式，会弹出一个页面窗口可以直观的进行修改

```
pnpm start
```

### 打包 Windows 软件

会在 dist_electron 文件夹中生成一个 `exe` 的安装包

```
pnpm electron:build
```
