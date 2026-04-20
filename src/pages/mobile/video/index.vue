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
      :class="['navbar-transparent', refreshLoading ? 'navbar-white' : '']"
    ></video-navbar>
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
            <template v-else>
              <emby-home :style="{ paddingTop: `calc(40rpx + ${navbarHeight + 'px'})` }" v-if="embyMovieTvList?.length"></emby-home>
            </template>
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
    <wil-upgrade
      :updateFunction="getAppUpdateInfo"
      :logo="upgradeInfo.logo"
      :app-name="upgradeInfo.appName"
      :enableControl="true"
      :appVersion="CONFIG.VERSION"
    ></wil-upgrade>
    <wil-modal ref="wil_modal"></wil-modal>
    <share-dialog v-model:visible="showShareModal" :shareUrl="shareUrl"></share-dialog>
  </div>
</template>

<script setup>
import { onBeforeMount, ref } from 'vue'
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
import { initWebDAVClient } from '@/utils/webdav.js'

const wil_modal = ref(null)
const {
  video_navbar,
  refreshData,
  refreshLoading,
  movieTvData,
  localMovieTvData,
  embyMovieTvList,
  tmdbKey,
  historyPlay,
  settingData,
  selectType,
  scrollTop,
  navbarStyle,
  refreshVideo,
  judgeSelect,
} = useVideoIndex({ wil_modal })
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

embyMovieTvList.value = uni.getStorageSync('embyMovieTvList')

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
    judgeSelect()
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
      judgeSelect()
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

//用于在本地设置cookie，然后hbuilderx调试app可用
const setLocalCookie = () => {
  let sourceList = uni.getStorageSync('sourceList')
  let cloudQuark = sourceList.find(item => {
    return item.type == '夸克网盘'
  })
  cloudQuark.list = [
    {
      name: '测试夸克cookie',
      active: true,
      Cookie:
        '_UP_A4A_11_=wb9cd1da7a074799aec9af8a69f24430; tfstk=gRiroG4AE3Kz6fAiQAqeuHdmVM481kR6tDNQKvD3F7VuAU3EuvMweJGSKWuUivFkpQL8LMy3L098rabUgScmFgNQqWXEOvg7ZUL8Yx2i9_m7rBecmReZA8mEpMynKXp8OLpjeYELxCO1ThM-exFUzL9_tijmHJwHhz0yAJ38xCO6fZ60yQZnFRLUzrD0MJP3KMc3ot2gi8j3ZXV0oR21ZkqntKz0KRIhq8Vhox2giWq3xXDD3JF0Ekqntxv4pXUSEvj4CzvzssOORO1Kk5DugMjZB8zD1YQCfGi4Uz7-pSyULmyzz5zn3rTsqjMnV0UvJwZKhVlE-fAfP70aQjzszCSr_beni-cWdweq8vmT2zWhxuunwDz-z9ptnucxW5UkkIeqVcaU6r5PbWi-NmzZjIj4HxMs2rne_sVKPRE0LDpG8Wzh4z5LnvO-v45h-zjQ35923It-d6vosbAhJwU0X-P6F8_h-1IT3595AwQLo5e41LN5.; _UP_30C_6A_=sta2c6201f12mc8rxfqxxb96qd6fea5n; _UP_TS_=sg1a769b0ac65ca8bb126dd598e07fad68e; _UP_E37_B7_=sg1a769b0ac65ca8bb126dd598e07fad68e; _UP_TG_=sta2c6201f12mc8rxfqxxb96qd6fea5n; _UP_335_2B_=1; b-user-id=b11bfe0a-1909-bd15-0df3-75adcf7a6360; isg=BLCwy5w7rWFE3HDnhHlHN6-Fgn4C-ZRD-_WCmKoA_ovUZVYPUgij0xAeue0Fbkwb; __pus=2ccd3784c2bb6d72f18bc59b55cd1117AAQGTmvDvcEvqdn06PJ5q9Wce95c335SIm2LrRayUkvRzyzuKuFccCYVsBevdPS/h6D6RufjGda9UTmyCNXzHf0L; __kp=0f922530-37cf-11f1-b95b-23693512a228; __kps=AATCAXsOxOko65HVmJVNCbZZ; __ktd=M6zKqYzCUFnNbu4q9NiZuA==; __uid=AATCAXsOxOko65HVmJVNCbZZ; __puus=5dec66d73307ecd3af7b533008aa94eaAASkRIFbN6+q/O8DynXCWa/fnUs6+PLJH8ajCzjsyMfRirlPu0K8zqSZ2Wa96HY1sLs/pcl6nBn6i57heOTE7wvdzOq0g3kTJRATcMW+Gantt8LRlKOnDWjrSsYoZjivUPtxgDMJVH37GFneg9/Qld9vcNHKVYQ3ZdxGBvZHmfINIap6FCk1eObLTmiuVQVMjFdO5U1ESiOIuZQg7f55rP+u',
    },
  ]
  uni.setStorageSync('sourceList', sourceList)
}
setLocalCookie()
onBeforeMount(() => {
  showNavbarColor()
  // let webdavClientInstance = initWebDAVClient({
  //   server: 'http://10.55.133.230:5244/dav/天翼云盘',
  //   username: 'admin',
  //   password: 'lovektc1314520',
  //   options: {
  //     deep: true, // 自动检测认证类型（默认）
  //   },
  // })
  // webdavClientInstance
  //   .getDirectoryContents('/')
  //   .then(res => {
  //     console.log(res, 'res111')
  //     uni.showToast({
  //       title: res,
  //       icon: 'none',
  //       duration: 10000,
  //     })
  //   })
  //   .catch(err => {
  //     uni.showToast({
  //       title: err,
  //       icon: 'none',
  //       duration: 10000,
  //     })
  //   })
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
