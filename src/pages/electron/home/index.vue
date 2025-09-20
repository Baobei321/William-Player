<template>
    <div class="home">
        <under-img :imgArr="underImgArr" :swipeIndex="swipeIndex" :leave="leave"></under-img>
        <div class="home-container">
            <star-recommend @getStarList="getStarList" @change="changeSwiper" ref="star_recommend"></star-recommend>
            <div class="home-container-list">
                <recent-played v-if="historyPlay.length" :listData="historyPlay"
                    :isConnected="isConnected"></recent-played>
            </div>
        </div>
        <wil-modal ref="wil_modal"></wil-modal>
    </div>
</template>

<script setup>
import underImg from "../components/under-img.vue";
import starRecommend from "../components/star-recommend.vue";
import recentPlayed from "./components/recent-played.vue";
import wilModal from "@/components/mobile/wil-modal/index.vue";
import { ipc } from "@/utils/ipcRenderer";
import { ipcApiRoute } from "@/utils/ipcApiRoute";
import { ref } from "vue";
import * as CONFIG from '@/utils/config'
import { useVideoIndex } from '@/hooks/useVideoIndex'

const underImgArr = ref([])
const swipeIndex = ref(0)
const leave = ref(false)

const wil_modal = ref(null)

const { video_navbar, refreshData, refreshLoading, movieTvData, localMovieTvData, tmdbKey, historyPlay, settingData, selectType, refreshVideo } = useVideoIndex({ wil_modal });


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

        .home-container-list {
            padding: 0 24rpx;
        }
    }

}
</style>
