<template>
  <div class="video">
    <video-navbar @refresh="refreshVideo" :refreshData="refreshData" :loading="refreshLoading" ref="video_navbar"></video-navbar>
    <Skeleton v-if="refreshLoading"></Skeleton>
    <template v-else>
      <div class="video-container" v-if="localMovieTvData?.movie?.length || localMovieTvData?.tv?.length">
        <scroll-view :scroll-y="true" class="video-container-scroll">
          <div class="scroll-list">
            <recent-played v-if="historyPlay.length" :catchtouchmove="true"></recent-played>
            <hx-list title="电影" :listData="localMovieTvData?.movie" v-if="localMovieTvData?.movie?.length"></hx-list>
            <hx-list title="电视剧" :listData="localMovieTvData?.tv" v-if="localMovieTvData?.tv?.length"></hx-list>
            <Classify></Classify>
          </div>
        </scroll-view>
      </div>
      <div class="video-empty" v-if="!localMovieTvData?.movie?.length && !localMovieTvData?.tv?.length">
        <div class="video-empty-logo">
          <img src="https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/5d/e6/c4/5de6c4a3-0387-fd0e-2bad-9547264f3aa8/AppIconLight-0-0-1x_U007emarketing-0-8-0-0-0-0-85-220.png/350x350.png">
          <span>William</span>
        </div>
        <div class="video-empty-tip">
          <div>从网盘添加资源到媒体库中</div>
          <div>即可打造私人影院，随时观看</div>
        </div>
        <nut-button custom-color="#090909" @click="toAddWebdav">
          <template #icon>
            <nut-icon name="uploader" custom-color="#fff" size="12"></nut-icon>
          </template>
          <span>添加新资源</span>
        </nut-button>
        <nut-dialog title="api_key" v-model:visible="showDialog" @cancel="onCancel" @ok="onOk">
          <nut-input v-model="tmdbKey" placeholder="请输入tmdb的api_key" />
        </nut-dialog>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, } from "vue";
import Folder from '../../static/folder.png'
import videoNavbar from './components/navbar.vue'
import Skeleton from './components/skeleton.vue'
import { onShow } from '@dcloudio/uni-app';
import hxList from './components/hx-list.vue'
import recentPlayed from "./components/recent-played.vue";
import Classify from './components/classify.vue'
const video_navbar = ref(null)

const listData = ref([])
const webdavInfo = ref({})
const refreshData = ref({ found: 0, toupdate: 0, updated: 0 })
const refreshLoading = ref(false)
const showDialog = ref(false)

const movieTvData = ref({ //存储电影电视剧数据
  movie: [],
  tv: []
})

const localMovieTvData = ref({})
const tmdbKey = ref('')

const historyPlay = ref(uni.getStorageSync('historyPlay') || [])



const loginUser = () => {
  webdavInfo.value = uni.getStorageSync('webdavInfo')
  return new Promise((resolve, reject) => {
    uni.request({
      url: 'http://' + webdavInfo.value.address + ':' + webdavInfo.value.port + '/api/auth/login',
      data: JSON.stringify({ username: webdavInfo.value.username, password: webdavInfo.value.password }),
      timeout: 1500,
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        uni.setStorageSync('webdavInfo', { ...webdavInfo.value, token: res.data.data.token })
        resolve(res.data)
      },
      fail: () => {
        reject('')
      }
    })
  });
}

const getFolder = (data) => {
  webdavInfo.value = uni.getStorageSync('webdavInfo')
  return new Promise(resolve => {
    uni.request({
      url: 'http://' + webdavInfo.value.address + ':' + webdavInfo.value.port + '/api/fs/list',
      data: JSON.stringify({ ...data, page: 1, per_page: 100, refresh: false }),
      timeout: 3000,
      method: 'POST',
      header: { Authorization: webdavInfo.value.token, 'Content-Type': 'application/json' },
      success: (res) => {
        resolve(res.data)
      }
    })
  })
}

//通过tmdb接口获取更详细的信息
const searchMovieTv = (data, type) => {
  let url = ''
  if (type == 'movie') {
    url = 'https://api.tmdb.org/3/search/movie'
  } else if (type == 'tv') {
    url = 'https://api.tmdb.org/3/search/tv'
  }
  return new Promise((resolve, rej) => {
    uni.request({
      url: url,
      data: { ...data, language: 'zh-CN', page: 1, api_key: uni.getStorageSync('tmdbKey'), },
      method: 'GET',
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        resolve(res.data)
      },
    })
  });
}

