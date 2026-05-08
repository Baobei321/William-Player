# CLAUDE.md

本文档为 Claude Code (claude.ai/code) 在本项目中工作时提供指导。
# 项目规范

## 语言要求
- **代码注释**：必须使用简体中文（Chinese）编写注释。
- **命名规范**：变量名、函数名、类名保持英文。


## William Player - 视频播放器应用

一个基于 uni-app (Vue 3) 构建的跨平台视频播放器，支持 Android 手机、Android TV 和 Windows 平台。支持云盘播放（天翼云盘、夸克网盘、WebDAV）、影视刮削和 IPTV 直播。

## 构建命令

```bash
# 开发环境
npm run dev:pc        # Windows/PC 平台（使用 Vue Router）
npm run dev:mobile   # Android 手机/平板
npm run dev:tv       # Android TV

# 生产环境构建
npm run build:pc     # Windows 构建
npm run build:mobile # Android APK 安装包
npm run build:tv     # Android TV APK 安装包

# H5/Web
npm run dev:h5       # 开发服务器
npm run build:h5    # 生产环境构建
```

## 架构概览

### 平台定向结构

项目采用**一套代码，三个平台**的架构。平台相关代码按子目录组织：

```
src/
├── components/
│   ├── electron/   # PC 端专用组件（wil-player、wil-message-box、wil-popover）
│   ├── mobile/     # 手机端组件
│   └── tv/         # TV 端组件
├── pages/
│   ├── electron/   # PC 端页面（使用 Vue Router 路由）
│   ├── mobile/     # 手机端页面（使用 uni-app pages.json 导航）
│   └── tv/         # TV 端页面
└── utils/          # 平台相关工具函数
```

### 平台构建系统

`build/build.js` 脚本会自动为目标平台配置项目，会修改以下文件：

| 文件 | 修改内容 |
|------|-----------------|
| `src/utils/config.js` | 设置 `PLATFORM` 常量（PC/MOBILE/TV）|
| `src/pages.json` | 替换为平台专属页面配置模板 |
| `src/App.vue` | 添加平台代码（PC：router-view，手机：屏幕方向锁定）|
| `src/main.js` | PC 端添加 Vue Router + Element Plus；非 PC 端使用简化配置 |
| `vite.config.js` | PC 端添加 SVG 图标插件 |
| `package.json` | PC 端添加 `element-plus`、`xgplayer`、`xgplayer-hls` 依赖 |
| `src/utils/common.js` | PC 端启用 IPC 导入用于 Electron 通信 |

### 核心技术栈

- **框架**：uni-app 3.0（Vue 3 + TypeScript）
- **状态管理**：Pinia
- **UI 组件库**：NutUI-uniapp
- **云存储**：天翼云盘、夸克网盘、WebDAV 客户端
- **影视刮削**：TMDB API 集成
- **播放器**：xgplayer（PC 端）、原生 video（手机/TV 端）
- **桌面端**：Electron IPC 用于原生通信

### 云存储集成

位于 `src/utils/` 目录：
- `webdav.js` / `webdav-client.js` - WebDAV 协议支持
- `emby.js` - Emby 媒体服务器集成
- `config.js` 中的配置端点用于天翼云盘和夸克网盘 API

### 网络层

`src/network/request.js` - 全局请求封装，处理以下功能：
- JWT token 管理及自动刷新
- Authorization 请求头
- Tenant-Id 支持
- 401 状态码刷新流程

## 开发注意事项

### 如果项目构建失败

如果配置文件损坏，可从 `develop` 分支获取 `src/utils/config.js` 的代码，或参考 `config-pages-json/` 目录下的模板文件。

### 代码中的平台检测

使用条件编译注释：
```javascript
// #ifdef PC
// 仅 PC 端代码
// #endif

// #ifdef APP-PLUS
// 仅手机端原生App代码
// #endif
```

### 添加新页面

1. 手机/TV 端：添加到 `pages.json`
2. PC 端：添加到 `src/router/index.js`
3. 或者先运行平台构建脚本生成正确的配置文件