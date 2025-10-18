<template>
    <div class="player-control" ref="player_control" @mousemove="onMouseMove" @mouseup="stopDrag">
        <div class="player-control-container">
            <div :class="['player-control-top', controlVisible ? 'showTop' : '']">
                <div class="player-control-top-title">宝物岛 第一集</div>
            </div>
            <div class="player-control-center">
                <div :class="['player-control-center-left', controlVisible ? 'showLeft' : '']">
                    <div class="player-control-center-left__audio" @click="getAudioTrack">
                        <img src="@/static/yinpin-white.png">
                    </div>
                    <div class="player-control-center-left__text" @click="getSubTitleTrack">
                        <img src="@/static/zimu-white.png">
                    </div>
                </div>
                <div :class="['player-control-center-right', controlVisible ? 'showRight' : '']">
                    <div class="player-control-center-right__lock">
                        <img src="@/static/noLock-white.png">
                    </div>
                </div>
            </div>
            <div :class="['player-control-bottom', controlVisible ? 'showBottom' : '']">
                <div class="player-control-bottom-top">
                    <div class="player-control-bottom-timenow">{{ timePos }}</div>
                    <div class="player-control-bottom__slide" @click="changeSlide">
                        <div class="player-control-bottom__slide-bar" :style="{ width: positionX + 'px' }"></div>
                        <div class="player-control-bottom__slide-button" :style="{ left: positionX - 6 + 'px' }"
                            @mousedown="startDrag">
                        </div>
                    </div>
                    <div class="player-control-bottom-timelength">{{ duration || '00:00' }}</div>
                </div>
                <div class="player-control-bottom-bottom">
                    <div class="bottom-left">
                        <img src="@/static/prevEpisode-white.png">
                        <img src="@/static/pause-white.png" @click="onPause" v-if="!props.paused">
                        <img src="@/static/play-white.png" @click="onPause" v-else>
                        <img src="@/static/nextEpisode-white.png">
                    </div>
                    <div class="bottom-right">
                        <img src="@/static/fullscreen-white.png" @click="onFullscreen" v-if="!props.fullScreen">
                        <img src="@/static/exitscreen-white.png" @click="onFullscreen" v-else>
                    </div>
                </div>
            </div>
        </div>
        <Popover v-model:visible="showPopover" :options="popoverOptions" :position="popoverPosition" width="100px"
            @close="closePopover" @clickItem="clickPopover">
        </Popover>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { handleSecond } from '@/utils/scrape.js'
import Popover from '@/components/electron/wil-popover/index.vue';

const props = defineProps({
    title: { type: String, default: '' },
    nowTime: { type: Number, default: 0 },
    timeLength: { type: Number, default: 0 },
    paused: { type: Boolean, default: false },
    fullScreen: { type: Boolean, default: false },
    audioTrack: { type: Array, default: [] },
    subTitleTrack: { type: Array, default: [] },
})

const emits = defineEmits(['onPause', 'onFullscreen', 'getTrackList', 'change'])
const isDragging = ref(false);
const positionX = ref(0); //进度条移动的距离
const timePos = ref('00:00')//当前时间
const duration = ref('00:00')//总的时间
const player_control = ref(null)
const controlVisible = ref(true) //控制条初始化显示
const audioTrackList = ref(null) //音轨列表
const subtitleTrackList = ref(null) //字幕列表
const hideTimer = ref(null)
const showPopover = ref(false)

const popoverPosition = ref({})
const popoverOptions = ref([])

