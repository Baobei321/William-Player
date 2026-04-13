//处理iptv的m3u文件
const parseM3UToArray = m3uContent => {
  const lines = m3uContent.split('\n')
  const result = []
  let currentEntry = {}

  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine) continue // 跳过空行

    // 解析 #EXTINF 元数据行
    if (trimmedLine.startsWith('#EXTINF')) {
      // 提取 tvg-name、tvg-logo、group-title
      const metaMatch = trimmedLine.match(/tvg-name="([^"]+)".*tvg-logo="([^"]+)".*group-title="([^"]+)"/)

      currentEntry = {
        name: metaMatch ? metaMatch[1] : 'Unknown',
        logo: metaMatch ? metaMatch[2] : '',
        groupTitle: metaMatch ? metaMatch[3] : '',
        url: '',
      }

      // 如果正则匹配失败，尝试兼容性解析（例如字段顺序不同）
      if (!metaMatch) {
        currentEntry.name = trimmedLine.split(/,(.+)/)[1] || 'Unknown' // 获取逗号后的频道名
        currentEntry.logo = (trimmedLine.match(/tvg-logo="([^"]+)"/) || [])[1] || ''
        currentEntry.groupTitle = (trimmedLine.match(/group-title="([^"]+)"/) || [])[1] || ''
      }
    }
    // 解析播放链接行（非注释行）
    else if (!trimmedLine.startsWith('#')) {
      currentEntry.url = trimmedLine
      result.push(currentEntry)
      currentEntry = {} // 重置当前条目
    }
  }
  return result
}

//对iptv数组进行分类
const groupByGroupTitle = (arr, level = '2') => {
  let arr1 = arr.reduce((groups, item) => {
    // 处理可能的 undefined/null/空字符串
    const key = item.name || '未命名'
    let obj = groups.find(v => v.name == key)
    if (!obj) {
      groups.push({ name: key, groupTitle: item.groupTitle, logo: item.logo, childList: [] })
      obj = groups.find(v => v.name == key)
    }
    if (level == '3') {
      obj.childList.push(item)
    }
    return groups
  }, [])
  return arr1.reduce((groups, item) => {
    // 处理可能的 undefined/null/空字符串
    const key = item.groupTitle || '未分组'
    let obj = groups.find(v => v.name == key)
    if (!obj) {
      groups.push({ name: key, childList: [] })
      obj = groups.find(v => v.name == key)
    }
    obj.childList.push(item)
    return groups
  }, [])
}

//一级不进行分类，直接平铺开，根据name进行分类
const groupByName = arr => {
  return arr.reduce((groups, item) => {
    const key = item.name || '未命名'
    let group = groups.find(g => g.name === key)

    if (!group) {
      group = {
        name: key,
        logo: item.logo,
        groupTitle: item.groupTitle,
        childList: [],
      }
      groups.push(group)
    }

    group.childList.push(item)
    return groups
  }, [])
}

//查询手机号是哪个城市以及运营商的
const getPhoneCityAndCarrier = data => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: 'https://cx.shouji.360.cn/phonearea.php',
      data: {
        number: data.number,
      },
      timeout: 10000,
      method: 'GET',
      success: res => {
        resolve(res.data)
      },
      fail: error => {
        reject(error)
      },
    })
  })
}

//获取当前选择的是哪个资源，isEmby是true的话就获取选中的emby资源，不是就是正常资源
const judgeSelect = (type = 'all') => {
  let sourceList = uni.getStorageSync('sourceList') || []
  let selectType = {}
  let selectMedia = {}
  if (type === 'emby') {
    const embySource = sourceList.find(item => item.type === 'Emby')
    const activeItem = embySource?.list?.find(item => item.active)
    if (activeItem) {
      selectMedia = activeItem
      selectType = embySource
    }
    return { selectType, selectMedia }
  } else if (type === 'normal') {
    // 非Emby场景:遍历找有active的组
    const nonEmbySource = sourceList.find(item => item.type !== 'Emby' && item.list?.some(i => i.active)) || {}
    const activeItem = nonEmbySource?.list?.find(item => item.active)
    if (activeItem) {
      selectMedia.value = activeItem
      selectType.value = nonEmbySource
    }
    return { selectType, selectMedia }
  } else {
    selectType =
      sourceList.find(item => {
        let select = item.list.find(i => i.active)
        if (select) {
          selectMedia = select
        }
        return !!select
      }) || {}
    return { selectType, selectMedia }
  }
}

export { parseM3UToArray, groupByGroupTitle, groupByName, getPhoneCityAndCarrier, judgeSelect }
