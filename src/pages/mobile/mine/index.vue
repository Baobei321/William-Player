<template>
  <div class="mine">
    <wil-navbar title="我的" :leftShow="false" :rightShow="true">
      <template #right>
        <nut-icon name="scan" custom-color="#ff6701" size="16" @click="openUrl"></nut-icon>
      </template>
    </wil-navbar>
    <div class="mine-container">
      <div class="mine-notLog" v-if="!isLogin">
        <div class="mine-notLog__left">
          <wil-image
            backgroundColor="#efefef"
            src="https://storage.7x24cc.com/storage-server/presigned/ss1/a6-online-fileupload/newMediaImage/2AFA742_427A_user-avatar_20241225150546694newMediaImage.png">
          </wil-image>
          <div class="mine-notLog__left-info">
            <span>游客用户</span>
            <span>即使不登录，也能正常使用，这个模块主要是为了UI好看</span>
          </div>
        </div>
        <nut-button custom-color="#ff6701" class="mine-notLog__right" @click="toLogin">去登录</nut-button>
      </div>
      <div class="mine-loged" v-else>
        <div class="mine-loged__left">
          <div class="left-img" @click="enterUserInfo">
            <wil-image
              backgroundColor="#efefef"
              :src="
                userInfo.avatar ||
                'https://storage.7x24cc.com/storage-server/presigned/ss1/a6-online-fileupload/newMediaImage/2AFA742_427A_user-avatar_20241225150546694newMediaImage.png'
              ">
            </wil-image>
          </div>
          <div class="left-info">
            <div class="left-info-name">
              <span>{{ userInfo.name }}</span>
            </div>
            <div class="left-info-phone">{{ userInfo.phonenumber }}</div>
          </div>
        </div>
        <nut-button custom-color="#ff6701" class="mine-loged__right" @click="enterUserInfo">个人中心</nut-button>
      </div>
      <div class="mine-cell">
        <wil-cell :options="item" v-for="(item, index) in cellOptions" :key="index" @click-item="clickCell" @toLogin="openLoginPopup"></wil-cell>
        <wil-cell :options="[{ title: '退出登录', leftIcon: logOut }]" @click-item="clickCell" v-if="Authorization && userInfo.phonenumber != '19994658532'"></wil-cell>
      </div>
    </div>
    <wil-modal ref="wil_modal"></wil-modal>
    <share-dialog v-model:visible="showShareModal" :shareUrl="shareUrl"></share-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import wilCell from '@/components/mobile/wil-cell/index.vue'
import shareDialog from '../video/components/index-component/share-dialog.vue'
import wilNavbar from '@/components/mobile/wil-navbar/index.vue'
import userImg from '@/static/user-img.png'
import * as CONFIG from '@/utils/config'
import logOut from '@/static/log-out.png'
import iconMedia from '@/static/icon-media.png'
import iconTb from '@/static/icon-tb.png'
// import iconDownload from "@/static/icon-download.png";
import iconMulu from '@/static/icon-mulu.png'
import iconDeepseek from '@/static/icon-deepseek.png'
import iconToolbox from '@/static/icon-toolbox.png'
import iconFeedback from '@/static/icon-feedback.png'
import iconGift from '@/static/icon-gift.png'
import iconSetting from '@/static/icon-setting.png'
import iconAbout from '@/static/icon-about.png'
import { onShow } from '@dcloudio/uni-app'
import { toParse, toStringfy } from './common'
import { getCutContent } from '@/utils/common'
import showModal from '@/components/mobile/wil-modal/modal.js'
import wilModal from '@/components/mobile/wil-modal/index.vue'
import wilImage from '@/components/mobile/wil-image/index.vue'
import { setShareData, doLogout } from '@/network/apis'

// const { getUntokenDict } = useDict()

const userInfo = ref(uni.getStorageSync(CONFIG.USER_KEY))
const Authorization = ref(uni.getStorageSync('Authorization'))
const isLogin = ref(false)

const showLoginPopup = ref(false)
const wil_modal = ref(null)
const showShareModal = ref(false)
const shareUrl = ref('')

// #ifdef APP-PLUS
let TcpModule = uni.requireNativePlugin('TcpModule')
// #endif

