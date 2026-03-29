import { createClient } from './webdav-client.js'
let webdavClientInstance = null
//todo此文件目前还未使用，发现webdav模块不支持分页只能全量返回，后续可以前端分页

//创建webdav服务器实例
export const initWebDAVClient = config => {
  if (webdavClientInstance) {
    console.warn('WebDAV客户端已初始化，将返回现有实例')
    return webdavClientInstance
  }

  const { server, username, password, options = {} } = config

  if (!server) {
    throw new Error('WebDAV服务器地址不能为空')
  }

  webdavClientInstance = createClient(server, {
    username,
    password,
    ...options,
  })
  // console.log(webdavClientInstance,'webdavClientInstance');

  return webdavClientInstance
}

//获取文件列表
export const getFolder = async path => {
  //todo此处要处理成alist接口返回的形式，那么需要自己处理provider，也就是网盘提供商
  let res = await webdavClientInstance.getDirectoryContents(path)
  const typeMapping = {
    //类型映射
    'directory': 1,
  }
  res = res.map(item => {
    //将数据结构转成alist的http接口返回的形式
    return { name: item.baseName, type: typeMapping[item.type] }
  })
  return { code: 200, message: 'success', data: res }
}
