<template>
  <div class="user-info">
    <div class="user-info-top">
      <img
        :src="
          userInfo.avatar ||
          'https://storage.7x24cc.com/storage-server/presigned/ss1/a6-online-fileupload/newMediaImage/2AFA742_427A_user-avatar_20241225150546694newMediaImage.png'
        " />
      <div class="user-info-top__name">
        <span>{{ userInfo.name }}</span>
        <span>{{ userInfo.phonenumber }}</span>
      </div>
    </div>
    <div class="user-info-list">
      <div class="user-info-list__item" :style="{ color: item.color }" v-for="item in options" :key="item.name" @click="handleClick(item.name)">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import * as CONFIG from '@/utils/config'
import { ipc } from '@/utils/ipcRenderer'
import { ipcApiRoute } from '@/utils/ipcApiRoute'
import { WilMessageBox } from '@/components/electron/wil-message-box/index.js'
import { useRouter } from 'vue-router'

const emits = defineEmits(['closePopover'])
const router = useRouter()
const userInfo = ref(uni.getStorageSync(CONFIG.USER_KEY))
const options = [
  { name: '意见反馈', color: 'rgb(38,38,38)' },
  { name: '下载手机版', color: 'rgb(38,38,38)' },
  { name: '退出登录', color: 'rgb(247,76,49)' },
]

//跳转到登录页，缩小窗口
const reduceWindow = async () => {
  ipc.invoke(ipcApiRoute.changeWindowSize, { width: 400, height: 500 })
}

const handleClick = name => {
  switch (name) {
    case '意见反馈':
      ipc.invoke(ipcApiRoute.openExternal, 'https://github.com/chenweiliang6/William-Player/issues')
      break
    case '下载手机版':
      ipc.invoke(ipcApiRoute.openExternal, 'https://chenweiliang6.github.io/app-webview/#/download-center')
      break
    case '退出登录':
      WilMessageBox.confirm({
        title: '提示',
        message: '确定要退出登录吗？退出后将需要重新登录。',
        type: 'warning',
        confirmButtonText: '确认',
        cancelButtonText: '取消',
      }).then(() => {
        uni.removeStorageSync('Authorization')
        uni.removeStorageSync('refreshToken')
        reduceWindow()
        router.replace({
          path: '/login',
        })
      })
      break
  }
  console.log("走到这");
  
  emits('closePopover')
}
</script>

<style lang="scss" scoped>
.user-info {
  width: 360rpx;
  .user-info-top {
    display: flex;
    align-items: center;
    img {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
    }
    .user-info-top__name {
      display: flex;
      flex-direction: column;
      margin-left: 32rpx;
      span {
        font-size: 28rpx;
        color: #000;
        &:first-child {
          font-weight: bold;
        }
      }
    }
  }
  .user-info-list {
    margin-top: 40rpx;
    &__item {
      padding: 20rpx 16rpx;
      font-size: 28rpx;
      cursor: pointer;
      border-radius: 8rpx;
      &:hover {
        background: #e9ebed;
      }
    }
  }
}
</style>
