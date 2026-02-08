<template>
  <div class="video">
    <!-- <div style="background: #efefef;width: 375px;height: 812px;"></div> -->
    <video-navbar
      @refresh="refreshVideo"
      @pause="pauseRefresh"
      :refreshData="refreshData"
      :loading="refreshLoading"
      :isConnected="isConnected"
      ref="video_navbar"
      :tmdbKey1="tmdbKey"
      @getHeight="getNavbarHeight"
      :class="['navbar-transparent', refreshLoading ? 'navbar-white' : '']"></video-navbar>
    <template v-if="isConnected">
      <Skeleton v-if="refreshLoading"></Skeleton>
      <template v-else>
        <div class="video-container" v-if="selectType.type == 'Emby' ? embyMovieTvList?.length : localMovieTvData?.movie?.length || localMovieTvData?.tv?.length">
          <scroll-view :scroll-y="true" class="video-container-scroll" @scroll="handlePageScroll">
            <template v-if="selectType.type != 'Emby'">
              <star-recommend v-if="settingData.showRecommend"></star-recommend>
              <div class="scroll-list" :style="{ paddingTop: settingData.showRecommend ? '40rpx' : `calc(40rpx + ${navbarHeight + 'px'})` }">
                <recent-played v-if="historyPlay.length" :listData="historyPlay" :isConnected="isConnected"></recent-played>
                <hx-list title="电影" :listData="localMovieTvData?.movie" v-if="localMovieTvData?.movie?.length" :isConnected="isConnected"></hx-list>
                <hx-list title="电视剧" :listData="localMovieTvData?.tv" v-if="localMovieTvData?.tv?.length" :isConnected="isConnected"></hx-list>
                <Classify :isConnected="isConnected"></Classify>
              </div>
            </template>
            <!-- emby专用的首页 -->
            <emby-home v-else :style="{ paddingTop: `calc(40rpx + ${navbarHeight + 'px'})` }"></emby-home>
          </scroll-view>
        </div>
        <div class="video-empty" v-if="selectType.type == 'Emby' ? !embyMovieTvList?.length : !localMovieTvData?.movie?.length && !localMovieTvData?.tv?.length">
          <div class="video-empty-logo">
            <image :src="appLogo" />
            <span>William Player</span>
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
    </template>
    <div class="video-nowifi" v-else>
      <wil-empty type="wifi" text="网络已断开，请检查网络连接"></wil-empty>
    </div>
    <wil-upgrade :updateFunction="getAppUpdateInfo" :logo="upgradeInfo.logo" :app-name="upgradeInfo.appName" :enableControl="true" :appVersion="CONFIG.VERSIOIN">
    </wil-upgrade>
    <wil-modal ref="wil_modal"></wil-modal>
    <share-dialog v-model:visible="showShareModal" :shareUrl="shareUrl"></share-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import videoNavbar from './components/index-component/navbar.vue'
import Skeleton from './components/index-component/skeleton.vue'
import starRecommend from './components/index-component/star-recommend.vue'
import recentPlayed from './components/index-component/recent-played.vue'
import hxList from './components/index-component/hx-list.vue'
import Classify from './components/index-component/classify.vue'
import wilUpgrade from '@/components/mobile/wil-upgrade/index.vue'
import wilModal from '@/components/mobile/wil-modal/index.vue'
import shareDialog from './components/index-component/share-dialog.vue'
import embyHome from './components/index-component/emby-home.vue'
import { setTmdbKey, getUntokenDicts } from '@/network/apis'
import { getCutContent, getAppLatestVersion } from '@/utils/common'
import appLogo from '@/static/app-logo1.png'
import { onShow, onUnload } from '@dcloudio/uni-app'
import * as CONFIG from '@/utils/config'
import { useVideoIndex } from '@/hooks/useVideoIndex.js'

const wil_modal = ref(null)
const { video_navbar, refreshData, refreshLoading, movieTvData, localMovieTvData, tmdbKey, historyPlay, settingData, selectType, scrollTop, refreshVideo, navbarStyle } =
  useVideoIndex({ wil_modal })
const showDialog = ref(false)
const showShareModal = ref(false)
const shareUrl = ref('')

const upgradeInfo = ref({
  logo: appLogo,
  appName: 'William Player',
})

const navbarHeight = ref(0) //标题栏加状态栏的高度
let startCommandHeight = 0 //轮播海报的高度，在手机端和pad端表现不同

const isConnected = ref(false) //手机是否连接网络

const embyMovieTvList = ref(uni.getStorageSync('embyMovieTvList'))

const pauseRefresh = () => {
  refreshData.value = { found: 0, toupdate: 0, updated: 0, success: 0, fail: 0 }
  movieTvData.value = { movie: [], tv: [] }
  localMovieTvData.value.tv = []
  localMovieTvData.value.movie = []
  uni.setStorageSync('localMovieTvData', localMovieTvData.value)
  refreshLoading.value = false
}

const toAddWebdav = () => {
  uni.navigateTo({
    url: '/pages/mobile/source/source-list',
  })
}

const onCancel = () => {
  showDialog.value = false
  tmdbKey.value = ''
}

const onOk = async () => {
  showDialog.value = false
  let settingData = uni.getStorageSync('settingData')
  if (settingData) {
    settingData.tmdbKey = tmdbKey.value
    uni.setStorageSync('settingData', settingData)
  } else {
    uni.setStorageSync('settingData', { tmdbKey: tmdbKey.value, showProgress: true })
  }
  await setTmdbKey({ tmdbKey: tmdbKey.value })
  video_navbar.value.showProgress()
}

