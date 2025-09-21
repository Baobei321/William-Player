<template>
    <div class="detail">
        <div class="detail-background" :style="{ backgroundImage: `url(${imgData.img})` }">
            <div class="detail-background-overlay"></div>
        </div>
        <div class="detail-header">
            <div class="detail-header-left" @click="back">
                <img src="@/static/rect-leftblack.png">
                <span>{{ route.query.name }}</span>
            </div>
            <div class="detail-header-right">
                <img src="@/static/chilun-black.png">
            </div>
        </div>
        <div class="detail-info">
            <div class="detail-info-img">
                <img :src="CONFIG.IMG_DOMAIN + '/t/p/w300_and_h450_bestv2' + nowMovieTv.poster">
            </div>
            <div class="detail-info-right">
                <div class="detail-info-right__name">{{ imgData.title }}</div>
                <div class="detail-info-right__mid">
                    <div class="mid-score">
                        <img src="@/static/star-fill.png">
                        <span>{{ imgData.score }}</span>
                    </div>
                    <div class="mid-date">
                        <img src="@/static/date-icon.png">
                        <span>{{ imgData.releaseTime }}</span>
                    </div>
                    <div class="mid-runtime">
                        <image src="@/static/clock-icon.png" v-if="routerParams.type == 'movie'"></image>
                        <span>{{ imgData.runtime }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { useVideoDetail } from "@/hooks/userVideoDetail";
import { onBeforeMount } from 'vue';
import * as CONFIG from '@/utils/config'
import { ref } from 'vue'

const route = useRoute()
const router = useRouter()
const nowMovieTv = ref({})

const { showPopover, popoverArr, showTimePicker, pickerTitle, pickerVal, pickerColumns, imgData, overview, sourceList, selectSource, activeSeason, tvList, buttonText,
    routerParams, showRehandleButton, historyTv, scrollIntoView, lineNumber, lineHeight, toSelect, confirmPicker, changeSource, changeTvSource, changeTvSeason, disabledTip,
    clickPlayButton, toPlayVideo, reHandleTv } = useVideoDetail({ route, router })

const back = () => {
    router.go(-1)
}

onBeforeMount(() => {
    const localMovieTvData = uni.getStorageSync('localMovieTvData') || {}
    if (route.query.type === 'tv') {
        nowMovieTv.value = localMovieTvData.tv.find(i => i.movieTvId == route.query.movieTvId)
    } else if (route.query.type === 'movie') {
        nowMovieTv.value = localMovieTvData.movie.find(i => i.movieTvId == route.query.movieTvId)
    }
})
</script>

<style lang="scss" scoped>
.detail {
    width: 100%;
    height: 100%;
    position: relative;

    .detail-background {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        z-index: 1;

        .detail-background-overlay {
            width: 100%;
            height: 100%;
            // background: rgba(0, 0, 0, 0.8);
            background: rgba(255, 255, 255, 0.5);
        }
    }

    .detail-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 24rpx;
        position: relative;
        z-index: 2;

        .detail-header-left {
            display: flex;
            align-items: center;
            cursor: pointer;
        }

        .detail-header-right {
            cursor: pointer;
        }

        img {
            width: 40rpx;
            height: 40rpx;
        }

        span {
            margin-left: 12rpx;
            font-weight: bold;
        }
    }

    .detail-info {
        z-index: 2;
        position: relative;
        padding: 0 100rpx;
        margin-top: 24rpx;
        display: flex;

        .detail-info-img {
            width: 600rpx;
            height: 900rpx;

            img {
                width: 100%;
                height: 100%;
            }
        }

        .detail-info-right {
            .detail-info-right__name {
                font-size: 60rpx;
                font-weight: bold;
            }

            .detail-info-right__mid {
                display: flex;
                align-items: center;

                .mid-score {
                    display: flex;
                    align-items: center;
                    font-size: 30rpx;
                    color: #000;

                    img {
                        width: 20px;
                        height: 20px;
                    }
                }

                .mid-date {
                    display: flex;
                    align-items: center;
                    font-size: 30rpx;
                    color: #000;
                    margin-left: 24rpx;

                    img {
                        width: 20px;
                        height: 20px;
                    }
                }
                .mid-runtime{
                    margin-left: 24rpx;
                    font-size: 30rpx;
                    color: #000;
                }
            }
        }
    }

}
</style>
