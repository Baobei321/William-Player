<template>
    <div class="cloud-list">
        <div class="cloud-list-item" v-for="(item, index) in props.list" :key="item.provider + item.name"
            :class="[tabIndex === index ? 'cloud-list-active' : '']">
            <image src="@/static/wangpan-black.png" v-if="tabIndex === index"></image>
            <image src="@/static/wangpan-gray.png" v-else></image>
            <span>{{ item.sourceName }}</span>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
const tabIndex = ref(0)
const props = defineProps({
    list: { type: Array, default: [] }
})
</script>

<style lang="scss" scoped>
.cloud-list {
    .cloud-list-item {
        display: flex;
        align-items: center;
        background: transparent;
        padding: 30rpx 40rpx;
        border-radius: 16rpx;

        image {
            width: 80rpx;
            height: 80rpx;
        }

        span {
            font-size: 32rpx;
            color: #c5c6d0;
            padding-left: 30rpx;
            font-weight: bold;
        }
    }

    .cloud-list-active {
        background: #e5e6ec;

        span {
            color: #000015;
        }
    }
}
</style>
