<template>
  <div class="user-info">
    <div class="user-info-top">
      <img
        :src="
          userInfo.avatar ||
          'https://storage.7x24cc.com/storage-server/presigned/ss1/a6-online-fileupload/newMediaImage/2AFA742_427A_user-avatar_20241225150546694newMediaImage.png'
        "
      />
      <div class="user-info-top__name">
        <span>{{ userInfo.name }}</span>
        <span>{{ userInfo.phonenumber }}</span>
      </div>
    </div>
    <div class="user-info-list">
      <div class="user-info-list__item" :style="{ color: item.color }" v-for="item in options" :key="item.action" @click="handleClick(item.action)">{{ item.label }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import * as CONFIG from '@/utils/config'
import { ipc } from '@/utils/ipcRenderer'
import { ipcApiRoute } from '@/utils/ipcApiRoute'
import { WilMessageBox } from '@/components/electron/wil-message-box/index.js'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const emits = defineEmits(['closePopover'])
const router = useRouter()
const { t } = useI18n()
const userInfo = ref(uni.getStorageSync(CONFIG.USER_KEY))
const isTouristUser = computed(() => userInfo.value.phonenumber === '19994658532' || !userInfo.value.phonenumber)
const options = computed(() => [
  { action: 'feedback', label: t('mine.feedbackPc'), color: 'rgb(38,38,38)' },
  { action: 'downloadMobile', label: t('mine.downloadMobileVersion'), color: 'rgb(38,38,38)' },
  { action: isTouristUser.value ? 'login' : 'logout', label: isTouristUser.value ? t('auth.login') : t('mine.logout'), color: 'rgb(247,76,49)' },
])

//跳转到登录页，缩小窗口
const reduceWindow = async () => {
  ipc.invoke(ipcApiRoute.changeWindowSize, { width: 400, height: 500 })
}

const handleClick = action => {
  switch (action) {
    case 'feedback':
      ipc.invoke(ipcApiRoute.openExternal, 'https://github.com/chenweiliang6/William-Player/issues')
      break
    case 'downloadMobile':
      ipc.invoke(ipcApiRoute.openExternal, 'https://chenweiliang6.github.io/app-webview/#/download-center')
      break
    case 'logout':
      WilMessageBox.confirm({
        title: t('modal.tip'),
        message: t('modal.confirmLogoutPc'),
        type: 'warning',
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
      }).then(() => {
        uni.removeStorageSync('Authorization')
        uni.removeStorageSync('refreshToken')
        reduceWindow()
        router.replace({
          path: '/login',
        })
      })
      break
    case 'login':
      uni.removeStorageSync('Authorization')
      uni.removeStorageSync('refreshToken')
      reduceWindow()
      router.replace({
        path: '/login',
      })
      break
  }
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
