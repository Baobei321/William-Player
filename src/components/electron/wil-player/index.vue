<template>
  <div class="wil-player" id="wil-player"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import Player from 'xgplayer'
import 'xgplayer/dist/index.min.css'
const props = defineProps({
  videoUrl: { type: String, default: '' },
  config: { type: Object, default: {} },
})
const emits = defineEmits(['play', 'pause'])
const video_player = ref<Player | null>(null)

//初始化播放器
const initPlayer = () => {
  const config = {
    id: 'wil-player',
    url: props.videoUrl,
    fluid: true,
    /**倍速播放 */
    playbackRate: [0.5, 0.75, 1, 1.5, 2],
    defaultPlaybackRate: 1,

    playsinline: false, // IOS设备设置，防止被浏览器劫持
    'x5-video-player-type': 'h5', // 微信内置浏览器设置，防止被浏览器劫持
    'x5-video-orientation': 'portraint',
    /**画中画 */
    pip: true,
    pipConfig: {
      bottom: 100,
      right: 100,
      width: 320,
      height: 180,
    },
    // download: true,
    /**初始化首帧 */
    videoInit: true,
    autoplay: true,
    videoAttributes: {
      class: 'my-video', // 可以设置多个类名
    },
    ...props.config,
  }
  const player = new Player(config)
  if (player) {
    video_player.value = player
    /* 这里注册监听 */
    // 监听视频开始播放 播放传给父组件的是true
    video_player.value.on('play', () => {
      emits('play')
    })
    // 监听视频已经暂停 暂停传给父组件的是true
    video_player.value.on('pause', () => {
      emits('pause')
    })
  }
}

watch(
  () => props.videoUrl,
  val => {
    if (!video_player.value) {
      initPlayer()
      return
    }
    video_player.value.src = val
  }
)
onMounted(() => {
  initPlayer()
})
</script>

<style lang="scss" scoped>
.wil-player {
  width: 100%;
  height: 100%;
  // padding-top: 0 !important;
  :deep(.my-video) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    outline: none;
  }
}
</style>
