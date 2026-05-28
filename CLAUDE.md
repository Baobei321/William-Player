# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

William Player 是基于 uni-app 3 + Vue 3 的跨平台视频播放器，目标平台包括 Android 手机/平板、Android TV、Windows/PC 和 H5。核心能力包括天翼云盘、夸克网盘、WebDAV、Emby、影视元信息刮削、IPTV 直播、历史播放、数据同步和自动更新。

代码注释使用简体中文；变量名、函数名、类名保持英文。`@/*` 路径别名指向 `src/*`。

## 常用命令

项目使用 npm，仓库内有 `package-lock.json`。

```bash
# 开发
npm run dev:mobile   # 切换到 Android 手机/平板配置并启动 uni 开发服务
npm run dev:tv       # 切换到 Android TV 配置并启动 uni 开发服务
npm run dev:pc       # 切换到 Windows/PC 配置并启动 H5/PC 开发服务
npm run dev:h5       # 不切换平台配置，直接启动 H5 开发服务

# 构建
npm run build:mobile # 切换 mobile 配置并构建 app-plus
npm run build:tv     # 切换 tv 配置并构建 app-plus
npm run build:pc     # 切换 pc 配置并构建 H5/PC
npm run build:h5     # 不切换平台配置，直接构建 H5
```

当前 `package.json` 没有配置 `lint`、`test` 或 `typecheck` 脚本；仓库也未提供项目测试文件。需要静态检查时，可按需使用已安装的 `vue-tsc`：

```bash
npx vue-tsc --noEmit
```

## 平台切换与生成文件

`build/build.js` 是平台切换脚本。`dev:mobile`、`dev:tv`、`dev:pc` 和对应 build 命令都会先运行它，并直接重写或修改这些文件：

- `src/utils/config.js`：设置 `PLATFORM` 为 `MOBILE`、`TV` 或 `PC`。
- `src/pages.json`：从 `config-pages-json/*-pages.json` 复制目标平台页面配置。
- `src/App.vue`：从 `config-pages-json/base-app.vue` 生成；PC 端额外插入 `<router-view>`，mobile 端额外锁定竖屏。
- `src/main.js`：PC 端注册 Vue Router、SVG 图标和 Element Plus 样式；非 PC 端只注册 Pinia 和 i18n。
- `vite.config.js`：PC 端添加 `vite-plugin-svg-icons`；非 PC 端使用 uni + 自动组件导入。
- `package.json`：PC 端添加 `element-plus`、`xgplayer`、`xgplayer-hls`，非 PC 端移除这些依赖。
- `src/utils/common.js`：PC 端启用 `ipc` / `ipcApiRoute` 导入，非 PC 端注释掉。

修改这些文件前先确认当前目标平台，避免把平台切换产生的差异误当成业务修改。新增或调整手机/TV 页面时，应优先修改 `config-pages-json/mobile-pages.json` 或 `config-pages-json/tv-pages.json`，不要只改生成后的 `src/pages.json`。如果配置文件损坏，可参考 `config-pages-json/` 模板，或按 README 提示从 `develop` 分支恢复 `src/utils/config.js`。

## 架构地图

- `src/pages/mobile/`、`src/pages/tv/`、`src/pages/electron/` 分别承载手机、TV、PC 页面。
- `src/components/mobile/`、`src/components/tv/`、`src/components/electron/` 分别承载平台组件；跨平台复用逻辑通常放在 `src/hooks/` 或 `src/utils/`。
- 手机和 TV 使用 uni-app 的 `src/pages.json` 导航；PC 使用 `src/router/index.js` 的 Vue Router，并通过 `src/layout/` 提供桌面端布局。
- `.nvue` 文件主要用于 App 原生能力、高性能播放器或 TV 导航场景；`tsconfig.json` 排除了 `src/**/*.nvue`。
- `src/main.js` 是应用入口，但会被平台切换脚本重写；涉及入口逻辑时要同时检查 `build/build.js`。

## 核心入口