//处理内存大小
const handleSize = (size) => {
  if (size == 0) return '0';
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(size) / Math.log(1024));
  const formatted = parseFloat((size / Math.pow(1024, i)).toFixed(2));
  return formatted + ' ' + sizes[i];
}

//groupBy视频来源，将多个网盘来的视频合成一个
const groupBySource = (arr) => {
  const map = new Map();
  arr.forEach(item => {
    if (!map.has(removeExtension(item.name))) {
      map.set(removeExtension(item.name), { ...item, provider: null, source: [] });
    }
    map.get(removeExtension(item.name)).source.push({ provider: item.provider, size: handleSize(item.size), path: item.path, name: item.name });
  });
  const result = Array.from(map.values());
  return result
}

const removeExtension = (filename) => {
  const lastDotIndex = filename.lastIndexOf('.');
  let name = lastDotIndex === -1 ? filename : filename.substring(0, lastDotIndex);
  return name
};

const handleSeasonName = (filename) => {
  const lastDotIndex = filename.lastIndexOf('.');
  let name = lastDotIndex === -1 ? filename : filename.substring(0, lastDotIndex);
  const lastKgIndex = name.lastIndexOf(' ')
  name = lastKgIndex === -1 ? name : name.substring(0, lastKgIndex);
  return name
}

const refreshVideo = async () => {
  refreshData.value = { found: 0, toupdate: 0, updated: 0 }
  movieTvData.value = { movie: [], tv: [] }
  await getMovieTv(listData.value, '/')
  if (!movieTvData.value.movie.length || !movieTvData.value.tv.length) {
    refreshLoading.value = false
    return
  }
  let movie = groupBySource(movieTvData.value.movie)
  let tv = groupBySource(movieTvData.value.tv)
  compareMovieTv(movie, 'movie')
  compareMovieTv(tv, 'tv')
  await setMovieTvImg(movie, 'movie').then((res) => {
    localMovieTvData.value.movie = res
  }).catch(() => {
    refreshLoading.value = false
    showDialog.value = true
    uni.showToast({
      title: '请填写正确的api_key',
      icon: 'none'
    })
  })
  localMovieTvData.value.tv = await setMovieTvImg(tv, 'tv')
  refreshData.value.updated = refreshData.value.toupdate
  refreshData.value.toupdate = 0
  uni.setStorageSync('localMovieTvData', localMovieTvData.value)
  refreshLoading.value = false
}

//比较新刮削出来的影片是否已经存在或者删除，不存在就是待更新
const compareMovieTv = (arr, type) => {
  if (type == 'movie') {
    const deleteNumber = localMovieTvData.value.movie?.filter(item => arr?.every(i => i.name != item.name))?.length || 0;
    const addNumber = arr?.filter(item => localMovieTvData.value.movie?.every(i => i.name != item.name))?.length || 0;
    refreshData.value.toupdate += deleteNumber + addNumber
  } else if (type == 'tv') {
    const deleteNumber = localMovieTvData.value.tv?.filter(item => arr?.every(i => i.name != item.name))?.length || 0;
    const addNumber = arr?.filter(item => localMovieTvData.value.tv?.every(i => i.name != item.name))?.length || 0;
    refreshData.value.toupdate += deleteNumber + addNumber
  }
}

//查找网盘中的名叫电影,电视剧的文件夹
const getMovieTv = async (arr1, path1 = '/') => {
  const handleMovieTv = async (arr, path) => {
    if (!arr?.length) return
    refreshLoading.value = true
    for (let item of arr) {
      if (item.type != '1') continue
      if (item.name == '电影') {
        uni.hideLoading()
        let movieResult = await getFolder({ path: path + '电影' })
        movieResult.data.content.forEach(v => {
          v.path = path + '电影'
          v.provider = movieResult.data.provider
        })
        movieTvData.value.movie.push(...movieResult.data.content)
        refreshData.value.found += movieResult.data.content.length
      }
      if (item.name == '电视剧') {
        uni.hideLoading()
        let tvResult = await getFolder({ path: path + '电视剧' })
        tvResult.data.content.forEach(v => {
          v.path = path + '电视剧'
          v.provider = tvResult.data.provider
        })
        movieTvData.value.tv.push(...tvResult.data.content)
        refreshData.value.found += tvResult.data.content.length
      }
      if (item.name != '电影' && item.name != '电视剧') {
        uni.hideLoading()
        let otherResult = await getFolder({ path: path + item.name })
        await handleMovieTv(otherResult.data?.content, path + item.name + '/')
      }
    }
  }
  await handleMovieTv(arr1, path1)
}