let positionObj = {
    audioPosition: {},
    subtitlePosition: {}
}
let isInit = '' //初始化选择音轨还是字轨
let startX = 0;
let elementStartLeft = 0
let slideWidth = 0
// 鼠标按下事件处理
const startDrag = (event) => {
    isDragging.value = true;

    // 获取元素当前的位置
    const buttonElement = player_control.value.querySelector('.player-control-bottom__slide-button');
    elementStartLeft = parseInt(buttonElement.style.left, 0) || 0;
    startX = buttonElement.getBoundingClientRect().left;
    // 阻止默认行为，避免文本选择
    event.preventDefault();
};
// 鼠标移动事件处理
const onMouseMove = (event) => {
    if (!isDragging.value) { //鼠标移动显示控件
        // 鼠标移动时显示控件，并重置5秒隐藏定时器
        controlVisible.value = true;
        if (showPopover.value) return
        if (hideTimer.value) {
            clearTimeout(hideTimer.value); // 清除之前的定时器
            hideTimer.value = null
        }
        hideTimer.value = setTimeout(() => {
            controlVisible.value = false;
        }, 5000); // 5秒后隐藏
    } else {
        // 计算鼠标移动的距离（仅x轴）
        const deltaX = event.clientX - startX;
        // 更新元素位置
        if (elementStartLeft + deltaX < 0) {
            positionX.value = 0
            emits('change', 0)
            return
        }
        if (elementStartLeft + deltaX > slideWidth) {
            positionX.value = slideWidth
            emits('change', positionX.value / slideWidth * props.timeLength)
            return
        }
        positionX.value = elementStartLeft + deltaX;
        emits('change', positionX.value / slideWidth * props.timeLength)
    }
};

// 鼠标松开事件处理
const stopDrag = () => {
    isDragging.value = false;
};

//点击进度条的事件
const changeSlide = (event) => {
    if (event.target.matches('.player-control-bottom__slide') || event.target.matches('.player-control-bottom__slide-bar')) {
        positionX.value = event.offsetX
        emits('change', positionX.value / slideWidth * props.timeLength)
    }
}

//控制暂停与播放
const onPause = () => {
    emits("onPause")
}
//全屏与退出全屏
const onFullscreen = () => {
    emits("onFullscreen")
}

//点击获取音轨列表
const getAudioTrack = () => {
    isInit ? '' : isInit = 'audio'
    if (hideTimer.value) {
        clearTimeout(hideTimer.value); // 清除之前的定时器
        hideTimer.value = null
    }
    if (audioTrackList.value) {
        if (audioTrackList.value.length) {
            popoverPosition.value = positionObj.audioPosition
            popoverOptions.value = props.audioTrack.map(item => {
                item.label = item.language
                return item
            })
            showPopover.value = true
        } else {
            uni.showToast({
                title: "当前视频没有音轨",
                icon: "none"
            })
        }

    } else {
        emits('getTrackList')
        // getAudioTrack()
    }
}

//点击获取字幕列表
const getSubTitleTrack = () => {
    isInit ? '' : isInit = 'subtitle'
    if (hideTimer.value) {
        clearTimeout(hideTimer.value); // 清除之前的定时器
        hideTimer.value = null
    }
    if (subtitleTrackList.value) {
        if (subtitleTrackList.value.length) {
            popoverPosition.value = positionObj.subtitlePosition
            popoverOptions.value = props.subTitleTrack.map(item => {
                item.label = item.language
                return item
            })
            showPopover.value = true
        } else {
            uni.showToast({
                title: "当前视频没有内嵌字幕",
                icon: "none"
            })
        }
    } else {
        emits('getTrackList')
        // getSubTitleTrack()
    }

}

const closePopover = () => {
    hideTimer.value = setTimeout(() => {
        controlVisible.value = false
    }, 5000);
}

const clickPopover = (item) => {

    hideTimer.value = setTimeout(() => {
        controlVisible.value = false
    }, 5000);
}

watch(
    () => props.nowTime,
    (val) => {
        timePos.value = handleSecond(val)
        positionX.value = val / props.timeLength * slideWidth
    }, { immediate: false }
)

watch(
    () => props.timeLength,
    (val) => {
        duration.value = handleSecond(val)
    }, { immediate: true }
)
watch(
    () => props.audioTrack,
    (val) => {
        audioTrackList.value = val
        if (val.length && isInit === 'audio') {
            getAudioTrack()
        }
    }, { deep: true }
)
watch(
    () => props.subTitleTrack,
    (val) => {
        subtitleTrackList.value = val
        if (val.length && isInit === 'subtitle') {
            getSubTitleTrack()
        }
    }, { deep: true }
)

