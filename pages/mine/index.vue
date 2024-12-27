<template>
  <div class="mine">
    <wil-navbar title="我的" :leftShow="false"></wil-navbar>
    <div class="mine-container">
      <div class="mine-notLog" v-if="!isLogin">
        <div class="mine-notLog__left">
          <img :src="userImg">
          <span>未登录</span>
        </div>
        <nut-button color="#18CAB8" class="mine-notLog__right">去登录</nut-button>
      </div>
      <div class="mine-loged" v-else>
        <div class="mine-loged__left">
          <div class="left-img">
            <img src="https://storage.7x24cc.com/storage-server/presigned/ss1/a6-online-fileupload/newMediaImage/2AFA742_427A_user-avatar_20241225150546694newMediaImage.png">
          </div>
          <div class="left-info">
            <div class="left-info-name">
              <span>{{ userInfo.name }}</span>
            </div>
            <div class="left-info-phone">{{ userInfo.phonenumber }}</div>
          </div>
        </div>
      </div>
      <div class="mine-cell">
        <base-cell :options="item" v-for="(item,index) in cellOptions" :key="index" @click-item="clickCell" @toLogin="openLoginPopup"></base-cell>
        <base-cell :options="[{ title: '退出登录', leftIcon: logOut }]" @click-item="clickCell" v-if="Authorization"></base-cell>
      </div>
    </div>
    <wil-modal ref="wil_modal"></wil-modal>
  </div>
</template>

<script setup>
import { onBeforeMount, onMounted, ref } from 'vue'
import baseCell from '../../components/wil-cell/index.vue'
import wilNavbar from '../../components/wil-navbar'
import userImg from '../../static/user-img.png'
import * as CONFIG from '../../utils/config'
import logOut from '../../static/log-out.png'
import cellStudent1 from '../../static/cell-student1.png'
import cellCompany3 from '../../static/cell-company3.png'
import cellCompany1 from '../../static/cell-company1.png'
import cellClock from '../../static/cell-clock.png'
import { onShow } from '@dcloudio/uni-app';
import { toParse, toStringfy } from './common'
import wilModal from '../../components/wil-modal/index.vue'


// const { getUntokenDict } = useDict()

const userInfo = ref(uni.getStorageSync(CONFIG.USER_KEY))
const Authorization = ref(uni.getStorageSync('Authorization'))
const isLogin = ref(false)

const showLoginPopup = ref(false)
const wil_modal = ref(null)


const cellOptions = ref([
  [
    // { title: '报账信息', leftIcon: cellClock, path: '/pages/account-information/list' },
    // { title: '快递查询', leftIcon: cellClock, path: '/account-information/express-search' },
    { title: '媒体库列表', leftIcon: cellStudent1, path: '/pages/video/list', },
    { title: '后台管理', leftIcon: cellCompany3, path: '/pages/backend/index', },
  ],
])

//退出登录
const toLogout = () => {
  wil_modal.value.showModal({
    title: '温馨提示',
    content: '是否退出登录',
    confirmColor: '#00B2A0',
    confirm: async () => {
      uni.removeStorageSync(CONFIG.USER_ID)
      uni.removeStorageSync(CONFIG.OPEN_ID)
      uni.removeStorageSync(CONFIG.USER_KEY)
      uni.removeStorageSync('Authorization')
      uni.reLaunch({
        url: '/pages/mine/login'
      })
    }
  })
}

//判断是否为登录状态
const judgeLogin = () => {
  userInfo.value = uni.getStorageSync(CONFIG.USER_KEY)
  Authorization.value = uni.getStorageSync('Authorization')
  if (Authorization.value) {
    isLogin.value = true
  } else {
    isLogin.value = false
  }
}

const clickCell = (item) => {
  if (item.title == '退出登录') {
    toLogout()
  }
}

const openLoginPopup = (item) => {
  const whiteList = ['后台管理', '壁纸']
  if (whiteList.indexOf(item.title) > -1) {
    uni.navigateTo({
      url: item.path + '?' + toStringfy(item.query)
    })
    return
  }
  showLoginPopup.value = true
}

const loginSuccess = () => {
  judgeLogin()
}

onShow(() => {
  judgeLogin()
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
  background: url("https://storage.7x24cc.com/storage-server/presigned/ss1/a6-online-fileupload/newMediaImage/4E2B141_427A_background_20241125161030786newMediaImage.png")
    center no-repeat;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  box-sizing: border-box;
  &-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0 24rpx;
    overflow: auto;
  }
  &-notLog {
    padding: 24rpx 30rpx 24rpx 24rpx;
    background-color: #fff;
    border-radius: 16rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 34rpx;
    &__left {
      display: flex;
      align-items: center;
      img {
        width: 136rpx;
        height: 136rpx;
      }
      span {
        padding-left: 24rpx;
        font-size: 32rpx;
        color: #353a45;
        font-weight: bold;
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
    margin-top: 34rpx;
    &__left {
      display: flex;
      align-items: center;
      .left-img {
        width: 136rpx;
        height: 136rpx;
        img {
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
            border: 2rpx solid #18cab8;
            color: #18cab8;
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
      display: flex;
      align-items: center;
      justify-content: center;
      width: 136rpx;
      height: 48rpx;
      background: linear-gradient(180deg, #ffae35 0%, #ff9900 100%);
      border-radius: 80rpx;
      img {
        width: 28rpx;
        height: 28rpx;
      }
      span {
        font-size: 24rpx;
        color: #ffffff;
        margin-left: 16rpx;
      }
    }
  }
}
</style>
