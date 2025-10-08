<template>
<div class="video-player">
    <mpv-player :video-url="videoUrl"></mpv-player>
</div>
</template>

<script setup>
import { ref } from 'vue';
import mpvPlayer from './components/mpv-player.vue';
const videoUrl = ref('')
</script>

<style lang="scss" scoped>
.video-player{
    width: 100%;
    height: 100%;
    background: #000;
}
</style>
