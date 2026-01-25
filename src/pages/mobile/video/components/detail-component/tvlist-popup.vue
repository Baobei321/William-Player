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
              <image :src="item.poster" mode="aspectFill"></image>
              <template v-if="isDownload">
                <image src="@/static/check-active.png" class="select-icon" v-if="selectArr.some(i => i.id === item.id)"></image>
                <image src="@/static/check.png" class="select-icon" v-else></image>
              </template>
            </div>
            <div class="item-info">
              <div class="item-info-title">{{ item.ji + '.' + (item.title || `第${item.ji}集`) }}</div>
              <div class="item-info-star">
                <image src="@/static/star-fill.png"></image>
                <span class="star-score">{{ item.vote_average.toFixed(1) }}</span>
                <span class="star-runtime">{{ calTime(item.runtimeOrg, 'cn') }}</span>
              </div>
              <div class="item-info-desc">{{ item.overview }}</div>
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

const props = defineProps({
  tvList: { type: Array, default: [] },
  title: { type: String, default: '' },
})

const emits = defineEmits(['playVideo'])
const visible = defineModel('visible')
const navBarHeight = ref('')
const contentHeight = ref('')
const isDownload = ref(false) //是否在下载模式
const selectArr = ref([]) //已选中的需要下载的视频
let DownloaderManager = null

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

//创建下载任务
const createDownload = item => {
  const lastDotIndex = item.name.lastIndexOf('.')
  let format = val.substring(lastDotIndex+1)
  // let saveName = `${props.title} 第${}集`

  DownloaderManager.createDownloadTask(
    {
      downUrl:
        'https://media-zjhz-fy-person01.zj6oss.ctyunxs.cn/PERSONCLOUD/f310df5a-15cd-4dbc-b414-7a5100252967.mp4?x-amz-CLIENTTYPEIN=PC&AWSAccessKeyId=0Lg7dAq3ZfHvePP8DKEU&x-amz-userLevel=100&x-amz-limitrate=51200&response-content-type=video/mp4&x-amz-UID=64784934&response-content-disposition=attachment%3Bfilename%3D%2209.mp4%22%3Bfilename*%3DUTF-8%27%2709.mp4&x-amz-CLIENTNETWORK=UNKNOWN&x-amz-CLOUDTYPEIN=PERSON&Signature=4XB2gn0QF%2BQtw3HR3DyRot7tlL8%3D&Expires=1769238525&x-amz-FSIZE=1227841923&x-amz-UFID=225481186083258592',
      saveName: '腾讯视频.mp4', // 此处可改成根据下载地址自动获取文件名及文件格式
      imgUrl: 'https://n.sinaimg.cn/sinakd20230822s/429/w1000h1029/20230822/85c9-12a6845ed1089e9489c8510b78bfd6ef.jpg',
    },
    function (res) {
      uni.showToast({
        title: res,
        icon: 'none',
        duration: 7000,
      })
      if (res.code == 0) {
        uni.showToast({
          title: '创建下载任务之后开始监听',
        })
        queryAll()
        startListener()
      }
    }
  )
}

const openDownload = val => {
  isDownload.value = val
  selectArr.value = []
}
//确认下载
const confirmDownload = () => {
  initDownloader()
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
