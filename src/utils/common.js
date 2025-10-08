import * as CONFIG from '@/utils/config.js'
// import { ipc } from "@/utils/ipcRenderer";
// import { ipcApiRoute } from "@/utils/ipcApiRoute";
//webdav
const getFolder = (data, webdavInfo) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: webdavInfo.protocol + "://" + webdavInfo.address + ":" + webdavInfo.port + "/api/fs/list",
      data: JSON.stringify({ ...data, page: 1, per_page: 1000, refresh: false }),
      timeout: 10000,
      method: "POST",
      header: {
        Authorization: webdavInfo.token,
        "Content-Type": "application/json",
      },
      success: (res) => {
        resolve(res.data);
      },
      fail: (error) => {
        reject(error);
      },
    });
  });
};

//webdav获取视频链接
const getWebDAVUrl = (data, webdavInfo) => {
  let requestUrl = webdavInfo.protocol + "://" + webdavInfo.address + ":" + webdavInfo.port + "/api/fs/get";
  return new Promise((resolve, reject) => {
    uni.request({
      url: requestUrl,
      data: JSON.stringify({
        path: "/" + data.path,
        password: "",
      }),
      timeout: 10000,
      method: "POST",
      header: {
        Authorization: webdavInfo.token,
        "Content-Type": "application/json",
      },
      success: (res) => {
        resolve(res.data);
      },
      fail: (error) => {
        reject(error);
      },
    });
  });
}

//webdav登录
const loginUser = (webdavInfo) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: webdavInfo.protocol +
        "://" +
        webdavInfo.address +
        ":" +
        webdavInfo.port +
        "/api/auth/login",
      data: JSON.stringify({
        username: webdavInfo.username,
        password: webdavInfo.password,
      }),
      timeout: 10000,
      method: "POST",
      header: { "Content-Type": "application/json" },
      success: (res) => {
        resolve(res.data);
      },
      fail: (error) => {
        reject(error);
      },
    });
  });
};

//天翼云盘
const get189Folder = (data, cookieInfo) => {
  let cookie = { JSESSIONID: cookieInfo.JSESSIONID, COOKIE_LOGIN_USER: cookieInfo.COOKIE_LOGIN_USER }
  let cookieStr = ''
  let arr = Object.keys(cookie)
  arr.forEach((item, index) => {
    let str = ''
    if (index == arr.length - 1) {
      str = `${item}=${cookie[item]}`
      cookieStr = cookieStr + str
    } else {
      str = `${item}=${cookie[item]};`
      cookieStr = cookieStr + str
    }
  })
  return new Promise((resolve, reject) => {
    if (CONFIG.PLATFORM === 'PC') {
      ipc.invoke(ipcApiRoute.httpRequest, {
        url: `${CONFIG.Folder189Url}&folderId=${data.folderId}&pageNum=${data.pageNum || 1}&pageSize=${data.pageSize || 1000}`,
        method: "GET",
        header: {
          "Accept": "application/json;charset=UTF-8",
          "Accept-Language": 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
          'Connection': 'keep-alive',
          'Cookie': cookieStr,
          "Host": 'cloud.189.cn',
          'Priority': 'u=0',
          // 'Referer': 'https://cloud.189.cn/web/main/file/folder/-11',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'Sign-Type': '1',
          'TE': 'trailers',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0'
        },
        options: {
          timeout: 3000,
        }
      }).then(res => {
        if (res.code === 200) {
          resolve(res.data)
        } else {
          reject(res)
        }
      }).catch(error => {
        reject(error)
      })
    } else {
      uni.request({
        url: `${CONFIG.Folder189Url}&folderId=${data.folderId}&pageNum=${data.pageNum || 1}&pageSize=${data.pageSize || 1000}`,
        timeout: 3000,
        method: "GET",
        header: {
          "Accept": "application/json;charset=UTF-8",
          "Accept-Language": 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
          'Connection': 'keep-alive',
          'Cookie': cookieStr,
          "Host": 'cloud.189.cn',
          'Priority': 'u=0',
          // 'Referer': 'https://cloud.189.cn/web/main/file/folder/-11',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'Sign-Type': '1',
          'TE': 'trailers',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0'
        },
        success: (res) => {
          resolve(res.data);
        },
        fail: (error) => {
          reject(error);
        },
      });
    }
  });
}