- 请求层：`src/network/request.js` 封装全局请求、鉴权头、token 刷新和常见响应处理；`src/network/apis.js` 聚合后端业务接口。
- 文件源与播放地址：`src/utils/common.js` 聚合 WebDAV、天翼云盘、夸克网盘等来源；WebDAV 协议能力在 `src/utils/webdav.js` 和 `src/utils/webdav-client.js`；Emby 与 TMDB 分别在 `src/utils/emby.js`、`src/utils/tmdb.js`。
- 媒体整理：`src/utils/scrape.js` 处理影视文件名解析、季集识别、时长格式化和递归刮削等逻辑。
- 媒体业务 hooks：`src/hooks/useVideoIndex.js`、`src/hooks/useVideoAll.js`、`src/hooks/userVideoDetail.js` 复用首页、列表、详情、历史播放和下载等逻辑。
- 状态管理：核心 Pinia store 位于 `src/stores/theme.js` 和 `src/stores/locale.js`；后续以 `src/stores/` 当前内容为准。
- 国际化：项目使用 `vue-i18n` v9，配置在 `src/i18n/index.js`，语言消息文件在 `src/i18n/`；切换语言需同步 locale store、vue-i18n、uni locale 和 NutUI locale。

## 播放器与平台能力

- Mobile/TV 播放器入口分别是 `src/pages/mobile/video/video-player.nvue` 和 `src/pages/tv/video/video-player.nvue`，App 端使用 `<video-view>` 原生组件，H5 回退到 `<video>`。
- PC 播放器入口是 `src/pages/electron/video/video-player.vue`，核心组件在 `src/pages/electron/video/components/mpv-player.vue` 及相关 MPV 封装。
- 播放地址通常通过 `getWebDAVUrl()`、`get189VideoUrl()`、`getQuarkVideoUrl()`、`getEmbyPlayerUrl()` 等来源函数获取。
- PC 端通过 Electron IPC 绕过浏览器侧限制；相关入口是 `src/utils/ipcRenderer.js`、`src/utils/ipcApiRoute.js`，并由 `src/utils/common.js` 的 PC 分支调用。

## 主题与样式

移动端主题支持 `light`、`dark`、`auto`，核心状态在 `src/stores/theme.js`。新增移动端页面时：

- 页面根节点使用 `src/hooks/useThemeClass.js` 返回的 `themeClass`，模板写法统一为 `:class="['page-root-class', themeClass]"`。
- 不使用 `document`、`querySelector`、`classList` 动态挂主题类；Android App 端以模板绑定 `.dark` 为准。
- 不为每个页面维护 `.xxx-dark` 这类独立深色类；颜色统一使用 `src/styles/theme-vars.scss` 中的 `var(--app-*)` 语义变量。
- NutUI props 颜色或 JS 动态颜色优先复用 `src/hooks/useThemeColors.js`。
- TabBar 页面必须调用 `src/hooks/useThemeTabbar.js`；自定义导航页可传 `useThemeTabbar({ customNav: true })`。

## 常见任务入口

- 新增页面：先确认目标平台。手机/TV 页面添加到对应 `src/pages/*/` 目录和 `config-pages-json/*-pages.json`；PC 页面添加到 `src/pages/electron/`，并按需更新 `src/router/index.js`、`src/layout/`。
- 修改播放器：Mobile/TV 先看对应 `.nvue` 播放器页和原生组件交互；PC 先看 Electron 视频页、MPV 组件和 IPC 能力。
- 修改数据源：WebDAV 看 `webdav.js` / `webdav-client.js`，Emby 看 `emby.js`，TMDB 看 `tmdb.js`，天翼云盘和夸克云盘通常从 `common.js` 入口追踪。
- 修改主题或文案：文案走 `src/i18n/`，主题色优先复用 `theme-vars.scss` 和现有 theme hooks。
- 修改 PC/Electron 能力：同时检查 `src/pages/electron/`、`src/utils/ipcRenderer.js`、`src/utils/ipcApiRoute.js`、`src/utils/common.js` 和 `build/build.js` 的 PC 分支。
- 修改自动更新：检查版本常量、更新检查逻辑和 Gitee release 资源命名是否一致。

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

运行时平台常量来自 `src/utils/config.js` 的 `PLATFORM`，由 `build/build.js` 设置。涉及云盘请求、IPC、播放器能力、页面注册或遥控器/触屏交互时，要同时考虑 `MOBILE`、`TV`、`PC` 和 H5 的差异。

## 验证建议

- 文档或纯配置说明改动不需要运行应用。
- 代码改动按触达平台运行对应命令：`npm run dev:mobile`、`npm run dev:tv`、`npm run dev:pc` 或对应 build 命令。
- 如果改动共享逻辑、请求层、类型声明或 i18n，可按需运行 `npx vue-tsc --noEmit`。
- 前端体验改动需要启动对应平台开发服务并实际走一遍目标页面；TV 交互尤其要检查焦点和遥控器路径。
