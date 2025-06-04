<template>
  <div class="tv-index">
    <tv-page @keyCodeClick="keyCodeClick">
      <hx-list title="电影" :listData="localMovieTvData?.movie" v-if="localMovieTvData?.movie?.length" ref="hx_list"></hx-list>
    </tv-page>
  </div>
</template>

<script setup>
import { ref } from "vue";
import tvPage from "@/components/tv/tv-page/index.vue";
import hxList from "./components/index-component/hx-list.vue";

const hx_list = ref(null);
const localMovieTvData = ref({});
localMovieTvData.value = uni.getStorageSync("localMovieTvData");

const keyCodeClick = (keyCode) => {
  hx_list.value.evtMove(keyCode);
};
</script>

<style lang="scss" scoped>
</style>
