<template>
    <div class="qq">
        <wil-title title="QQ交流"></wil-title>
        <div class="qq-container">
            <iframe :src="url"></iframe>
        </div>
    </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import * as CONFIG from '@/utils/config'
import wilTitle from '@/components/electron/wil-title/index.vue'

const route = useRoute()
const router = useRouter()
const url = CONFIG.BASE_URL.split(":4040")[0] + ':8443/app-webview/#/qqTalk'

const back = () => {
    router.go(-1)
}

</script>

<style lang="scss" scoped>
.qq {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;

    .qq-title {
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 24rpx;
        width: 100%;

        img {
            width: 40rpx;
            height: 40rpx;
        }

        span {
            margin-left: 12rpx;
            font-weight: bold;
        }
    }

    .qq-container {
        overflow: hidden;
        flex: 1;
        width: 100%;
        display: flex;
        justify-content: center;
        background: #f3f2f7;
        iframe {
            aspect-ratio: 375/812;
            // width: 100%;
            height: 100%;
            border: none;
        }
    }
}
</style>
