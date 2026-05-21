# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

William Player 是基于 uni-app 3 + Vue 3 的跨平台视频播放器，目标平台包括 Android 手机/平板、Android TV 和 Windows/PC。应用支持天翼云盘、夸克网盘、WebDAV、Emby、影视元信息刮削、IPTV 直播、历史播放、数据同步和自动更新等功能。

## 语言与命名

- 代码注释使用简体中文。
- 变量名、函数名、类名保持英文。

## 常用命令

```bash
# 开发
npm run dev:mobile   # Android 手机/平板配置并启动 uni 开发服务
npm run dev:tv       # Android TV 配置并启动 uni 开发服务
npm run dev:pc       # Windows/PC 配置并启动 H5/PC 开发服务
npm run dev:h5       # 不切换平台配置，直接启动 H5 开发服务

# 构建
npm run build:mobile # 切换 mobile 配置并构建 app-plus
npm run build:tv     # 切换 tv 配置并构建 app-plus
npm run build:pc     # 切换 pc 配置并构建 H5/PC
npm run build:h5     # 不切换平台配置，直接构建 H5
```

当前 `package.json` 没有配置 lint、test 或单测脚本；仓库也未提供项目测试文件。需要静态检查时可按需使用已安装的 `vue-tsc`，例如：

```bash
npx vue-tsc --noEmit
```

## 平台构建与可变文件

`build/build.js` 是平台切换脚本，`dev:mobile`、`dev:tv`、`dev:pc` 和对应 build 命令都会先执行它。脚本会直接重写或修改这些文件：

- `src/utils/config.js`：设置 `PLATFORM` 为 `MOBILE`、`TV` 或 `PC`。
- `src/pages.json`：从 `config-pages-json/*-pages.json` 复制目标平台页面配置。
- `src/App.vue`：从 `config-pages-json/base-app.vue` 生成，PC 端额外插入 `<router-view>`，mobile 端额外锁定竖屏。
- `src/main.js`：PC 端注册 Vue Router、SVG 图标和 Element Plus 样式；非 PC 端只注册 Pinia。
- `vite.config.js`：PC 端添加 `vite-plugin-svg-icons`；非 PC 端使用 uni + 自动组件导入。
- `package.json`：PC 端添加 `element-plus`、`xgplayer`、`xgplayer-hls`，非 PC 端移除这些依赖。
- `src/utils/common.js`：PC 端启用 `ipc` / `ipcApiRoute` 导入，非 PC 端注释掉。

修改以上文件前先确认当前目标平台，避免把平台切换生成的差异误当成业务修改。如果配置文件损坏，可参考 `config-pages-json/` 模板，或按 README 提示从 `develop` 分支恢复 `src/utils/config.js`。

## 架构结构

- `src/pages/mobile/`、`src/pages/tv/`、`src/pages/electron/` 分别承载手机、TV、PC 页面。
- `src/components/mobile/`、`src/components/tv/`、`src/components/electron/` 分别承载平台组件；跨平台复用逻辑通常放在 `src/hooks/` 或 `src/utils/`。
- 手机和 TV 使用 uni-app 的 `src/pages.json` 导航；PC 使用 `src/router/index.js` 的 Vue Router，并通过 `src/layout/` 提供桌面端布局。
- `.nvue` 文件主要用于 App 原生能力或高性能播放器/导航场景，`tsconfig.json` 明确排除了 `src/**/*.nvue`。
- `@/*` 路径别名指向 `src/*`。

## 核心模块

- `src/network/request.js`：全局请求封装，使用 `CONFIG.BASE_URL`，自动附带 Authorization 与 Tenant-Id 头。内置 token 刷新机制——401 时调用 `/refresh` 刷新，刷新失败则调用 `loginTour()` 游客登录。处理 401/403/404 响应，响应成功判断条件为 `res.data.code === 0 || res.data.code === 200`。
- `src/network/apis.js`：集中封装后端业务接口，按功能模块组织（login、user、account、tmdb、share data、oper logs）。
- `src/utils/common.js`：聚合 WebDAV、天翼云盘、夸克网盘等文件源登录、目录、播放地址和用户信息能力；PC 分支通过 Electron IPC 绕过浏览器侧限制。
- `src/utils/webdav.js`、`src/utils/webdav-client.js`：提供 WebDAV 协议能力。
- `src/utils/emby.js`：封装 Emby 媒体服务器能力。
- `src/utils/tmdb.js`：TMDB API 封装，支持电影/电视剧搜索、详情查询、演员表获取，语言自动映射 app locale 到 TMDB 格式。
- `src/utils/scrape.js`：处理影视文件名解析、季集识别、时长格式化、递归刮削等媒体整理逻辑。
- `src/hooks/useVideoIndex.js`、`src/hooks/useVideoAll.js`、`src/hooks/userVideoDetail.js` 等组合式函数复用媒体首页、列表和详情逻辑。

## 状态管理

项目仅使用两个 Pinia store：

- `src/stores/theme.js`：主题管理，`mode` 为 'light'、'dark' 或 'auto'，`resolvedTheme` 为实际解析结果。`setThemeUi(mode)` 持久化主题，`_applyNativeUi()` 通过 `plus.nativeUI.setUIStyle()` 处理 App 原生 UI。
- `src/stores/locale.js`：国际化管理，支持 'zh-Hans'、'en'、'ko'、'ja' 四种语言。`setLocale(locale)` 切换语言并同步到 vue-i18n、uni.setLocale 和 NutUI。

