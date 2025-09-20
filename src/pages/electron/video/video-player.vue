<template>
<div class="video-player">
    <mpv-player :video-url="videoUrl"></mpv-player>
</div>
</template>

<script setup>
import { ref } from 'vue';
import mpvPlayer from './components/mpv-player.vue';
const videoUrl = ref('https://media-ynkm-fy-home.yn7oss.ctyunxs.cn/FAMILYCLOUD/f4a332e0-175e-4953-b49d-6cb604d41129.mkv?response-content-disposition=attachment%3Bfilename%3D%22%E6%88%91%E4%BB%AC%E4%B8%80%E8%B5%B7%E6%91%87%E5%A4%AA%E9%98%B3.mkv%22%3Bfilename*%3DUTF-8%27%27%25E6%2588%2591%25E4%25BB%25AC%25E4%25B8%2580%25E8%25B5%25B7%25E6%2591%2587%25E5%25A4%25AA%25E9%2598%25B3.mkv&x-amz-CLIENTNETWORK=UNKNOWN&x-amz-CLOUDTYPEIN=PERSON&x-amz-CLIENTTYPEIN=PC&Signature=Rk0w5QXMAdkTNBvNeCAzLyM3rQY%3D&AWSAccessKeyId=0Lg7dAq3ZfHvePP8DKEU&x-amz-userLevel=0&Expires=1758403124&x-amz-limitrate=51200&x-amz-FSIZE=20088569769&x-amz-UID=64784934&x-amz-UFID=623673146768921394')
</script>

<style lang="scss" scoped>

</style>
