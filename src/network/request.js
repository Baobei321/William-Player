import * as CONFIG from '@/utils/config.js'
// 全局请求封装
const base_url = CONFIG.BASE_URL
// const base_url = 'http://192.168.31.15:4040/ruoyi'
// 请求超出时间
const timeout = 3000

// const noToastUrl = ['/phone/login']
const noToastUrl = []

//刷新token的方法
const refreshAccess = (params) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: base_url + '/refresh',
      method: 'post',
      header: { 'Content-Type': 'application/json' },
      data: { refreshToken: uni.getStorageSync('refreshToken') },
      timeout: timeout,
      success: (res) => {
        uni.setStorageSync('Authorization', res.data.accessToken)
        uni.setStorageSync('refreshToken', res.data.refreshToken)
        //获取到新的一对token之后，重新请求之前失败的方法
        retryFail(params).then(res1 => {
          resolve(res1)
        }).catch(err => {
          reject(err)
        })
      }
    })
  })
}

//刷新token之后，重新执行一遍401失败的接口
const retryFail = (params) => {
  let url = params.url;
  let method = params.method || "get";
  let data = params.data || {};
  let header = params.header
  header.Authorization = 'Bearer ' + uni.getStorageSync('Authorization')
  if (method == "post") {
    data = data ? JSON.stringify(data) : data;
  }
  return new Promise((resolve, reject) => {
    uni.request({
      url: base_url + url,
      method: method,
      header: header,
      data: data,
      timeout: noToastUrl.indexOf(url) > -1 ? 8000 : timeout,
      success: (res) => {
        if (res.statusCode == 200) {
          if (res.data?.code == 0 || res.data?.code == 200) {
            resolve(res.data);
          } else {
            let code = res.data?.code
            // uni.clearStorageSync()
            if (code == 404) {
              uni.showToast({
                title: '请求地址不存在...',
                duration: 2000,
              })
            } else {
              uni.showToast({
                title: res.data.msg,
                icon: 'none',
                duration: 2000,
              })
            }
            reject('接口请求错误')
          }
        } else {
          // uni.clearStorageSync()
          switch (res.statusCode) {
            case 404:
              uni.showToast({
                title: '请求地址不存在...',
                duration: 2000,
              })
              break;
            default:
              uni.showToast({
                title: '请重试...',
                icon: 'none',
                duration: 2000,
              })
              break;
          }
          reject('接口请求错误')
        }
      },
    })
  })
}

// 需要修改token，和根据实际修改请求头
export default (params) => {
  let url = params.url;
  let method = params.method || "get";
  let data = params.data || {};
  let header = {
    'Content-Type': 'application/json;charset=UTF-8',
    'Authorization': 'Bearer ' + uni.getStorageSync('Authorization'),
    'Tenant-Id': uni.getStorageSync('tenantId') || 'xxx', // avue配置相关
    ...params.header
  }
  if (method == "post") {
    data = data ? JSON.stringify(data) : data;
    header = {
      'Content-Type': 'application/json', // 自定义，跟后台约定好传什么格式的
      'Authorization': 'Bearer ' + uni.getStorageSync('Authorization'),
    };
  }
  return new Promise((resolve, reject) => {
    uni.request({
      url: base_url + url,
      method: method,
      header: header,
      data: data,
      timeout: noToastUrl.indexOf(url) > -1 ? 8000 : timeout,
      success: async (response) => {
        const res = response
        // 根据返回的状态码做出对应的操作
        //获取成功
        // console.log(res.statusCode);
        if (res.statusCode == 200) {
          if (res.data?.code == 0 || res.data?.code == 200) {
            resolve(res.data);
          } else {
            let code = res.data?.code
            // uni.clearStorageSync()
            if (code == 401) {
              refreshAccess({ ...params, header }).then(res11 => { //刷新token
                resolve(res11)
              }).catch(err => {
                reject(err)
              })
            } else if (code == 404) {
              uni.showToast({
                title: '请求地址不存在...',
                duration: 2000,
              })
              reject("接口请求错误")
            } else {
              uni.showToast({
                title: res.data.msg,
                icon: 'none',
                duration: 2000,
              })
              reject("接口请求错误")
            }
          }
        } else {
          // uni.clearStorageSync()
          switch (res.statusCode) {
            case 401:
              refreshAccess({ ...params, header }).then(res11 => { //刷新token
                resolve(res11)
              }).catch(err => {
                reject(err)
              })
              break;
            case 404:
              uni.showToast({
                title: '请求地址不存在...',
                duration: 2000,
              })
              reject("接口请求错误")
              break;
            default:
              uni.showToast({
                title: '请重试...',
                icon: 'none',
                duration: 2000,
              })
              reject("接口请求错误")
              break;
          }
        }
      },
      fail: async (err) => {
        reject(err);
      },
      complete() {
        // 不管成功还是失败都会执行
        // uni.hideLoading();
        // uni.hideToast();
      }
    });
  });
};