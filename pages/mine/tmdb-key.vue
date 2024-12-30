<template>
  <div class="tmdb-key">
    <div class="tmdb-key-title">请输入要修改的tmdbKey</div>
    <nut-input v-model="tmdbKey" placeholder="请输入tmdbKey"></nut-input>
    <nut-button custom-color="#18cab8" @click="confirmSet">确认设置</nut-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { setTmdbKey } from '../../network/apis';
const tmdbKey = ref(uni.getStorageSync('tmdbKey') || '')

const confirmSet = async () => {
  uni.setStorageSync('tmdbKey', tmdbKey.value)
  await setTmdbKey({ tmdbKey: tmdbKey.value })
  uni.showToast({
    title: '设置成功',
    icon: 'none'
  })
}
</script>

<style lang="scss" scoped>
page {
  width: 100%;
  height: 100%;
}
.tmdb-key {
  background: #f6f7f8;
  width: 100%;
  height: 100%;
  padding: 60rpx 24rpx 0 24rpx;
  box-sizing: border-box;
  .tmdb-key-title {
    font-size: 36rpx;
    color: #000;
    font-weight: bold;
  }
  ::v-deep .nut-input {
    padding-left: 20rpx;
    margin-top: 30rpx;
  }
  ::v-deep .nut-button {
    width: 100%;
    margin-top: 30rpx;
    height: 80rpx;
  }
}
</style>
