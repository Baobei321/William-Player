<template>
  <div class="tv-index">
    <tv-navbar></tv-navbar>
    <under-img :imgArr="underImgArr" :swipeIndex="swipeIndex" :leave="leave"></under-img>
    <tv-page @keyCodeClick="keyCodeClick" style="width: 100%;height: 100%;z-index: 999;position: relative;">
      <star-recommend @getStarList="getStarList" @change="changeSwiper"></star-recommend>
      <hx-list title="电影" :listData="localMovieTvData?.movie" v-if="localMovieTvData?.movie?.length" ref="hx_list" style="margin-top: 50rpx;"></hx-list>
      <hx-list title="电视剧" :listData="localMovieTvData?.tv" v-if="localMovieTvData?.tv?.length" ref="hx_list1"></hx-list>
      <video-classify></video-classify>
    </tv-page>
  </div>
</template>

<script setup>
import { ref } from "vue";
import tvPage from "@/components/tv/tv-page/index.vue";
import hxList from "./components/index-component/hx-list.vue";
import tvNavbar from "./components/index-component/navbar.vue";
import starRecommend from "./components/index-component/star-recommend.vue";
import videoClassify from "./components/index-component/classify.vue";
import underImg from "./components/index-component/under-img.vue";
import * as CONFIG from "@/utils/config";

const hx_list = ref(null);
const localMovieTvData = ref({});
const underImgArr = ref([]);
const swipeIndex = ref(0);
const leave = ref(false);

localMovieTvData.value = uni.getStorageSync("localMovieTvData");

const keyCodeClick = (keyCode) => {
  hx_list.value.evtMove(keyCode);
};

const getStarList = (arr) => {
  underImgArr.value = arr.map((item) => {
    return CONFIG.IMG_DOMAIN + "/t/p/w1920_and_h1080_bestv2" + item.backdrop;
  });
};
const changeSwiper = (index) => {
  leave.value = true;
  setTimeout(() => {
    swipeIndex.value = index;
    leave.value = false;
  }, 350);
};
</script>

<style lang="scss" scoped>
page {
  width: 100%;
  height: 100%;
  background: #020201;
}
.tv-index {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #020201;
}
</style>