//将网盘中的电影等都设置详细信息
const setMovieTvImg = async (arr, type) => {
  for (let item of arr) {
    if (showDialog.value) return
    try {
      let res = await searchMovieTv({ query: handleSeasonName(item.name) }, type)
      let data = res.results[0]
      if (data) {
        item.poster = 'https://media.themoviedb.org/t/p/w300_and_h450_bestv2' + data.poster_path
        if (type == 'movie') {
          item.releaseTime = data.release_date
        } else if (type == 'tv') {
          item.releaseTime = data.first_air_date
        }
        item.movieTvId = data.id
        item.genre_ids = data.genre_ids
      } else {
        item.poster = 'https://img0.baidu.com/it/u=3410216376,4211467608&fm=253&fmt=auto&app=138&f=JPEG?w=750&h=465'
        item.releaseTime = '暂无时间'
      }
    } catch (error) {
      return Promise.reject();
    }

  }
  return arr
}

const toAddWebdav = () => {
  let webdavInfo = uni.getStorageSync('webdavInfo')
  if (!webdavInfo) {
    uni.navigateTo({
      url: '/pages/video/add-webdav?title=添加WebDAV'
    })
  } else {
    uni.navigateTo({
      url: '/pages/video/add-webdav?title=修改WebDAV'
    })
  }
}

//处理添加或者修改完webdav之后自动刮削
const handleGx = () => {
  let isreload = uni.getStorageSync('isreload')
  if (isreload) {
    uni.removeStorageSync('isreload')
    if (!uni.getStorageSync('tmdbKey')) {
      showDialog.value = true
      return
    } else {
      video_navbar.value.showProgress()
    }
  }
}

const onCancel = () => {
  showDialog.value = false
  tmdbKey.value = ''
}

const onOk = () => {
  showDialog.value = false
  uni.setStorageSync('tmdbKey', tmdbKey.value)
  tmdbKey.value = ''
  video_navbar.value.showProgress()
}

onShow(async () => {
  historyPlay.value = uni.getStorageSync('historyPlay') || []
  webdavInfo.value = uni.getStorageSync('webdavInfo')
  localMovieTvData.value = uni.getStorageSync('localMovieTvData') || {}
  if (webdavInfo.value.name) {
    await loginUser()
    let res = await getFolder()
    listData.value = res.data.content.map(item => {
      if (item.type == '1') {
        item.leftIcon = Folder
      }
      return item
    })
  }
  handleGx()
})


</script>

<style lang="scss" scoped>
page {
  width: 100%;
  height: 100%;
}
.video {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f6f7f8;
  box-sizing: border-box;

  .video-container {
    flex: 1;
    overflow: hidden;
    // padding: 0 12px;
    width: 100%;
    box-sizing: border-box;
    position: relative;
    z-index: 1;
    .video-container-scroll {
      width: 100%;
      height: 100%;
      .scroll-list {
        padding: 40rpx 24rpx;
        box-sizing: border-box;
        .hxList:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  .video-empty {
    width: 100%;
    flex: 1;
    position: relative;
    z-index: 1;
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .video-empty-logo {
      display: flex;
      flex-direction: column;
      align-items: center;

      img {
        width: 140rpx;
        height: 140rpx;
      }

      span {
        font-size: 36rpx;
        font-weight: bold;
        color: #000;
      }
    }

    .video-empty-tip {
      padding: 60rpx 0 40rpx 0;
      text-align: center;
    }

    ::v-deep .nut-button {
      border-radius: 12rpx;
    }

    // .nut-overlay{
    //   background: transparent;
    // }
    ::v-deep .nut-popup--center {
      background: #315ffd;

      .nut-dialog {
        background: #315ffd;

        .nut-dialog__header {
          color: #fff;
        }

        .nut-dialog__content {
          .nut-input {
            .h5-input {
              color: #000;
            }
          }
        }

        .nut-dialog__footer {
          .nut-dialog__footer-cancel {
            border: none;
            color: #000;
          }

          .nut-dialog__footer-ok {
            background: #27c530;
          }
        }
      }
    }
  }
}
</style>
