<template>
    <div class="question">
        <div class="question-title" @click="back">
            <img src="@/static/rect-leftblack.png">
            <span>{{ route.query.title }}</span>
        </div>
        <div class="question-container">
            <iframe :src="route.query.url"></iframe>
        </div>
    </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';

const route= useRoute()
const router =useRouter()

const back = ()=>{
    router.go(-1)
}

</script>

<style lang="scss" scoped>
.question {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;

    .question-title {
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

    .question-container {
        overflow: hidden;
        flex: 1;
        width: 100%;
        iframe {
            // aspect-ratio: 375/812;
            width: 100%;
            height: 100%;
            border: none;
        }
    }
}
</style>
