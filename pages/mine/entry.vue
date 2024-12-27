<template>
  <div class="entry"></div>
</template>

<script setup>
if (uni.getStorageSync('Authorization')) {
  uni.reLaunch({
    url: '/pages/video/index'
  })
} else {
  uni.reLaunch({
    url: '/pages/mine/login'
  })
}
</script>

<style lang="scss" scoped>
</style>
