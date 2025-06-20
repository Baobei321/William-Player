<template>
  <div class="tv-index">
    <tv-navbar ref="tv_navbar" :isFocus="focusModel == 'tvNavbar'" :focusModel="focusModel" @setFocus="setFocus"></tv-navbar>
    <under-img :imgArr="underImgArr" :swipeIndex="swipeIndex" :leave="leave"></under-img>
    <tv-page @keyCodeClick="keyCodeClick" style="width: 100%;height: 100%;z-index: 999;position: relative;"
      :scrollTop="scrollTop">
      <star-recommend @getStarList="getStarList" @change="changeSwiper" @setFocus="setFocus"
        :isFocus="focusModel == 'starRecommend'" :historyPlay="historyPlay" ref="star_recommend"></star-recommend>
      <recent-played v-if="historyPlay.length" :listData="historyPlay" ref="recent_played"
        :isFocus="focusModel == 'recentPlayed'"></recent-played>
      <hx-list title="电影" :listData="localMovieTvData?.movie" :isFocus="focusModel == 'hxMovie'"
        v-if="localMovieTvData?.movie?.length" style="margin-top: 50rpx;" ref="hx_movie" :focusModel="focusModel"
        :historyPlay="historyPlay" :offsetTop="scrollTop" @setFocus="setFocus"></hx-list>
      <hx-list title="电视剧" :listData="localMovieTvData?.tv" :isFocus="focusModel == 'hxTv'"
        v-if="localMovieTvData?.tv?.length" ref="hx_tv" :focusModel="focusModel" :historyPlay="historyPlay"
        :offsetTop="scrollTop" @setFocus="setFocus"></hx-list>
      <video-classify ref="video_classify" :isFocus="focusModel == 'videoClassify'" :focusModel="focusModel"
        :offsetTop="scrollTop" @setFocus="setFocus"></video-classify>
    </tv-page>
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue";
import tvPage from "@/components/tv/tv-page/index.vue";
import recentPlayed from "./components/index-component/recent-played.vue";
import hxList from "./components/index-component/hx-list.vue";
import tvNavbar from "./components/index-component/navbar.vue";
import starRecommend from "./components/index-component/star-recommend.vue";
import videoClassify from "./components/index-component/classify.vue";
import underImg from "./components/index-component/under-img.vue";
import * as CONFIG from "@/utils/config";
import { useVideoIndex } from "@/hooks/useVideoIndex.js";
import { debounce } from "@/utils/scrape";
const { video_navbar, refreshData, refreshLoading, movieTvData, localMovieTvData, tmdbKey, historyPlay, settingData, refreshVideo } = useVideoIndex();

const tv_navbar = ref(null);
const star_recommend = ref(null);
const recent_played = ref(null);
const hx_movie = ref(null);
const hx_tv = ref(null);
const video_classify = ref(null);

const underImgArr = ref([]);
const swipeIndex = ref(0);
const leave = ref(false);

const focusModel = ref("starRecommend");
const scrollTop = ref(0)

const keyCodeClick = (keyCode) => {
  if (!tv_navbar.value) return; //用于保证dom已加载完成
  let mapping = {
    "tvNavbar": tv_navbar.value,
    "starRecommend": star_recommend.value,
    "recentPlayed": recent_played.value,
    "hxMovie": hx_movie.value,
    "hxTv": hx_tv.value,
    "videoClassify": video_classify.value,
  };
  mapping[focusModel.value].evtMove(keyCode);
};

const setScrollTop = debounce(async (refValue) => {
  console.log("执行");
  nextTick(() => {
    scrollTop.value = refValue.getScrollTop()
  })
}, 300);

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

let nowTime = 0;
const setFocus = async (val, keyCode) => {
  focusModel.value = val;
  // scrollTop.value = offsetTop
  // console.log(offsetTop,'offset');
  let mapping = {
    "tvNavbar": tv_navbar.value,
    "starRecommend": star_recommend.value,
    "recentPlayed": recent_played.value,
    "hxMovie": hx_movie.value,
    "hxTv": hx_tv.value,
    "videoClassify": video_classify.value,
  };
  if (keyCode === "KeyUp" || keyCode === "KeyDown") {
    let time = Date.now();
    if (time - nowTime > 300) {
      nextTick(() => {
        scrollTop.value = mapping[focusModel.value].getScrollTop()
      })
    } else {
      setScrollTop(mapping[focusModel.value]);
    }
    nowTime = time;
  }
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
