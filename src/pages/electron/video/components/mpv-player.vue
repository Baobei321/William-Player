<template>
    <div ref="playerRef" class="mpv-player">
        <embed ref="mpvRef" id="mpvjs" type="application/x-mpvjs" wmode="transparent" class="mpv-player-embed" />
        <player-control :nowTime="mpvData.timePos" :time-length="mpvData.duration" :paused="mpvData.paused"
            :fullScreen="mpvData.fullScreen" @onPause="onPause" @onFullscreen="onFullscreen"
            v-if="!mpvData.loading"></player-control>
        <div class="mpv-player-loading" v-else>
            <img src="@/static/loading-white.png">
        </div>
    </div>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount, reactive, onMounted } from 'vue';
import Mpv from "./mpv.js";
import playerControl from './player-control.vue';
import NoSleep from "nosleep.js"

const props = defineProps({
    videoUrl: { type: String, default: '' },
    title: { type: String, default: '' }
})

let noSleep = new NoSleep();
const mpvRef = ref(null);
const playerRef = ref(null);
const mpvData = reactive({
    timePos: 0,
    duration: 0,
    paused: false,
    loading: true,
    fullScreen: false,
})
let timer;
let mpv;
let isInit = true;

const playFile = (src) => {
    mpvData.loading = true
    mpv.loadFile(src);
    mpv.goPlay(true);
    // mps.paused = false;
    noSleep.enable();
}

//从mpv获取一些数据
const onMessage = (e) => {
    const msg = e.data;
    const { type, data } = msg;
    if (mpvData.loading) {
        mpvData.loading = false
    }
    if (data?.name) {
        switch (data.name) {
            case 'time-pos':
                // autoTime();
                mpvData.timePos = Math.round(data.value);
                break;
            case 'duration':
                mpvData.duration = Math.round(data.value);
                break;
        }
    }
}

const onVideoSrcChange = (newVal) => {
    if (mpv) {
        playFile(newVal);
        mpvRef.value.addEventListener('message', onMessage, false);
        return;
    }
    nextTick(() => {
        mpvRef.value.removeEventListener('message', onMessage, false); // 先移除旧监听（若有）
        setTimeout(() => {
            mpv = new Mpv(document.getElementById("mpvjs"));
            mpv.playerReady();
            playFile(newVal)
            mpvRef.value.addEventListener('message', onMessage, false);
        }, 1000);
    });
}
//控制暂停与播放
const onPause = () => {
    if (mpvData.paused === true) {
        // 暂停了，那就播放
        mpv.goPlay(true);
        noSleep.enable();
    } else {
        // 暂停
        mpv.goPlay(false);
        noSleep.disable();
    }
    mpvData.paused = !mpvData.paused;
}

//全屏与退出全屏
const onFullscreen = () => {
    mpvData.fullScreen = !mpvData.fullScreen;
    if (mpvData.fullScreen) {
        playerRef.value.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}
onBeforeUnmount(() => {
    mpvRef.value.removeEventListener('message', onMessage, false);
})

onMounted(() => {
    setTimeout(() => {
        mpv = new Mpv(document.getElementById("mpvjs"));
        mpv.playerReady();
        onVideoSrcChange(props.videoUrl)
    }, 0);
})

watch(
    () => props.videoUrl,
    (val) => {
        onVideoSrcChange(val)
    }, { immediate: true }
)
</script>

<style lang="scss" scoped>
@keyframes spin-reverse {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(-360deg);
    }
}

.mpv-player {
    width: 100%;
    height: 100%;

    .mpv-player-embed {
        width: 100%;
        height: 100%;
    }

    .mpv-player-loading {
        position: absolute;
        width: 100%;
        height: 100%;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99;
        left: 0;
        top: 0;

        img {
            width: 80rpx;
            height: 80rpx;
            animation: spin-reverse 1s linear infinite reverse;
        }
    }
}
</style>
