<template>
    <div class="wil-title">
        <div class="wil-title-left" @click="back">
            <img src="@/static/rect-leftblack.png">
            <span>{{ props.title }}</span>
        </div>
        <div class="wil-title-right" v-if="$slots.right">
            <slot name="right"></slot>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
    title: { type: String, default: '' }
})

const router = useRouter()
const back = () => {
    router.go(-1)
}
</script>

<style lang="scss" scoped>
.wil-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx;
    position: relative;
    z-index: 2;
    width: 100%;

    .wil-title-left {
        display: flex;
        align-items: center;
        cursor: pointer;

        img {
            width: 40rpx;
            height: 40rpx;
        }

        span {
            margin-left: 12rpx;
            font-weight: bold;
        }
    }

    .wil-title-right {
        cursor: pointer;
        img {
            display: block;
            width: 40rpx;
            height: 40rpx;
        }
    }


}
</style>
