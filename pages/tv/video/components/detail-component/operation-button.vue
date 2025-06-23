<template>
    <div class="operation-button">
        <div class="operation-button-play" :class="[activeButton === 'play' ? 'operation-button-active' : '']">
            <image src="@/static/play-black.png" v-if="activeButton === 'play'"></image>
            <image src="@/static/play-gray.png" v-else></image>
            <div class="operation-button-play__text">
                <span>立即观看</span>
                <span>第一集</span>
            </div>
        </div>
        <div class="operation-button-tvlist operation-button-item"
            :class="[activeButton === 'tvlist' ? 'operation-button-active' : '']">
            <image src="@/static/playlist-black.png" v-if="activeButton === 'tvlist'"></image>
            <image src="@/static/playlist-gray.png" v-else></image>
            <span>剧集</span>
        </div>
        <div class="operation-button-actor operation-button-item"
            :class="[activeButton === 'actor' ? 'operation-button-active' : '']">
            <image src="@/static/people-black.png" v-if="activeButton === 'actor'"></image>
            <image src="@/static/people-gray.png" v-else></image>
            <span>演职人员</span>
        </div>
        <div class="operation-button-more operation-button-item"
            :class="[activeButton === 'more' ? 'operation-button-active' : '']">
            <image src="@/static/gengduo-black.png" v-if="activeButton === 'more'"></image>
            <image src="@/static/gengduo-gray.png" v-else></image>
            <span>更多</span>
        </div>
        <!-- d3c4b4
        383029 -->
    </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    type: { type: String, default: 'tv' }
})

const activeButton = ref('play')
let tvButtonArr = ['play', 'source', 'season', 'tvlist', 'actor', 'more']
let movieButtonArr = ['play', 'source', 'actor', 'more']
let buttonArr = props.type === 'tv' ? tvButtonArr : movieButtonArr

const evtMove = (keyCode) => {
    if (keyCode === "KeyUp") {
        let index = buttonArr.findIndex(i => i === activeButton.value)
        if (index > 0) {
            activeButton.value = buttonArr[index - 1]
        }
    } else if (keyCode === "KeyDown") {
        let index = buttonArr.findIndex(i => i === activeButton.value)
        console.log(index, 'index');

        if (index < buttonArr.length - 1) {
            activeButton.value = buttonArr[index + 1]
        }
        console.log(activeButton.value, 'active.value');

    } else if (keyCode === 'KeyEnter') {

    }
};
defineExpose({
    evtMove,
})
</script>

<style lang="scss" scoped>
.operation-button {
    flex: 1;
    position: relative;
    margin-top: 40rpx;

    .operation-button-play {
        display: flex;
        align-items: center;
        padding: 30rpx 40rpx;
        border-radius: 16rpx;

        image {
            width: 35rpx;
            height: 35rpx;
        }

        .operation-button-play__text {
            display: flex;
            flex-direction: column;
            padding-left: 30rpx;
            color: #c5c6d0;
            font-weight: bold;
            font-size: 32rpx;

            span:last-child {
                font-size: 26rpx;
                padding-top: 10rpx;
            }
        }
    }


    .operation-button-item {
        display: flex;
        align-items: center;
        padding: 30rpx 40rpx;
        border-radius: 16rpx;

        image {
            width: 35rpx;
            height: 35rpx;
        }

        span {
            font-size: 32rpx;
            color: #c5c6d0;
            padding-left: 30rpx;
            font-weight: bold;
        }
    }

    .operation-button-active {
        background: #e5e6ec;

        .operation-button-play__text {
            color: #000015;
        }

        span {
            color: #000015;
        }
    }

    .operation-button-more {
        position: absolute;
        bottom: 0;
        width: 100%;
    }
}
</style>