const cellOptions = ref([
  [
    // { title: '报账信息', leftIcon: cellClock, path: '/pages/mobile/account-information/list' },
    // { title: '快递查询', leftIcon: cellClock, path: '/account-information/express-search' },
    {
      title: '媒体库列表',
      leftIcon: iconMedia,
      path: '/pages/mobile/media/list',
    },
    {
      title: '数据同步',
      leftIcon: iconTb,
      path: '/pages/mobile/backend/data-sync',
      // path: null,
      tip: '敬请期待...',
    },
    {
      title: '目录设置',
      leftIcon: iconMulu,
      path: '/pages/mobile/media/catelog-setting',
      // path: null,
      tip: '敬请期待...',
    },
    {
      title: '工具箱',
      leftIcon: iconToolbox,
      path: '/pages/mobile/toolbox/index',
    },
  ],
  [
    {
      title: '问题与反馈',
      leftIcon: iconFeedback,
      // path: null,
      // outside: true,
      // outsideUrl: "https://gitee.com/CWLcwl0219/William-Player/issues",
      path: '/pages/mobile/backend/index',
      query: {
        url: CONFIG.BASE_URL.split(':4040')[0] + ':8443/app-webview',
        title: '问题与反馈',
      },
    },
    {
      title: '赞赏',
      leftIcon: iconGift,
      path: '/pages/mobile/backend/appreciate',
    },
    {
      title: '设置',
      leftIcon: iconSetting,
      path: '/pages/mobile/mine/settings',
    },
    {
      title: '关于',
      leftIcon: iconAbout,
      path: '/pages/mobile/backend/about-version',
    },
  ],
])

const openUrl = () => {
  uni.scanCode({
    success: async res => {
      if (res.result.startsWith('http://') || res.result.startsWith('https://')) {
        uni.navigateTo({
          url: `/pages/mobile/backend/index?url=${res.result}`,
        })
      } else {
        let result = JSON.parse(res.result)
        if (result.type == 'dataSync') {
          let obj = {
            userInfo: {
              userKey: uni.getStorageSync(CONFIG.USER_KEY),
              userId: uni.getStorageSync(CONFIG.USER_ID),
              Authorization: uni.getStorageSync('Authorization'),
              refreshToken: uni.getStorageSync('refreshToken'),
            },
            // localMovieTvData: uni.getStorageSync("localMovieTvData"),
            muluData: uni.getStorageSync('muluData') || {},
            sourceList: uni.getStorageSync('sourceList'),
            historyPlay: uni.getStorageSync('historyPlay'),
          }
          if (init) {
            uni.showToast({
              title: '开始连接',
              icon: 'none',
            })
            TcpModule.connectAsClient(result.port.split(':')[0], 1025, res => {
              uni.showToast({
                title: res,
                icon: 'none',
              })
              let result = JSON.parse(res)
              if (result.code == 500) {
                //本地局域网同步失败，走后端接口同步
                setShareData({ port: result.port.split(':')[1], data: obj }).then(() => {
                  uni.showToast({
                    title: '同步成功',
                    icon: 'none',
                  })
                })
              } else {
                //本机局域网同步成功
                init = false
                TcpModule.send(JSON.stringify(obj), res1 => {
                  let res2 = JSON.parse(res1)
                  if (res2.code == 500) {
                    uni.showToast({
                      title: '同步失败请重新扫描',
                      icon: 'none',
                    })
                  } else {
                    uni.showToast({
                      title: '同步成功',
                      icon: 'none',
                    })
                  }
                })
              }
            })
          } else {
            TcpModule.send(JSON.stringify(obj), res1 => {
              let res2 = JSON.parse(res1)
              if (res2.code == 500) {
                uni.showToast({
                  title: '同步失败请重新扫描',
                  icon: 'none',
                })
              } else {
                uni.showToast({
                  title: '同步成功',
                  icon: 'none',
                })
              }
            })
          }
        } else {
          uni.showToast({
            title: '扫描此二维码无效',
            icon: 'none',
          })
        }
      }
    },
  })
}

//进入个人资料页，进行编辑个人信息
const enterUserInfo = () => {
  uni.navigateTo({
    url: '/pages/mobile/mine/userInfo/index',
  })
}

//退出登录
const toLogout = () => {
  wil_modal.value.showModal({
    title: '温馨提示',
    content: '是否退出登录',
    confirmColor: '#ff6701',
    confirm: async () => {
      uni.removeStorageSync(CONFIG.USER_ID)
      uni.removeStorageSync(CONFIG.OPEN_ID)
      uni.removeStorageSync(CONFIG.USER_KEY)
      uni.removeStorageSync('refreshToken')
      doLogout()
      uni.removeStorageSync('Authorization')
      uni.reLaunch({
        url: '/pages/mobile/mine/login',
      })
    },
  })
}

//判断是否为登录状态
const judgeLogin = () => {
  userInfo.value = uni.getStorageSync(CONFIG.USER_KEY)
  Authorization.value = uni.getStorageSync('Authorization')
  if (Authorization.value) {
    //用来展示默认的游客账号
    isLogin.value = userInfo.value.phonenumber == '19994658532' ? false : true
  } else {
    isLogin.value = false
  }
}

const clickCell = item => {
  if (item.title == '退出登录') {
    toLogout()
  }
  if (item.tip) {
    uni.showToast({
      title: item.tip,
      icon: 'none',
    })
  }
  if (item.outside) {
    plus.runtime.openURL(item.outsideUrl, error => {
      if (error) {
        uni.showToast({ title: '打开浏览器失败', icon: 'none' })
      }
    })
  }
}