//天翼云盘获取视频链接
const get189VideoUrl = (data, cookieInfo) => {
  let cookieStr = "";
  let randomDigits = "";
  for (let i = 0; i < 16; i++) {
    randomDigits += Math.floor(Math.random() * 10); // 生成0-9的随机数
  }
  let cookie = { JSESSIONID: cookieInfo.JSESSIONID, COOKIE_LOGIN_USER: cookieInfo.COOKIE_LOGIN_USER };
  let arr = Object.keys(cookie);
  arr.forEach((item, index) => {
    let str = "";
    if (index == arr.length - 1) {
      str = `${item}=${cookie[item]}`;
      cookieStr = cookieStr + str;
    } else {
      str = `${item}=${cookie[item]};`;
      cookieStr = cookieStr + str;
    }
  });
  return new Promise((resolve, reject) => {
    if (CONFIG.PLATFORM === 'PC') {
      ipc.invoke(ipcApiRoute.httpRequest, {
        url: `${CONFIG.Video189Url}?noCache=0.${randomDigits}&fileId=${data.folderFileId}&type=2`,
        method: "GET",
        header: {
          Accept: "application/json;charset=UTF-8",
          "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
          Connection: "keep-alive",
          Cookie: cookieStr,
          Host: "cloud.189.cn",
          Priority: "u=0",
          // Referer: "https://cloud.189.cn/web/main/file/folder/-11",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "Sign-Type": "1",
          TE: "trailers",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0",
        },
        options: {
          timeout: 5000,
        }
      }).then(res => {
        if (res.code === 200) {
          resolve(res.data)
        } else {
          reject(res)
        }
      }).catch(error => {
        reject(error)
      })
    } else {
      uni.request({
        url: `${CONFIG.Video189Url}?noCache=0.${randomDigits}&fileId=${data.folderFileId}&type=2`,
        timeout: 5000,
        method: "GET",
        header: {
          Accept: "application/json;charset=UTF-8",
          "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
          Connection: "keep-alive",
          Cookie: cookieStr,
          Host: "cloud.189.cn",
          Priority: "u=0",
          // Referer: "https://cloud.189.cn/web/main/file/folder/-11",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "Sign-Type": "1",
          TE: "trailers",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0",
        },
        success: (res) => {
          resolve(res.data);
        },
        fail: (error) => {
          reject(error);
        },
      });
    }
  });
}

//天翼云盘获取用户信息
const get189User = (obj) => {
  let randomDigits = "";
  for (let i = 0; i < 16; i++) {
    randomDigits += Math.floor(Math.random() * 10); // 生成0-9的随机数
  }
  return new Promise((resolve, reject) => {
    if (CONFIG.PLATFORM === 'PC') {
      ipc.invoke(ipcApiRoute.httpRequest, {
        url: `${CONFIG.User189Url}?noCache=0.${randomDigits}`,
        method: 'GET',
        header: {
          Accept: "application/json;charset=UTF-8",
          "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
          Connection: "keep-alive",
          Cookie: `JSESSIONID=${obj.JSESSIONID};COOKIE_LOGIN_USER=${obj.COOKIE_LOGIN_USER}`,
          Host: "cloud.189.cn",
          Priority: "u=0",
          Referer: "https://cloud.189.cn/web/main/file/folder/-11",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          TE: "trailers",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0",
        },
        options: {
          timeout: 3000,
        }
      }).then(res => {
        if (res.code === 200) {
          resolve(res.data)
        } else {
          reject(res)
        }
      }).catch(error => {
        reject(error)
      })
    } else {
      uni.request({
        url: `${CONFIG.User189Url}?noCache=0.${randomDigits}`,
        timeout: 3000,
        header: {
          Accept: "application/json;charset=UTF-8",
          "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
          Connection: "keep-alive",
          Cookie: `JSESSIONID=${obj.JSESSIONID};COOKIE_LOGIN_USER=${obj.COOKIE_LOGIN_USER}`,
          Host: "cloud.189.cn",
          Priority: "u=0",
          Referer: "https://cloud.189.cn/web/main/file/folder/-11",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          TE: "trailers",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0",
        },
        success: (res) => {
          resolve(res.data)
        },
        fail: (error) => {
          reject(error);
        },
      });
    }
  })
}

