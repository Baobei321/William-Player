//webdav

const getFolder = (data, webdavInfo) => {
  return new Promise((resolve) => {
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
    });
  });
};

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
      timeout: 1500,
      method: "POST",
      header: { "Content-Type": "application/json" },
      success: (res) => {
        resolve(res.data);
      },
      fail: () => {
        reject("");
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
  return new Promise((resolve) => {
    uni.request({
      url: `https://cloud.189.cn/api/open/file/listFiles.action?pageNum=1&pageSize=60&folderId=${data.folderId}`,
      timeout: 3000,
      method: "GET",
      header: {
        "Accept": "application/json;charset=UTF-8",
        "Accept-Encoding": 'gzip, deflate, br, zstd',
        "Accept-Language": 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
        'Connection': 'keep-alive',
        'Cookie': cookieStr,
        "Host": 'cloud.189.cn',
        'Priority': 'u=0',
        'Referer': 'https://cloud.189.cn/web/main/file/folder/-11',
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
    });
  });
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

export { getFolder, loginUser, get189Folder, handleSecond };