const toLogin = () => {
  uni.removeStorageSync(CONFIG.USER_ID)
  uni.removeStorageSync(CONFIG.OPEN_ID)
  uni.removeStorageSync(CONFIG.USER_KEY)
  uni.removeStorageSync('Authorization')
  uni.reLaunch({
    url: '/pages/mobile/mine/login',
  })
}

const openLoginPopup = item => {
  const whiteList = ['后台管理', '壁纸']
  if (whiteList.indexOf(item.title) > -1) {
    uni.navigateTo({
      url: item.path + '?' + toStringfy(item.query),
    })
    return
  }
  showLoginPopup.value = true
}

onShow(async () => {
  judgeLogin()
  let shareUrl1 = await getCutContent()
  if (shareUrl1) {
    shareUrl.value = shareUrl1
    showShareModal.value = true
  }
})
</script>

<style lang="scss">
page {
  width: 100%;
  height: 100%;
}

.mine {
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #ffd3b1 0%, #fff5ec 30%, #f6f7f8 70%);
  display: flex;
  flex-direction: column;
  position: relative;
  box-sizing: border-box;

  ::v-deep .wil-navbar {
    .nut-navbar {
      .nut-navbar__right {
        position: absolute;
        right: 0;
      }
    }
  }

  &-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0 24rpx;
    overflow: auto;
  }

  .mine-notLog {
    padding: 24rpx 30rpx 24rpx 24rpx;
    background-color: #fff;
    border-radius: 16rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    // margin-top: 34rpx;
    margin-top: 0;

    .mine-notLog__left {
      display: flex;
      align-items: center;

      ::v-deep .wil-image {
        width: 136rpx;
        height: 136rpx;
        flex: 0 0 136rpx;
        border-radius: 50%;
      }

      .mine-notLog__left-info {
        padding-left: 24rpx;

        span:first-child {
          display: block;
          font-size: 32rpx;
          color: #353a45;
          font-weight: bold;
        }

        span:last-child {
          display: block;
          font-size: 24rpx;
          color: gray;
          padding-top: 10rpx;
        }
      }
    }

    &__right {
      height: 32px;
      // padding: 0 17.5px;
    }
  }

  &-loged {
    padding: 24rpx 44rpx 24rpx 24rpx;
    background-color: #fff;
    border-radius: 16rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    // margin-top: 34rpx;
    margin-top: 0;

    &__left {
      display: flex;
      align-items: center;

      .left-img {
        width: 136rpx;
        height: 136rpx;

        ::v-deep .wil-image {
          border-radius: 50%;
          width: 100%;
          height: 100%;
        }
      }

      .left-info {
        padding-left: 24rpx;

        .left-info-name {
          font-weight: bold;
          font-size: 32rpx;
          color: #353a45;
          display: flex;
          align-items: center;

          .auth-status {
            padding: 8rpx 20rpx;
            font-size: 26rpx;
            border-radius: 8rpx;
            font-weight: 400;
            margin-left: 20rpx;
          }

          .noAuth {
            border: 2rpx solid #ff3838;
            color: #ff3838;
          }

          .isAuth {
            border: 2rpx solid #ff6701;
            color: #ff6701;
          }
        }

        .left-info-phone {
          font-size: 28rpx;
          color: #86909c;
          margin-top: 6rpx;
        }
      }
    }

    &__right {
      height: 32px;
      // padding: 0 17.5px;
    }
    // &__right {
    //   display: flex;
    //   align-items: center;
    //   justify-content: center;
    //   width: 136rpx;
    //   height: 48rpx;
    //   background: linear-gradient(180deg, #ffae35 0%, #ff9900 100%);
    //   border-radius: 80rpx;

    //   img {
    //     width: 28rpx;
    //     height: 28rpx;
    //   }

    //   span {
    //     font-size: 24rpx;
    //     color: #ffffff;
    //     margin-left: 16rpx;
    //   }
    // }
  }
  .mine-cell {
    :deep(.wil-cell) {
      margin-top: 24rpx;
    }
  }
}

// @media (prefers-color-scheme: dark) {
//   .mine {
//     background: #1e1e20;

//     .mine-notLog {
//       background-color: #2f2f2f;

//       .mine-notLog__left {
//         .mine-notLog__left-info {
//           span:first-child {
//             color: #fff;
//           }

//           span:last-child {
//             color: gray;
//           }
//         }
//       }
//     }

//     &-loged {
//       background-color: #2f2f2f;

//       &__left {
//         display: flex;

//         .left-info {
//           .left-info-name {
//             color: #fff;
//           }

//           .left-info-phone {
//             color: #86909c;
//           }
//         }
//       }
//     }
//   }
// }
</style>