//获取应用更新信息
const getAppUpdateInfo = async () => {
  let res = await getAppLatestVersion()
  res.downloadUrl = res.assets.find(i => i.name === 'app-mobile.apk')?.browser_download_url || null
  return res
}

//获取标题加状态栏的高度
const getNavbarHeight = val => {
  navbarHeight.value = +val.split('px')[0]
  let sysinfo = uni.getSystemInfoSync() // 获取设备系统对象
  let windowWidth = sysinfo.windowWidth // 获取状态栏高度
  if (windowWidth >= 700) {
    //pad端
    startCommandHeight = uni.upx2px(800) + navbarHeight.value
  } else {
    //手机端
    startCommandHeight = uni.upx2px(500) + navbarHeight.value
  }
}
//页面滚动，更改标题的背景色
const handlePageScroll = event => {
  let opacity = event.detail.scrollTop / startCommandHeight >= 1 ? 1 : event.detail.scrollTop / startCommandHeight
  scrollTop.value = event.detail.scrollTop
  let cval = (255 - opacity * 255).toFixed(2)
  if (settingData.value.showRecommend && selectType.value.type !== 'Emby') {
    //如果展示影视推荐轮播图，才根据滚动渐变
    navbarStyle.value = {
      background: `rgba(255,255,255,${opacity.toFixed(2)})`,
      color: `rgb(${cval},${cval},${cval})`,
      borderColor: `rgba(246, 247, 248, ${opacity})`,
    }
  }
}

//根据判断显示标题栏的颜色
const showNavbarColor = () => {
  const { movie, tv } = localMovieTvData.value || {}
  const hasData = movie?.length || tv?.length
  const isEmby = selectType.value.type === 'Emby'
  const transparentStyle = {
    background: `rgba(255,255,255,0)`,
    color: `rgb(255,255,255)`,
    borderColor: `rgba(246, 247, 248, 0)`,
  }
  const solidStyle = {
    background: `rgba(255,255,255,1)`,
    color: `rgb(0,0,0)`,
    borderColor: `rgba(246, 247, 248, 1)`,
  }
  if (isEmby) {
    navbarStyle.value = solidStyle
  } else if (scrollTop.value === 0) {
    if (!settingData.value.showRecommend) {
      navbarStyle.value = solidStyle
    } else {
      navbarStyle.value = hasData ? transparentStyle : solidStyle
    }
  }
}
onShow(async () => {
  showNavbarColor()
  let shareUrl1 = await getCutContent()
  if (shareUrl1) {
    shareUrl.value = shareUrl1
    showShareModal.value = true
  }
})

const listenerNetwork = res => {
  scrollTop.value = 0
  isConnected.value = res.isConnected
  if (isConnected.value) {
    showNavbarColor()
  } else {
    navbarStyle.value = {
      background: `rgba(255,255,255,1)`,
      color: `rgb(0,0,0)`,
      borderColor: `rgba(246, 247, 248, 1)`,
    }
  }
}
uni.getNetworkType({
  success: res => {
    scrollTop.value = 0
    if (res.networkType != 'none') {
      isConnected.value = true
      showNavbarColor()
    } else {
      isConnected.value = false
      navbarStyle.value = {
        background: `rgba(255,255,255,1)`,
        color: `rgb(0,0,0)`,
        borderColor: `rgba(246, 247, 248, 1)`,
      }
    }
  },
})
uni.onNetworkStatusChange(listenerNetwork)
onUnload(() => {
  uni.offNetworkStatusChange(listenerNetwork)
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

  :deep(.video-navbar) {
    background: v-bind('navbarStyle.background');
    border-bottom: 2rpx solid v-bind('navbarStyle.borderColor');

    .nut-navbar--placeholder {
      .nut-navbar {
        // background: v-bind('navbarStyle.background');

        .nut-navbar__left {
          span {
            color: v-bind('navbarStyle.color') !important;
          }
        }

        .nut-navbar__right {
          .navbar-icon {
            color: v-bind('navbarStyle.color') !important;
          }
        }
      }
    }
  }

  :deep(.navbar-white) {
    background: #fff;

    .nut-navbar--placeholder {
      .nut-navbar {
        background: #fff;

        .nut-navbar__left {
          span {
            color: #000 !important;
          }
        }

        .nut-navbar__right {
          .navbar-icon {
            color: #000 !important;
          }
        }
      }
    }
  }

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

      image {
        width: 140rpx;
        height: 140rpx;
        border-radius: 20rpx;
      }

      span {
        font-size: 36rpx;
        font-weight: bold;
        color: #000;
        padding-top: 10rpx;
      }
    }

    .video-empty-tip {
      padding: 60rpx 0 40rpx 0;
      text-align: center;
      color: #000;
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
            input {
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
  .video-nowifi {
    background: #fff;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

// @media (prefers-color-scheme: dark) {
//   .video {
//     background: #1e1e20;

//     .video-empty {
//       background: #1e1e20;

//       .video-empty-logo {
//         span {
//           color: #fff;
//         }
//       }

//       .video-empty-tip {
//         color: #fff;
//       }

//       ::v-deep .nut-button {
//         background-color: #fff !important;

//         .nut-button__wrap {
//           .nut-icon-uploader {
//             color: #000 !important;
//           }

//           .nut-button__text {
//             color: #000 !important;
//           }
//         }

//         &::before {
//           background-color: #fff !important;
//         }
//       }
//     }
//   }
// }
</style>
