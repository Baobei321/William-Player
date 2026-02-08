
/**
 * 主进程与渲染进程通信频道定义
 * Definition of communication channels between main process and rendering process
 */
const ipcApiRoute = {
  test: 'controller.client.test',
  curl: 'controller.client.curl',
  cache: 'controller.client.cache',
  getCache: 'controller.client.getCache',
  changeWindowSize:'controller.window.changeWindowSize',
  windowAction:'controller.window.windowAction',
  openExternal:'controller.window.openExternal',
  createWindow: 'controller.window.createWindow',
  createMpv: 'controller.window.createMpv',
  closeMpv: 'controller.window.closeMpv',
  httpRequest: 'controller.http.request',
  mpvConnect: 'controller.mpv.connectToMpv',
  mpvTrackList:'controller.mpv.getTrackList',
}

export {
  ipcApiRoute
}

