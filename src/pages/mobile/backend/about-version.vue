<template>
  <div class="about-version">
    <wil-navbar title="关于" :rightShow="true">
      <template #right>
        <nut-icon name="share" custom-color="#000"></nut-icon>
      </template>
    </wil-navbar>
    <div class="about-version-wrapper">
      <div class="about-version-container">
        <div class="about-version-container__main">
          <image src="@/static/app-logo1.png" @click="toLogin"></image>
          <div class="main-name">
            <span>William Player</span>
            <span>{{ appVersion }}</span>
          </div>
          <div class="main-time">{{ CONFIG.updateTime }}</div>
        </div>
        <nut-cell title="自动检查更新" :desc="status[0]" :is-link="true" @click="showPopover = true"></nut-cell>
      </div>
      <div class="about-version-protocol">
        <image src="@/static/tmdb-xy.png"></image>
        <div class="about-version-protocol__button" @click="toQQpage">联系我们</div>
        <div class="about-version-protocol__other" @click="toOtherPage">下载其他平台版本</div>
        <!-- <div class="about-version-protocol__tip">@2024-至今，由chenweiliang6开发并开源，仅用于学习和使用，不可用于商用</div> -->
      </div>
      <div class="about-version-button">
        <nut-button :disabled="isLoading" custom-color="#ff6701" @click="checkUpdate" v-if="showButton">
          <template #icon>
            <nut-icon name="refresh2" class="nut-icon-am-rotate nut-icon-am-infinite" v-if="isLoading"></nut-icon>
          </template>
          检查更新
        </nut-button>
        <nut-button disabled custom-color="#dedde3" v-else>当前已是最新版本</nut-button>
      </div>
      <nut-popup v-model:visible="showPopover" round position="bottom" safe-area-inset-bottom>
        <nut-picker v-model="status" :columns="popoverList" title="" @confirm="confirm" @cancel="showPopover = false" />
      </nut-popup>
      <wil-upgrade
        :updateFunction="backInfo"
        :logo="upgradeInfo.logo"
        :app-name="upgradeInfo.appName"
        :appVersion="appVersion"
        @closed="closedPopup"
        v-model:visible="showUpgrade"
      ></wil-upgrade>
      <wil-share-sheet v-model:show="showShare" title="分享至" :options="options" @select="handleSelect"></wil-share-sheet>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import wilUpgrade from '@/components/mobile/wil-upgrade/index.vue'
import { getUntokenDicts } from '@/network/apis'
import appLogo from '@/static/app-logo1.png'
import * as CONFIG from '@/utils/config'
import { toParse, toStringfy } from '../mine/common'
import { getAppLatestVersion } from '@/utils/common'
import wilNavbar from '@/components/mobile/wil-navbar/index.vue'
import wilShareSheet from '@/components/mobile/wil-share-sheet/index.vue'
import weiboIcon from '@/static/weibo-icon.png'
import copyLink from '@/static/copy-link.png'
import moreIcon from '@/static/more-icon.png'

const url = ref('')

const status = ref(['总是'])
const showShare = ref(false)
const showPopover = ref(false)
const popoverList = ref([
  { text: '总是', value: '总是' },
  { text: '每天', value: '每天' },
  { text: '每周', value: '每周' },
  { text: '从不', value: '从不' },
])
const isLoading = ref(false)
const showButton = ref(true)
const showUpgrade = ref(false)
const versionData = ref({})

const options = [
  {
    name: '微信',
    icon: 'https://q-learning.quectel.com/train-uniapp/assets/wechat-friends-DbSOyenR.png',
  },
  { name: '朋友圈', icon: 'https://q-learning.quectel.com/train-uniapp/assets/wechat-moments-Cf8Tr5vB.png' },
  { name: 'QQ', icon: 'https://q-learning.quectel.com/train-uniapp/assets/qq-friends-D5XyRct4.png' },
  {
    name: '微博',
    icon: weiboIcon,
  },
  {
    name: '复制链接',
    icon: copyLink,
  },
  {
    name: '更多',
    icon: moreIcon,
  },
]

setTimeout(() => {
  showShare.value = true
}, 1000)
const appVersion = ref(CONFIG.VERSIOIN)

let num = 0

const upgradeInfo = ref({
  logo: appLogo,
  appName: 'William Player',
})

const checkUpdate = async () => {
  isLoading.value = true
  await getAppUpdateInfo()
}

