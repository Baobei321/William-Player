<template>
    <div class="wil-progress">
        <div :class="['wil-progress-outer', props.size === 'small' ? 'wil-progress-small' : '', props.size === 'large' ? 'wil-progress-large' : '']"
            :style="{ '--bar-height': props.strokeWidth }">
            <div :class="['wil-progress-inner', props.active ? 'wil-progress-inner__active' : '']"
                :style="{ width: percentageVal + '%', background: props.color }">
            </div>
            <template v-if="props.showText && props.textInside">
                <div class="wil-progress-insideslot" v-if="$slots.insidetext" :style="{ left: percentageVal + '%' }">
                    <slot name="insidetext"></slot>
                </div>
                <div class="wil-progress-insidetext" v-else
                    :style="{ left: percentageVal + '%', backgroundColor: props.textBackground || props.color }">
                    {{ percentageVal + (props.isShowPercentage ? '%' : '') }}
                </div>
            </template>
        </div>
        <template v-if="showText && !props.textInside">
            <slot name="text" v-if="$slots.text"></slot>
            <div class="wil-progress-text" v-else>{{ percentageVal + (props.isShowPercentage ? '%' : '') }}
            </div>
        </template>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    percentage: { type: Number, default: 0 }, //百分比
    isShowPercentage: { type: Boolean, default: true }, //是否需要展示百分号
    color: { type: String, default: '#1989fa' },//进度条颜色
    strokeWidth: { type: [Number, String], default: '20rpx' },//进度条粗细
    size: { type: String, default: 'normal' },//进度条尺寸，可选small,normal,large
    showText: { type: Boolean, default: true },//是否展示进度条文字内容
    textInside: { type: Boolean, default: false },//进度条文字显示位置(false:外显，true:内显)
    textColor: { type: String, default: '#333' },//进度条文字颜色设置
    textBackground: { type: String, default: '' },//进度条文字背景颜色设置,仅文字内显的时候有效
    active: { type: Boolean, default: false },//进度条是否为激活状态，激活状态会有个动画
})

const percentageVal = ref(0)

watch(
    () => props.percentage,
    (val) => {
        if (val > 100) {
            percentageVal.value = 100
        } else if (val < 0) {
            percentageVal.value = 0
        } else {
            percentageVal.value = val
        }
    }, { immediate: true }
)

</script>

<style lang="scss" scoped>
@keyframes progressActive {
    0% {
        width: 0;
        background: hsla(0, 0%, 100%, .1);
    }

    20% {
        background: hsla(0, 0%, 100%, .5);
        width: 0;
    }

    100% {
        background: hsla(0, 0%, 100%, 0);
        width: 100%;
    }
}

.wil-progress {
    display: flex;
    align-items: center;
    position: relative;

    .wil-progress-outer {
        flex: 1;
        border-radius: 24rpx;
        background-color: #f3f3f3;
        height: var(--bar-height);

        .wil-progress-inner {
            height: 100%;
            border-radius: 24rpx;
            transition: all 0.4s;
        }

        .wil-progress-inner__active {
            &::before {
                content: "";
                border-radius: 24rpx;
                height: 100%;
                animation: progressActive 2s ease-in-out infinite;
                position: absolute;
                left: 0;
                top: 0;
            }
        }

        .wil-progress-insideslot {
            position: absolute;
            transform: translate(-50%, -50%);
            top: 50%;
        }

        .wil-progress-insidetext {
            position: absolute;
            transform: translate(-50%, -50%);
            top: 50%;
            padding: 6rpx 10rpx;
            border-radius: 10rpx;
            font-size: 18rpx;
            color: #ffffff;
        }
    }

    .wil-progress-small {
        height: 10rpx;

        .wil-progress-insidetext {
            padding: 4rpx 8rpx;
            font-size: 14rpx;
        }
    }

    .wil-progress-large {
        height: 30rpx;

        .wil-progress-insidetext {
            font-size: 26rpx;
        }
    }

    .wil-progress-text {
        padding: 0 10rpx;
        font-size: 26rpx;
    }
}
</style>
