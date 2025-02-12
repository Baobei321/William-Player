<template>
  <view class="backend">
    <web-view :src="url" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app';

const url = ref('')

onLoad((options) => {
  url.value = decodeURIComponent(options.url)
})
</script>

<style lang="scss">
.backend {
  width: 100%;
  height: 100%;
}
</style>