const confirm = ({ selectedValue, selectedOptions }) => {
  uni.setStorageSync('remindTime', { type: selectedValue[0] })
  showPopover.value = false
}

const toQQpage = () => {
  let query = {
    url: CONFIG.BASE_URL.split(':4040')[0] + ':8443/app-webview/#/qqTalk',
    title: '问题与反馈',
  }
  uni.navigateTo({
    url: '/pages/mobile/backend/index' + '?' + toStringfy(query),
  })
}

//跳转到下载页
const toOtherPage = () => {
  let query = {
    url: CONFIG.BASE_URL.split(':4040')[0] + ':8443/app-webview/#/download-center',
    title: '下载中心',
  }
  uni.navigateTo({
    url: '/pages/mobile/backend/index' + '?' + toStringfy(query),
  })
}

//分享
const handleSelect = item => {
  if (item.name === '微信') {
    uni.share({
      provider: 'weixin',
      type: 0,
      title: 'William Player',
      scene: 'WXSceneSession',
      summary:
        '一款适配📱 Android Phone 📺Android TV以及Windows的视频播放器，功能页面使用uniapp+vue3开发，播放器使用安卓原生kotlin以及mpv开发，支持云播放(天翼云盘、夸克网盘和Webdav)，支持刮削影视元信息，支持IPTV播放，优雅打造私人影视库。界面简洁纯净，操作简单。',
      href: 'https://chenweiliang6.github.io/app-webview/#/download-center',
      imageUrl: 'https://gitee.com/CWLcwl0219/William-Player/raw/master/src/static/app-logo1.png',
    })
  } else if (item.name === '朋友圈') {
    uni.share({
      provider: 'weixin',
      type: 0,
      title: 'William Player',
      scene: 'WXSceneTimeline',
      summary:
        '一款适配📱 Android Phone 📺Android TV以及Windows的视频播放器，功能页面使用uniapp+vue3开发，播放器使用安卓原生kotlin以及mpv开发，支持云播放(天翼云盘、夸克网盘和Webdav)，支持刮削影视元信息，支持IPTV播放，优雅打造私人影视库。界面简洁纯净，操作简单。',
      href: 'https://chenweiliang6.github.io/app-webview/#/download-center',
      imageUrl: 'https://gitee.com/CWLcwl0219/William-Player/raw/master/src/static/app-logo1.png',
    })
  } else if (item.name === 'QQ') {
    uni.share({
      provider: 'qq',
      type: 0,
      title: 'William Player',
      summary:
        '一款适配📱 Android Phone 📺Android TV以及Windows的视频播放器，功能页面使用uniapp+vue3开发，播放器使用安卓原生kotlin以及mpv开发，支持云播放(天翼云盘、夸克网盘和Webdav)，支持刮削影视元信息，支持IPTV播放，优雅打造私人影视库。界面简洁纯净，操作简单。',
      href: 'https://chenweiliang6.github.io/app-webview/#/download-center',
      imageUrl: 'https://gitee.com/CWLcwl0219/William-Player/raw/master/src/static/app-logo1.png',
    })
  } else if (item.name === '微博') {
    uni.share({
      provider: 'sinaweibo',
      type: 0,
      title: 'William Player',
      summary:
        '一款适配📱 Android Phone 📺Android TV以及Windows的视频播放器，功能页面使用uniapp+vue3开发，播放器使用安卓原生kotlin以及mpv开发，支持云播放(天翼云盘、夸克网盘和Webdav)，支持刮削影视元信息，支持IPTV播放，优雅打造私人影视库。界面简洁纯净，操作简单。',
      href: 'https://chenweiliang6.github.io/app-webview/#/download-center',
      imageUrl: 'https://gitee.com/CWLcwl0219/William-Player/raw/master/src/static/app-logo1.png',
    })
  }
}

const toLogin = () => {
  // if (num == 5) {
  //   uni.removeStorageSync(CONFIG.USER_ID);
  //   uni.removeStorageSync(CONFIG.OPEN_ID);
  //   uni.removeStorageSync(CONFIG.USER_KEY);
  //   uni.removeStorageSync("Authorization");
  //   uni.reLaunch({
  //     url: "/pages/mobile/mine/login",
  //   });
  // } else {
  //   num++;
  // }
}

