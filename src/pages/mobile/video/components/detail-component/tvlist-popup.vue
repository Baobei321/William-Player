<template>
  <div class="tvlist-popup">
    <nut-popup v-model:visible="visible" position="bottom" :lock-scroll="true">
      <div class="tvlist-popup-wrapper">
        <div class="tvlist-popup-wrapper__title" :style="{ height: navBarHeight }">
          <div class="tvlist-popup-wrapper__title-content" :style="{ height: contentHeight }">
            <nut-icon name="rect-down" @click="close"></nut-icon>
            <span>{{ props.title }}</span>
            <div class="content-right">
              <span class="content-right-download" v-if="!isDownload" @click="openDownload(true)">下载</span>
              <span class="content-right-cancel" v-if="isDownload" @click="openDownload(false)">取消</span>
              <span class="content-right-confirm" v-if="isDownload" @click="confirmDownload">确认</span>
            </div>
          </div>
        </div>
        <div class="tvlist-popup-wrapper__list">
          <div class="tvlist-popup-wrapper__list-item" v-for="(item, index) in props.tvList" :key="item.name" @click="playVideo(item, index)">
            <div class="item-img">
              <image :src="item.poster" mode="aspectFill" class="item-img-poster"></image>
              <template v-if="isDownload">
                <image src="@/static/check-active.png" class="select-icon" v-if="selectArr.some(i => i.id === item.id)"></image>
                <image src="@/static/check.png" class="select-icon" v-else></image>
              </template>
            </div>
            <div class="item-info">
              <div class="item-info-title">{{ item.ji + '.' + (item.title || `第${item.ji}集`) }}</div>
              <div class="item-info-star">
                <image src="@/static/star-fill.png"></image>
                <span class="star-score">{{ item.vote_average?.toFixed(1) || 10 }}</span>
                <span class="star-runtime">{{ item.runtimeOrg ? calTime(item.runtimeOrg, 'cn') : '暂无时长' }}</span>
              </div>
              <div class="item-info-desc">{{ item.overview||'暂无简介' }}</div>
            </div>
          </div>
        </div>
      </div>
    </nut-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { calTime } from '@/utils/scrape'
import { getWebDAVUrl, get189VideoUrl, getQuarkResolutionUrl, getQuarkVideoUrl } from '@/utils/common'

const props = defineProps({
  tvList: { type: Array, default: [] },
  title: { type: String, default: '' },
  activeSeason: { type: Object, default: {} },
})

const emits = defineEmits(['playVideo'])
const visible = defineModel('visible')
const navBarHeight = ref('')
const contentHeight = ref('')
const isDownload = ref(false) //是否在下载模式
const selectArr = ref([]) //已选中的需要下载的视频
const selectType = ref({})
const selectMedia = ref({})
let DownloaderManager = null
let downloadList = [] //下载列表

//计算微信navBar高度
const getNavHeight = () => {
  let sysinfo = uni.getSystemInfoSync() // 获取设备系统对象
  let statusBarHeight = sysinfo.statusBarHeight // 获取状态栏高度
  navBarHeight.value = statusBarHeight + 44 + 'px' //计算nav导航栏的高度
  contentHeight.value = '44px'
}

//计算h5的navBar高度
const getH5NavbarHeight = () => {
  let sysinfo = uni.getSystemInfoSync() // 获取设备系统对象
  navBarHeight.value = '44px'
  contentHeight.value = '44px'
}
const close = () => {
  visible.value = false
}

//初始化安卓原生下载器
const initDownloader = () => {
  if (!DownloaderManager) {
    DownloaderManager = uni.requireNativePlugin('WilliamDownloader')
    DownloaderManager.init(
      {
        maxDownloadTasks: 3, // 最大同时下载任务数
        downloadDir: '/storage/emulated/0/Android/data/com.android.williamplayer/cache/myDownloader', // 下载文件路径
        maxDownloadThreads: 3, // 最大下载线程数
        autoRecovery: true, // 是否自动恢复下载
        openRetry: true, // 下载失败是否打开重试
        maxRetryCount: 2, // 重试次数
        retryIntervalMillis: 1000, // 每次重试时间间隔（毫秒）
      },
      function (res) {
        if (0 == res.code) {
          uni.showToast({
            title: res.msg,
            icon: 'none',
          })
          // 显示下载列表
        }
      }
    )
  }
}
//查询所有下载任务
const queryAll = callback => {
  initDownloader()
  DownloaderManager.queryAll(res => {
    let arr = res.data ? JSON.parse(res.data) : []
    downloadList = arr.filter(i => i.status === 'DOWNLOADING' || i.status === 'PAUSED' || i.status === 'CONNECTING' || i.status === 'ERROR')
    if (downloadList?.length + selectArr.value?.length >= 3) {
      uni.showToast({
        title: `已存在${downloadList?.length}个下载任务,最多同时下载三个`,
        icon: 'none',
      })
    } else {
      callback()
    }
  })
}
//判断选择的是webdav还是天翼云盘还是夸克
const judgeSelect = () => {
  let sourceList = uni.getStorageSync('sourceList')
  selectType.value = sourceList.find(item => {
    let select = item.list.find(i => i.active)
    if (select) {
      selectMedia.value = select
      return true
    } else {
      return false
    }
  })
}
//获取下载链接
const getDownloadUrl = async item => {
  judgeSelect()
  if (selectType.value.type == 'WebDAV') {
    if (selectMedia.value.name) {
      let res = await getWebDAVUrl(
        {
          path: decodeURIComponent(props.activeSeason.path.slice(1) + '/' + item.name),
        },
        selectMedia.value
      )
      return res.data.raw_url
    }
  } else if (selectType.value.type == '天翼云盘') {
    if (selectMedia.value.name) {
      let res = await get189VideoUrl(
        {
          folderFileId: item.id,
        },
        selectMedia.value
      )
      return res.normal.url
    }
  } else if (selectType.value.type == '夸克网盘') {
    if (selectMedia.value.name) {
      let res = await getQuarkVideoUrl({ folderFileId: item.id }, selectMedia.value)
      return res.data[0].download_url
    }
  } else if (selectType.value.type == 'Emby') {
    if (selectMedia.value.name) {
      let res = await getEmbyPlayerUrl(
        {
          folderFileId: item.id,
        },
        selectMedia.value
      )
      return res.MediaSources[0].Path
    }
  }
}

