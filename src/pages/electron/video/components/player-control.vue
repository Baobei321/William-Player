<template>
    <div class="player-control" ref="player_control" @mousemove="onMouseMove" @mouseup="stopDrag">
        <div class="player-control-bottom">
            <div class="player-control-bottom-top">
                <div class="player-control-bottom-timenow">{{ timeNow }}</div>
                <div class="player-control-bottom__slide" @click="changeSlide">
                    <div class="player-control-bottom__slide-bar" :style="{ width: positionX + 'px' }"></div>
                    <div class="player-control-bottom__slide-button" :style="{ left: positionX - 6 + 'px' }"
                        @mousedown="startDrag">
                    </div>
                </div>
                <div class="player-control-bottom-timelength">{{ props.timeLength || '00:00' }}</div>
            </div>
            <div class="player-control-bottom-bottom">
                div.
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
const props = defineProps({
    title: { type: String, default: '' },
    timeLength: { type: String, default: '' },
})

const draggableElement = ref(null);
const isDragging = ref(false);
const positionX = ref(0); //进度条移动的距离
const timeNow = ref('00:00')//当前时间
const player_control = ref(null)

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
    if (!isDragging.value) return;

    // 计算鼠标移动的距离（仅x轴）
    const deltaX = event.clientX - startX;
    // 更新元素位置
    if (elementStartLeft + deltaX < 0) {
        positionX.value = 0
        return
    }
    if (elementStartLeft + deltaX > slideWidth - 6) {
        positionX.value = slideWidth - 6
        return
    }
    positionX.value = elementStartLeft + deltaX;
};

// 鼠标松开事件处理
const stopDrag = () => {
    isDragging.value = false;
};

//点击进度条的事件
const changeSlide = (event) => {
    positionX.value = event.offsetX
}

onMounted(() => {
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

    .player-control-bottom {

        margin-top: 150px;

        .player-control-bottom-top {
            width: 100%;
            display: flex;
            align-items: center;

            .player-control-bottom-timenow {
                padding-right: 20rpx;
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
            }

        }


    }
}
</style>
