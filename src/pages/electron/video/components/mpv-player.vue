<template>
    <div ref="playerRef"  class="mpv-player">
        <embed ref="mpvRef" id="mpvjs" type="application/x-mpvjs" wmode="transparent" />

    </div>
</template>

<script setup>
import { ref, watch ,nextTick} from 'vue';
import Mpv from "./mpv.js";

const props = defineProps({
    videoUrl: { type: String, default: '' }
})

const mpvRef = ref(null);
const playerRef = ref(null);
let timer;
let mpv;

const playFile = (src) => {

    mpv.loadFile(src);
    mpv.goPlay(true);
    // mps.paused = false;
    noSleep.enable();
}

const onVideoSrcChange = (newVal) => {
    if (mpv) {
        playFile(newVal);
        return;
    }
    nextTick(() => {
        mpv = new Mpv(document.getElementById("mpvjs"));
        mpv.playerReady();
        setTimeout(() => playFile(newVal), 1000);
    });
}


watch(
    () => props.videoUrl,
    (val) => {
        onVideoSrcChange(val)
    }, { immediate: true }
)
</script>

<style lang="scss" scoped></style>