onMounted(() => {
    hideTimer.value = setTimeout(() => {
        controlVisible.value = false
    }, 5000);
    let rect1 = player_control.value.querySelector('.player-control-center-left__audio').getBoundingClientRect()
    let rect2 = player_control.value.querySelector('.player-control-center-left__text').getBoundingClientRect()
    positionObj.audioPosition = {
        clientX: rect1.left + rect1.width + 10,
        clientY: rect1.top + rect1.height / 2, //100是popover的高度
    }
    positionObj.subtitlePosition = {
        clientX: rect2.left + rect2.width + 10,
        clientY: rect2.top + rect2.height / 2,
    }
    slideWidth = player_control.value.querySelector('.player-control-bottom__slide').offsetWidth
})


</script>

<style lang="scss" scoped>
.player-control {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 99;


    .player-control-container {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        overflow: hidden;
        width: 100%;
        height: 100%;

        .player-control-top {
            transition: transform 0.2s ease-out;
            transform: translateY(-100%);

            .player-control-top-title {
                color: #fff;
                font-size: 40rpx;
                padding: 20rpx 40rpx;
                font-weight: bold;

            }

        }

        .showTop {
            transform: translateY(0);
        }

        .player-control-center {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .player-control-center-left {
                transition: transform 0.2s ease-out;
                transform: translateX(-100%);
                padding-left: 60rpx;

                .player-control-center-left__audio {
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 50%;
                    width: 100rpx;
                    height: 100rpx;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    img {
                        width: 60rpx;
                        height: 60rpx;
                    }
                }

                .player-control-center-left__text {
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 50%;
                    width: 100rpx;
                    height: 100rpx;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-top: 80rpx;

                    img {
                        width: 70rpx;
                        height: 70rpx;
                    }
                }
            }

            .showLeft {
                transform: translateX(0);
            }

            .player-control-center-right {

                padding-right: 60rpx;
                transition: transform 0.2s ease-out;
                transform: translateX(100%);

                .player-control-center-right__lock {
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 50%;
                    width: 100rpx;
                    height: 100rpx;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    img {
                        width: 70rpx;
                        height: 70rpx;
                    }
                }

            }

            .showRight {
                transform: translateX(0);
            }
        }

        .player-control-bottom {
            transition: transform 0.2s ease-out;
            transform: translateY(100%);
            padding: 0 30rpx 50rpx 30rpx;

            .player-control-bottom-top {
                width: 100%;
                display: flex;
                align-items: center;

                .player-control-bottom-timenow {
                    padding-right: 20rpx;
                    color: #fff;
                }

                .player-control-bottom__slide {
                    flex: 1;
                    background: #e4e7ed;
                    height: 16rpx;
                    position: relative;
                    cursor: pointer;
                    border-radius: 8rpx;

                    .player-control-bottom__slide-bar {
                        background: linear-gradient(270deg, #00e038, #32ccff);
                        width: 400rpx;
                        position: absolute;
                        height: 16rpx;
                        border-radius: 8rpx 0 0 8rpx;
                    }

                    .player-control-bottom__slide-button {
                        width: 24rpx;
                        height: 24rpx;
                        background-color: #fff;
                        border-radius: 50%;
                        box-shadow: 0 0 16rpx 0 #00d157;
                        position: absolute;
                        left: 400rpx;
                        top: -4rpx;
                    }
                }

                .player-control-bottom-timelength {
                    padding-left: 20rpx;
                    color: #fff;
                }

            }

            .player-control-bottom-bottom {
                display: flex;
                justify-content: space-between;
                margin-top: 40rpx;

                .bottom-left {
                    img {
                        width: 60rpx;
                        height: 60rpx;
                        cursor: pointer;
                        margin-left: 30rpx;

                        &:first-child {
                            margin-left: 0;
                        }
                    }
                }

                .bottom-right {
                    img {
                        width: 60rpx;
                        height: 60rpx;
                        cursor: pointer;
                    }
                }
            }

        }

        .showBottom {
            transform: translateY(0);
        }
    }

    :deep(.popover) {
        max-height: 150px;
    }

}
</style>
