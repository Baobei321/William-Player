import * as CONFIG from '@/utils/config.js'

//webdav
const getFolder = (data, webdavInfo) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: "http://" + webdavInfo.address + ":" + webdavInfo.port + "/api/fs/list",
      data: JSON.stringify({ ...data, page: 1, per_page: 100, refresh: false }),
      timeout: 3000,
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
  let requestUrl = "http://" + webdavInfo.address + ":" + webdavInfo.port + "/api/fs/get";
  return new Promise((resolve, reject) => {
    uni.request({
      url: requestUrl,
      data: JSON.stringify({
        path: "/" + data.path,
        password: "",
      }),
      timeout: 5000,
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
      url:
        "http://" +
        webdavInfo.address +
        ":" +
        webdavInfo.port +
        "/api/auth/login",
      data: JSON.stringify({
        username: webdavInfo.username,
        password: webdavInfo.password,
      }),
      timeout: 3000,
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
    uni.request({
      url: `${CONFIG.Folder189Url}&folderId=${data.folderId}`,
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
  });
}

//天翼云盘获取用户信息
const get189User = (obj) => {
  let randomDigits = "";
  for (let i = 0; i < 16; i++) {
    randomDigits += Math.floor(Math.random() * 10); // 生成0-9的随机数
  }
  return new Promise((resolve, reject) => {
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
  })
}

//夸克网盘
const getQuarkFolder = (data, cookieInfo) => {
  let cookieStr = cookieInfo.Cookie;
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${CONFIG.QuarkFolderUrl}&pdir_fid=${data.fid}`,
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
  });
}

//夸克网盘获取视频链接
const getQuarkVideoUrl = (data, cookieInfo) => {
  return new Promise((resolve, reject) => {
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
  });
}

//夸克网盘获取不同清晰度的视频链接
const getQuarkResolutionUrl = (data, cookieInfo) => {
  return new Promise((resolve, reject) => {
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

//处理秒
const handleSecond = (val) => {
  let time = ''
  if (+val < 60) {
    let second = val >= 10 ? val : '0' + val
    time = `00:${second}`
  } else if (+val >= 60 && +val < 3600) {
    let mins = Math.floor(+val / 60)
    let second = +val % 60
    mins = mins >= 10 ? mins : '0' + mins
    second = second >= 10 ? second : '0' + second
    time = `${mins}:${second}`
  } else {
    let hour = Math.floor(+val / 3600)
    let mins = Math.floor((+val % 3600) / 60);
    let second = +val % 60
    mins = mins >= 10 ? mins : '0' + mins
    second = second >= 10 ? second : '0' + second
    time = `${hour}:${mins}:${second}`
  }
  return time
}

//处理时间，例如1:10:00和1小时10分钟返回分钟
const parseTime = (timeStr) => {
  // 中文格式解析（如："1小时10分钟" 或 "50分钟"）
  if (timeStr.includes('小时') || timeStr.includes('分钟')) {
    const cnRegex = /(\d+)小时?(\d+)?分钟?/;
    const matches = timeStr.match(cnRegex);

    let hours = 0, mins = 0;
    if (matches) {
      hours = matches[1] ? parseInt(matches[1], 10) : 0;
      mins = matches[2] ? parseInt(matches[2], 10) : 0;
    }
    return hours * 60 + mins;

    // 英文格式解析（如："1:10:00" 或 "45:00"）
  } else if (timeStr.includes(':')) {
    const parts = timeStr.split(':');
    // 兼容带小时和不带小时的格式
    const hasHour = parts.length >= 2 && parts[2] === '00';
    if (hasHour) {
      const hours = parseInt(parts[0], 10);
      const mins = parseInt(parts[1], 10);
      return hours * 60 + mins;
    } else {
      return parseInt(parts[0], 10);
    }
  }

  // 无法解析时返回 0 或抛出错误
  return 0;
};

export { getFolder, getWebDAVUrl, loginUser, get189Folder, get189VideoUrl, get189User, getQuarkFolder, getQuarkVideoUrl, getQuarkResolutionUrl, getQuarkUser, handleSecond, parseTime };
