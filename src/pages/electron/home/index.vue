<template>
    <div class="home">
        <home-navbar @refresh="refreshVideo" @pause="pauseRefresh" :refreshData="refreshData" :loading="refreshLoading"
            ref="video_navbar">
        </home-navbar>
        <template v-if="!refreshLoading">
            <under-img :imgArr="underImgArr" :swipeIndex="swipeIndex" :leave="leave"></under-img>
            <div class="home-container">
                <star-recommend @getStarList="getStarList" @change="changeSwiper" ref="star_recommend"
                    :initPage="swipeIndex" :showSwiper="showSwiper"></star-recommend>
                <div class="home-container-list">
                    <recent-played v-if="historyPlay.length" :listData="historyPlay"></recent-played>
                    <hx-list title="电影" :listData="localMovieTvData?.movie"
                        v-if="localMovieTvData?.movie?.length"></hx-list>
                    <hx-list title="电视剧" :listData="localMovieTvData?.tv" v-if="localMovieTvData?.tv?.length"></hx-list>
                    <Classify></Classify>
                </div>
            </div>
        </template>
        <Skeleton v-else></Skeleton>
        <!-- 使用teleport挂载到body去 -->
        <wil-modal ref="wil_modal"></wil-modal>
    </div>
</template>

<script setup>
import underImg from "../components/under-img.vue";
import homeNavbar from "./components/navbar.vue"
import starRecommend from "../components/star-recommend.vue";
import recentPlayed from "./components/recent-played.vue";
import hxList from "./components/hx-list.vue";
import Classify from "./components/classify.vue";
import wilModal from "@/components/mobile/wil-modal/index.vue";
import { ipc } from "@/utils/ipcRenderer";
import { ipcApiRoute } from "@/utils/ipcApiRoute";
import { nextTick, onActivated, onDeactivated, onMounted, onUnmounted, ref } from "vue";
import * as CONFIG from '@/utils/config'
import { useVideoIndex } from '@/hooks/useVideoIndex'
import { defineOptions } from 'vue';
import { useRouter } from "vue-router";
import Skeleton from "./components/skeleton.vue";
defineOptions({
    name: 'Home'
})

const router = useRouter()
const underImgArr = ref([])
const swipeIndex = ref(0)
const leave = ref(false)
const wil_modal = ref(null)
const showSwiper = ref(true)

let scrollTop = 0

const { video_navbar, refreshData, refreshLoading, movieTvData, localMovieTvData, tmdbKey, historyPlay, settingData, selectType, refreshVideo, showPage } = useVideoIndex({ wil_modal });


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

const pauseRefresh = () => {
    refreshData.value = { found: 0, toupdate: 0, updated: 0, success: 0, fail: 0 };
    movieTvData.value = { movie: [], tv: [] };
    localMovieTvData.value.tv = [];
    localMovieTvData.value.movie = [];
    uni.setStorageSync("localMovieTvData", localMovieTvData.value);
    refreshLoading.value = false;
};

const openVideo = () => {
    let args = {
        type: 'vue',
        content: '/video',
        windowName: 'Video',
        windowTitle: `正在播放：`,
        opusId: '1'
    };
    ipc.invoke(ipcApiRoute.createMpv, args).then(id => {
        console.log('[createWindow] id:', id);
    });
}

const handleResize = () => {
    showSwiper.value = false
    nextTick(() => {
        showSwiper.value = true
    })
}

onMounted(() => {
    window.addEventListener('resize', handleResize);
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
})

onActivated(() => {
    let element = document.querySelector('.home-container')
    element.scrollTop = scrollTop
    // setTimeout(() => {
    showPage()
    // }, 300);
})
onDeactivated(() => {
    let element = document.querySelector('.home-container')
    scrollTop = element.scrollTop
})
</script>

<style lang="scss" scoped>
.home {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
    z-index: 1;

    .home-container {
        width: 100%;
        height: 100%;
        overflow: auto;
        position: relative;
        z-index: 999;

        .home-container-list {
            padding: 0 100rpx;
            padding-bottom: 100rpx;
        }
    }

}
</style>