//天翼云盘获取文件下载链接
const get189DownloadUrl = (data, cookieInfo) => {
  let cookie = { JSESSIONID: cookieInfo.JSESSIONID, COOKIE_LOGIN_USER: cookieInfo.COOKIE_LOGIN_USER }
  let randomDigits = "";
  for (let i = 0; i < 16; i++) {
    randomDigits += Math.floor(Math.random() * 10); // 生成0-9的随机数
  }
  let cookieStr = ''
  let arr = Object.keys(cookie)
  arr.forEach((item, index) => {
    let str = ''
    if (index == arr.length - 1) {
      str = `${item}=${cookie[item]}`
      cookieStr = cookieStr + str
    } else {
      str = `${item}=${cookie[item]};`
      cookieStr = cookieStr + str
    }
  })
  return new Promise((resolve, reject) => {
    if (CONFIG.PLATFORM === 'PC') {
      ipc.invoke(ipcApiRoute.httpRequest, {
        url: `${CONFIG.Download189Url}?noCache=0.${randomDigits}&fileId=${data.folderFileId}`,
        method: "GET",
        header: {
          Accept: "application/json;charset=UTF-8",
          "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
          Connection: "keep-alive",
          Cookie: cookieStr,
          Host: "cloud.189.cn",
          Priority: "u=0",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "Sign-Type": "1",
          TE: "trailers",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0",
        },
        options: {
          timeout: 5000,
        }
      }).then(res => {
        if (res.code === 200) {
          resolve(res.data)
        } else {
          reject(res)
        }
      }).catch(error => {
        reject(error)
      })
    } else {
      uni.request({
        url: `${CONFIG.Download189Url}?noCache=0.${randomDigits}&fileId=${data.folderFileId}`,
        timeout: 5000,
        method: "GET",
        header: {
          Accept: "application/json;charset=UTF-8",
          "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
          Connection: "keep-alive",
          Cookie: cookieStr,
          Host: "cloud.189.cn",
          Priority: "u=0",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "Sign-Type": "1",
          TE: "trailers",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0",
        },
        success: (res) => {
          resolve(res.data);
        },
        fail: (error) => {
          reject(error);
        },
      });
    }
  });
}

//夸克网盘
const getQuarkFolder = (data, cookieInfo) => {
  let cookieStr = cookieInfo.Cookie;
  return new Promise((resolve, reject) => {
    if (CONFIG.PLATFORM === 'PC') {
      ipc.invoke(ipcApiRoute.httpRequest, {
        url: `${CONFIG.QuarkFolderUrl}&pdir_fid=${data.fid}&_page=${data.pageNum || 1}&_size=${data.pageSize || 1000}`,
        method: "GET",
        header: {
          "Accept-Language": 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
          'Connection': 'Keep-Alive',
          'Cookie': cookieStr,
          "Host": 'drive-pc.quark.cn',
          'Referer': 'https://pan.quark.cn/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) quark-cloud-drive/3.2.7 Chrome/100.0.4896.160 Electron/18.3.5.17-1a44cfa97d Safari/537.36 Channel/pckk_other_ch'
        },
        options: {
          timeout: 3000,
        }
      }).then(res => {
        if (res.code === 200) {
          resolve(res.data)
        } else {
          reject(res)
        }
      }).catch(error => {
        reject(error)
      })
    } else {
      uni.request({
        url: `${CONFIG.QuarkFolderUrl}&pdir_fid=${data.fid}&_page=${data.pageNum || 1}&_size=${data.pageSize || 1000}`,
        timeout: 3000,
        method: "GET",
        header: {
          "Accept-Language": 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
          'Connection': 'Keep-Alive',
          'Cookie': cookieStr,
          "Host": 'drive-pc.quark.cn',
          'Referer': 'https://pan.quark.cn/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) quark-cloud-drive/3.2.7 Chrome/100.0.4896.160 Electron/18.3.5.17-1a44cfa97d Safari/537.36 Channel/pckk_other_ch'
        },
        success: (res) => {
          resolve(res.data);
        },
        fail: (error) => {
          reject(error);
        },
      });
    }
  });
}

