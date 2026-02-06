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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import * as CONFIG from '@/utils/config'
const userInfo = ref(uni.getStorageSync(CONFIG.USER_KEY))
</script>

<style lang="scss" scoped>
.user-info {
  padding: 24rpx;
  .user-info-top {
    display: flex;
    align-items: center;
    img {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
    }
    .user-info-top__name{
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
}
</style>
