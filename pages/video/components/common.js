const getFolder = (data) => {
  let webdavInfo = uni.getStorageSync('webdavInfo')
  return new Promise(resolve => {
    uni.request({
      url: 'http://' + webdavInfo.address + ':' + webdavInfo.port + '/api/fs/list',
      data: JSON.stringify({ ...data, page: 1, per_page: 100, refresh: false }),
      timeout: 3000,
      method: 'POST',
      header: { Authorization: webdavInfo.token, 'Content-Type': 'application/json' },
      success: (res) => {
        resolve(res.data)
      }
    })
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

export { getFolder, handleSecond };