//夸克网盘获取视频或者文件下载链接
const getQuarkVideoUrl = (data, cookieInfo) => {
  return new Promise((resolve, reject) => {
    if (CONFIG.PLATFORM === 'PC') {
      ipc.invoke(ipcApiRoute.httpRequest, {
        url: CONFIG.QuarkVideoUrl,
        timeout: 5000,
        data: JSON.stringify({ fids: [data.folderFileId], speedup_session: "" }),
        method: "POST",
        header: {
          "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
          Connection: "keep-alive",
          "Content-Type": "application/json;charset=utf-8",
          Cookie: cookieInfo.Cookie,
          Host: "drive-pc.quark.cn",
          Referer: "https://pan.quark.cn/",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) quark-cloud-drive/3.2.7 Chrome/100.0.4896.160 Electron/18.3.5.17-1a44cfa97d Safari/537.36 Channel/pckk_other_ch",
        },
        options: {
          timeout: 5000,
        }
      }).then(res => {
        if (res.code === 200) {
          resolve(res.data)
        } else {
          reject(res)
        }
      }).catch(error => {
        reject(error)
      })
    } else {
      uni.request({
        url: CONFIG.QuarkVideoUrl,
        timeout: 5000,
        data: JSON.stringify({ fids: [data.folderFileId], speedup_session: "" }),
        method: "POST",
        header: {
          "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
          Connection: "keep-alive",
          "Content-Type": "application/json;charset=utf-8",
          Cookie: cookieInfo.Cookie,
          Host: "drive-pc.quark.cn",
          Referer: "https://pan.quark.cn/",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) quark-cloud-drive/3.2.7 Chrome/100.0.4896.160 Electron/18.3.5.17-1a44cfa97d Safari/537.36 Channel/pckk_other_ch",
        },
        success: (res) => {
          resolve(res.data);
        },
        fail: (error) => {
          reject(error);
        },
      });
    }
  });
}

//夸克网盘获取不同清晰度的视频链接
const getQuarkResolutionUrl = (data, cookieInfo) => {
  return new Promise((resolve, reject) => {
    if (CONFIG.PLATFORM === 'PC') {
      ipc.invoke(ipcApiRoute.httpRequest, {
        url: CONFIG.QuarkResolutionUrl,
        data: JSON.stringify({ fid: data.folderFileId, resolutions: 'normal,low,high,super,2k,4k', supports: "fmp4,m3u8" }),
        method: "POST",
        header: {
          "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
          Connection: "keep-alive",
          "Content-Type": "application/json;charset=utf-8",
          Cookie: cookieInfo.Cookie,
          Host: "drive-pc.quark.cn",
          Referer: "https://pan.quark.cn/",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) quark-cloud-drive/3.2.7 Chrome/100.0.4896.160 Electron/18.3.5.17-1a44cfa97d Safari/537.36 Channel/pckk_other_ch",
        },
        options: {
          timeout: 5000,
        }
      }).then(res => {
        if (res.code === 200) {
          resolve(res.data)
        } else {
          reject(res)
        }
      }).catch(error => {
        reject(error)
      })
    } else {
      uni.request({
        url: CONFIG.QuarkResolutionUrl,
        timeout: 5000,
        data: JSON.stringify({ fid: data.folderFileId, resolutions: 'normal,low,high,super,2k,4k', supports: "fmp4,m3u8" }),
        method: "POST",
        header: {
          "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
          Connection: "keep-alive",
          "Content-Type": "application/json;charset=utf-8",
          Cookie: cookieInfo.Cookie,
          Host: "drive-pc.quark.cn",
          Referer: "https://pan.quark.cn/",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) quark-cloud-drive/3.2.7 Chrome/100.0.4896.160 Electron/18.3.5.17-1a44cfa97d Safari/537.36 Channel/pckk_other_ch",
        },
        success: (res) => {
          resolve(res.data);
        },
        fail: (error) => {
          reject(error);
        },
      });
    }
  });
}