## 国际化

使用 `vue-i18n` v9（不是 uni-app 内置 i18n），默认 locale 为 'zh-Hans'。配置在 `src/i18n/index.js`，消息文件位于 `src/locale/` 目录。切换语言时需同步调用 `localeStore.applyLocale({ syncUniLocale: true })` 以更新所有层级的 locale。

## 视频播放器架构

三个平台各自使用不同的播放器实现：

- **Mobile/TV**：`src/pages/mobile/video/video-player.nvue` 和 `src/pages/tv/video/video-player.nvue` 使用 `<video-view>` 原生组件（Android App 端），H5 回退到 `<video>` 组件。记录播放进度（iOS 每 5 秒、Android 实时），支持自动播放下一集。
- **PC**：`src/pages/electron/video/video-player.vue` 使用 `<mpv-player>` 自定义组件（基于 xgplayer 封装 MPV）。
- 播放地址获取：各云盘服务通过 `getWebDAVUrl()`、`get189VideoUrl()`、`getQuarkVideoUrl()`、`getEmbyPlayerUrl()` 等函数获取可播放 URL。

## 数据同步机制

- **局域网同步**：使用 `TcpModule` 原生插件，实现 TCP 服务器（端口 1025）和客户端。扫码传输 `{ type: "dataSync", port: "ip:port" }`。
- **后端 API 同步**：局域网失败时回退到后端 API，通过 `setShareData()` 上传、`getShareData()` 轮询（每 10 秒）、`deleteShareData()` 清理。
- 同步数据包括：userInfo、muluData、sourceList、historyPlay。

## 自动更新机制

检查更新通过 Gitee API：`https://gitee.com/api/v5/repos/waylon-chen/William-Player/releases/latest`，下载链接从 `assets` 中查找 `app-mobile.apk`。版本比较使用 `compareVersions()` 按点分割数值比较。

## 样式与主题

移动端主题支持 `light`、`dark`、`auto`，核心状态在 `src/stores/theme.js`：

- 本地持久化 key 为 `theme`。
- `mode` 表示用户选择，`resolvedTheme` 表示实际浅色/深色结果。
- `auto` 通过 `uni.getSystemInfoSync().theme` 初始化，并通过 `uni.onThemeChange` 跟随系统变化。
- `src/App.vue` 在 `onLaunch` 调用 `themeStore.init()`，在 `onShow` 调用 `themeStore.applyTheme()`。
- 设置入口在 `src/pages/mobile/mine/settings.vue` 的“显示设置”。

页面接入规则：

- 新移动端页面根节点使用 `src/hooks/useThemeClass.js` 返回的 `themeClass`，模板写法统一为 `:class="['page-root-class', themeClass]"`。
- 不使用 `document`、`querySelector`、`classList` 动态挂主题类；Android App 端以模板绑定 `.dark` 为准。
- 不为每个页面维护 `.xxx-dark` 这类独立深色类；颜色统一使用 `src/styles/theme-vars.scss` 中的 `var(--app-*)` 语义变量。
- NutUI props 颜色或 JS 动态颜色优先复用 `src/hooks/useThemeColors.js`。
- TabBar 页面必须调用 `src/hooks/useThemeTabbar.js`；自定义导航页可传 `useThemeTabbar({ customNav: true })`。
- App 原生 UI 由 `themeStore.applyTheme()` 内部的 `plus.nativeUI.setUIStyle()` 处理。

## 添加页面

- 手机/TV 页面：添加到对应 `config-pages-json/mobile-pages.json` 或 `config-pages-json/tv-pages.json`，再运行目标平台命令生成 `src/pages.json`。
- PC 页面：添加到 `src/router/index.js`，必要时补充 `src/layout/` 或 `src/pages/electron/` 入口。
- 不要只改生成后的 `src/pages.json`，否则下一次平台切换会被模板覆盖。

## 条件编译与平台判断

使用 uni-app 条件编译区分平台能力：

```javascript
// #ifdef PC
// PC 端代码
// #endif

// #ifdef APP-PLUS
// App 原生端代码
// #endif
```

运行时平台常量来自 `src/utils/config.js` 的 `PLATFORM`，由构建脚本设置。涉及云盘请求、IPC、播放器能力或页面注册时，要同时考虑 `MOBILE`、`TV`、`PC` 三个平台的差异。

## PC 端 IPC 与 Electron 集成

PC 端通过 Electron IPC 绕过浏览器 CORS 限制访问云盘 API：

- `src/utils/ipcRenderer.js`：Electron IPC 包装器，通过 `window.require('electron').ipcRenderer` 调用主进程。
- `src/utils/ipcApiRoute.js`：定义可调用的 API 路由（如 `ipcApiRoute.httpRequest`），在 `src/utils/common.js` 中用于天翼云盘、夸克网盘等需要跨域的请求。
- PC 端请求模式：`ipc.invoke(ipcApiRoute.httpRequest, { url, method, header, options })`。

## 核心配置常量

`src/utils/config.js` 中定义的关键常量：

- `VERSION` / `updateTime`：版本号和更新时间
- `TOKEN_KEY` / `USER_KEY` / `OPEN_ID` / `USER_ID`：本地存储键名
- `BASE_URL`：后端 API 地址
- `IMG_DOMAIN`：TMDB 图片域名 `https://image.tmdb.org`
- 云盘 API 地址：Folder189Url、Video189Url、QuarkFolderUrl、QuarkVideoUrl、QuarkResolutionUrl