const compareVersions = (newBb, oldBb) => {
  if (newBb) {
    const v1 = newBb?.split('.').map(Number) // 将版本号拆分成数字
    const v2 = oldBb?.split('.').map(Number) // 同样拆分另一个版本号

    for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
      // 如果 v1 的当前部分小于 v2 对应的部分，返回 -1
      if ((v1[i] || 0) < (v2[i] || 0)) {
        return -1
      }
      // 如果 v1 的当前部分大于 v2 对应的部分，返回 1
      if ((v1[i] || 0) > (v2[i] || 0)) {
        return 1
      }
    }
  }
  return 0 // 如果两个版本号完全相同，返回 0
}

const getAppUpdateInfo = async () => {
  // let res = await getUntokenDicts("app_version");
  let res = await getAppLatestVersion()
  isLoading.value = false
  versionData.value = res
  versionData.value.downloadUrl = res.assets.find(i => i.name === 'app-mobile.apk')?.browser_download_url || null
  if (compareVersions(res.tag_name, appVersion.value) == 1) {
    //此时后台设置已有新版本
    showUpgrade.value = true
  } else {
    showButton.value = false
  }
}

const backInfo = async () => {
  return versionData.value
}

const closedPopup = () => {
  showUpgrade.value = false
}

onLoad(options => {
  status.value = uni.getStorageSync('remindTime').type ? [uni.getStorageSync('remindTime').type] : ['总是']
  url.value = decodeURIComponent(options.url)
})
</script>

<style lang="scss" scoped>
page {
  width: 100%;
  height: 100%;
}

.about-version {
  width: 100%;
  height: 100%;
  background: #f6f7f8;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  .about-version-wrapper {
    padding-top: 250rpx;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    flex: 1;
    overflow: hidden;
    .about-version-container {
      width: 100%;

      .about-version-container__main {
        display: flex;
        flex-direction: column;
        align-items: center;

        image {
          width: 240rpx;
          height: 240rpx;
          border-radius: 60rpx;
        }

        .main-name {
          margin-top: 40rpx;
          position: relative;

          span:first-child {
            font-weight: bold;
            font-size: 36rpx;
            color: #000;
          }

          span:last-child {
            position: absolute;
            display: block;
            background: #cc1118;
            color: #fff;
            border-radius: 20rpx;
            padding: 4rpx 8rpx;
            font-size: 28rpx;
            top: -20rpx;
            right: 0;
            transform: translateX(100%);
          }
        }

        .main-time {
          font-size: 28rpx;
          margin-top: 20rpx;
        }
      }

      ::v-deep .nut-popover-wrapper {
        width: 100%;
      }

      ::v-deep .nut-cell {
        width: 100%;
        background: transparent;
        box-shadow: none;
        margin-top: 72rpx;

        .nut-cell__title {
          font-size: 32rpx;
          color: #000;
        }

        .nut-cell__value {
          font-size: 32rpx;
          color: #000;
        }

        .nut-cell__link {
          display: none;
        }
      }
    }

    .about-version-protocol {
      margin-top: 24rpx;
      display: flex;
      flex-direction: column;
      align-items: center;

      image {
        width: 526.5rpx;
        height: 178.5rpx;
      }

      .about-version-protocol__button {
        margin-top: 50rpx;
        font-weight: bold;
        font-size: 28rpx;
        color: #68c6b3;
      }
      .about-version-protocol__other {
        margin-top: 50rpx;
        font-size: 28rpx;
        color: #1e6efa;
      }

      // .about-version-protocol__tip{
      //   padding: 0 100rpx;
      //   margin-top: 24px;
      //   text-align: center;
      //   font-size: 24rpx;
      //   line-height: 35rpx;
      // }
    }

    .about-version-button {
      position: absolute;
      bottom: 50rpx;

      ::v-deep .nut-button {
        .nut-button__wrap {
          flex-direction: row-reverse;

          .nut-button__text {
            margin-left: 0;
          }

          .nut-icon {
            margin-left: 10rpx;
          }
        }
      }
    }
  }
}

// @media (prefers-color-scheme: dark) {
//   .about-version {
//     background: #1e1e20;

//     .about-version-container {
//       .about-version-container__main {
//         .main-name {
//           span:first-child {
//             color: #fff;
//           }
//         }
//       }

//       ::v-deep .nut-cell {
//         .nut-cell__title {
//           color: #fff;
//         }

//         .nut-cell__value {
//           color: #fff;
//         }
//       }
//     }
//   }
// }
</style>