//创建下载任务
const createDownload = () => {
  selectArr.value.forEach(async i => {
    const lastDotIndex = i.name.lastIndexOf('.')
    let format = i.name.substring(lastDotIndex + 1)
    let url = await getDownloadUrl(i)
    DownloaderManager.createDownloadTask(
      {
        downUrl: url,
        saveName: `${props.title} 第${i.ji}集.${format}`, // 此处可改成根据下载地址自动获取文件名及文件格式
        imgUrl: i.poster,
      },
      () => {}
    )
  })
}

const openDownload = val => {
  isDownload.value = val
  selectArr.value = []
}
//确认下载
const confirmDownload = () => {
  queryAll(createDownload)
}

const playVideo = (item, index) => {
  if (isDownload.value) {
    selectArr.value.some(i => i.id === item.id) ? (selectArr.value = selectArr.value.filter(i => i.id !== item.id)) : selectArr.value.push(item)
  } else {
    emits('playVideo', item, index)
  }
}

// #ifdef APP-PLUS
getNavHeight()
// #endif

// #ifdef H5
getH5NavbarHeight()
// #endif
</script>

<style lang="scss" scoped>
.tvlist-popup {
  // overscroll-behavior: contain;
  :deep(.nut-popup) {
    width: 100%;
    height: 100%;
    .tvlist-popup-wrapper {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      .tvlist-popup-wrapper__title {
        width: 100%;
        position: relative;
        .tvlist-popup-wrapper__title-content {
          position: absolute;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          bottom: 0;
          left: 0;
          padding: 0 32rpx;
          .nut-icon-rect-down {
            width: 40rpx;
            height: 40rpx;
            font-size: 40rpx;
            cursor: pointer;
            position: absolute;
            left: 32rpx;
          }
          span {
            font-size: 32rpx;
            font-weight: bold;
            color: #000;
          }
          .content-right {
            position: absolute;
            right: 32rpx;
            span {
              font-size: 30rpx;
              color: #ff6701;
            }
            .content-right-cancel {
              color: #000;
            }
            .content-right-confirm {
              color: #315ffd;
              margin-left: 24rpx;
            }
          }
        }
      }
      .tvlist-popup-wrapper__list {
        flex: 1;
        overflow: auto;
        border-top: 2rpx solid #ebebeb;
        .tvlist-popup-wrapper__list-item {
          display: flex;
          padding: 24rpx;
          border-bottom: 1px solid #ebebeb;
          .item-img {
            flex: 0 0 150rpx;
            height: 224rpx;
            position: relative;
            .item-img-poster{
              background: rgb(212, 212, 212);
            }
            image {
              display: block;
              width: 100%;
              height: 100%;
              border-radius: 20rpx;
            }
            .select-icon {
              width: 40rpx;
              height: 40rpx;
              position: absolute;
              top: 10rpx;
              right: 10rpx;
            }
          }
          .item-info {
            padding-left: 24rpx;
            .item-info-title {
              font-size: 32rpx;
              font-weight: bold;
            }
            .item-info-star {
              display: flex;
              align-items: center;
              padding-top: 16rpx;
              image {
                width: 32rpx;
                height: 32rpx;
                display: block;
              }
              .star-score {
                color: #f4bc22;
                font-size: 28rpx;
              }
              .star-runtime {
                padding-left: 16rpx;
                font-size: 28rpx;
                color: #000;
              }
            }
            .item-info-desc {
              padding-top: 16rpx;
              display: -webkit-box;
              -webkit-line-clamp: 3;
              -webkit-box-orient: vertical;
              overflow: hidden;
              text-overflow: ellipsis;
              font-size: 28rpx;
              color: #848484;
              line-height: normal;
            }
          }
        }
      }
    }
  }
}
</style>
