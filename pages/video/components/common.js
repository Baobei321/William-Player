import * as CONFIG from '@/utils/config.js'

//webdav
const getFolder = (data, webdavInfo) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: "http://" + webdavInfo.address + ":" + webdavInfo.port + "/api/fs/list",
      data: JSON.stringify({ ...data, page: 1, per_page: 100, refresh: false }),
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

//获取第几季的详情
const getTvSeason = (data) => {
  return new Promise((resolve) => {
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

//计算时间
const calTime = (val, type = "cn") => {
  if (type == "cn") {
    if (val > 60) {
      let hours = Math.floor(val / 60);
      let mins = val % 60;
      return `${hours}小时${mins}分钟`;
    } else {
      return `${val}分钟`;
    }
  } else if (type == "en") {
    if (val > 60) {
      let hours = Math.floor(val / 60);
      let mins = val % 60;
      mins = mins >= 10 ? mins : "0" + mins;
      return `${hours}:${mins}:00`;
    } else {
      return `${val}:00`;
    }
  }
};

let classifyList = [
  { id: "18", label: "剧情", img: "https://n.sinaimg.cn/sinakd20230822s/429/w1000h1029/20230822/85c9-12a6845ed1089e9489c8510b78bfd6ef.jpg", background: "linear-gradient(to bottom, #e90c00, #fc633d)" },
  { id: "10749", label: "爱情", img: "http://mms2.baidu.com/it/u=2417138206,3826310341&fm=253&app=138&f=JPEG?w=500&h=711", background: "linear-gradient(to bottom, #152de0, #5c6bf8)" },
  { id: "10751", label: "家庭", img: "http://mms2.baidu.com/it/u=3450351846,2320385931&fm=253&app=138&f=JPEG?w=500&h=714", background: "linear-gradient(to bottom, #e2860f, #ef9c41)" },
  { id: "35", label: "喜剧", img: "https://img31.mtime.cn/pi/2014/03/06/100404.23427262_1000X1000.jpg", background: "linear-gradient(to bottom, #00a9e8, #55cff7)" },
  { id: "36", label: "历史", img: "http://mms2.baidu.com/it/u=1997636151,980359615&fm=253&app=138&f=JPEG?w=500&h=889", background: "linear-gradient(to bottom, #f3743f, #f98f61)" },
  { id: "12", label: "冒险", img: "http://mms2.baidu.com/it/u=1171152207,1406454474&fm=253&app=138&f=JPEG?w=498&h=778", background: "linear-gradient(to bottom, #8c8259, #a8a17a)" },
  { id: "878", label: "科幻", img: "http://mms0.baidu.com/it/u=543696733,898405375&fm=253&app=120&f=JPEG?w=608&h=950", background: "linear-gradient(to bottom, #4f7077, #74959c)" },
  {
    id: "27",
    label: "恐怖",
    img: "https://bkimg.cdn.bcebos.com/pic/738b4710b912c8fcc3ce413dd2558545d688d53f8bbf?x-bce-process=image/format,f_auto/watermark,image_d2F0ZXIvYmFpa2UyNzI,g_7,xp_5,yp_5,P_20/resize,m_lfit,limit_1,h_1080",
    background: "linear-gradient(to bottom, #8d4615, #b06d41)",
  },
  { id: "53", label: "惊悚", img: "http://mms1.baidu.com/it/u=2731686268,2439194493&fm=253&app=120&f=JPEG?w=380&h=539", background: "linear-gradient(to bottom, #313131, #636363)" },
  { id: "80", label: "犯罪", img: "https://img2.baidu.com/it/u=2409104269,3506751094&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=670", background: "linear-gradient(to bottom, #2655d0, #5a81dc)" },
  { id: "9648", label: "悬疑", img: "http://mms0.baidu.com/it/u=3310303659,3889098684&fm=253&app=138&f=JPEG?w=338&h=507", background: "linear-gradient(to bottom, #f22821, #f95c50)" },
  { id: "10752", label: "战争", img: "https://img2.baidu.com/it/u=1996407550,4166232410&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=677", background: "linear-gradient(to bottom, #848486, #ababab)" },
  { id: "28", label: "动作", img: "https://img1.baidu.com/it/u=477668422,3613401629&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=750", background: "linear-gradient(to bottom, #25add8, #5ecdf0)" },
  { id: "16", label: "动画", img: "https://img1.baidu.com/it/u=3020374768,111332665&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=746", background: "linear-gradient(to bottom, #d73c23, #f46e5b)" },
  { id: "14", label: "奇幻", img: "https://wx1.sinaimg.cn/large/0079wuTAly1gx7yuc7wzyj30ty16ojx9.jpg", background: "linear-gradient(to bottom, #da243d, #dd626e)" },
]
export { getFolder, getWebDAVUrl, loginUser, get189Folder, get189VideoUrl, get189User, getQuarkFolder, getQuarkVideoUrl, getQuarkResolutionUrl, getQuarkUser, handleSecond, parseTime, getTvSeason, getMovieTvById, calTime, classifyList };
