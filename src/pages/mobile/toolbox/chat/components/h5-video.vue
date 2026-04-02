<template>
  <div v-html="videoHtml" class="h5-video"></div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  videoSrc: {
    type: String,
    default: '',
  },
})
const videoHtml = ref(`
      <video 
        src="${props.videoSrc}" 
        controls 
        autoplay 
        style="width:100%;height:auto;"
        playsinline 
        webkit-playsinline
        x5-video-player-type="h5"
        class="video"
      ></video>
    `)
</script>

<style lang="scss" scoped>
.h5-video {
  flex: 0 0 500rpx;
  border-radius: 24rpx;
  margin-left: 24rpx;
  background: #f5f5f8;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300rpx;
  :deep(.video) {
    width: 100%;
    border-radius: 24rpx;
    height: 100% !important;
    background: #f5f5f8;
    display: block;
    object-fit: cover;
    &:first-child {
      margin-left: 0;
    }
  }
  &:first-child {
    margin-left: 0;
  }
}
</style>