//夸克网盘获取用户信息
const getQuarkUser = (obj) => {
  let cookieStr = obj.Cookie;
  return new Promise((resolve, reject) => {
    uni.request({
      url: CONFIG.QuarkUserUrl,
      header: {
        "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
        Connection: "Keep-Alive",
        'Cookie': cookieStr,
        "Host": 'pan.quark.cn',
        Referer: "https://pan.quark.cn/list",
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) quark-cloud-drive/3.2.7 Chrome/100.0.4896.160 Electron/18.3.5.17-1a44cfa97d Safari/537.36 Channel/pckk_other_ch'
      },
      success: (res) => {
        resolve(res.data)
      },
      fail: (error) => {
        reject(error);
      },
    });
  })

}

//获取第几季的详情
const getTvSeason = (data) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `https://api.tmdb.org/3/tv/${data.movieTvId}/season/${data.season}`,
      data: {
        language: "zh-CN",
        api_key: uni.getStorageSync("settingData").tmdbKey,
      },
      method: "GET",
      header: {
        "Content-Type": "application/json",
      },
      success: (res) => {
        resolve(res.data);
      },
      fail: (error) => {
        reject(error);
      }
    });
  });
};
//通过tmdb接口获取更详细的信息
const getMovieTvById = (data, type) => {
  let url = "";
  let obj = JSON.parse(JSON.stringify(data));
  if (type == "movie") {
    url = `https://api.tmdb.org/3/movie/${obj.movieTvId}`;
  } else if (type == "tv") {
    url = `https://api.tmdb.org/3/tv/${obj.movieTvId}`;
  }
  delete obj.movieTvId;
  return new Promise((resolve) => {
    uni.request({
      url: url,
      data: {
        ...obj,
        language: "zh-CN",
        api_key: uni.getStorageSync("settingData").tmdbKey,
      },
      method: "GET",
      header: {
        "Content-Type": "application/json",
      },
      success: (res) => {
        resolve(res.data);
      },
    });
  });
};

// //设置tmdb图片的域名
// const setTmdbImgDomain = () => {
//   uni.requireNativePlugin(NetworkModule);
//   NetworkModule.request(
//     {
//       url: 'https://media.themoviedb.org',
//       timeout: 5000,
//       method: "GET",
//     },
//     (res) => {
//       uni.setStorageSync('imgDomain', res.location);
//     },
//     (error) => { }
//   );
// }

//获取剪切板的内容，是否是分享链接，是的话弹窗弹窗，看看是不是要跳到资源保存页面
const getCutContent = () => {
  return new Promise((resolve, reject) => {
    uni.getClipboardData({
      success: (res) => {
        const urlRegex = /(https?:\/\/[^\s\u4e00-\u9fa5，。；！？、]+)/g;
        const urls = res.data.match(urlRegex); // ["https://cloud.189.cn/t/uMfaErJFFrm2"]
        if (urls && (urls[0].startsWith("https://cloud.189.cn/") || urls[0].startsWith("https://pan.quark.cn/"))) {
          if (uni.getStorageSync('shareUrl') == urls[0]) {
            resolve(null)
          } else {
            uni.setStorageSync('shareUrl', urls[0])
            resolve(urls[0])
          }
        } else {
          resolve(null)
        }
      },
      fail: () => {
        resolve(null)
      }
    })
  })
}

export {
  getFolder, getWebDAVUrl, loginUser, get189Folder, get189VideoUrl, get189User, get189DownloadUrl, getQuarkFolder, getQuarkVideoUrl,
  getQuarkResolutionUrl, getQuarkUser, getTvSeason, getMovieTvById, getCutContent
};
