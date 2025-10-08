<template>
    <div class="hxList" ref="hx_list">
        <div class="hxList-title">
            <div class="hxList-title-left">
                <img v-if="props.type == 'emby'"
                    src="https://gimg3.baidu.com/search/src=https%3A%2F%2Ftiebapic.baidu.com%2Fforum%2Fw%253D120%253Bh%253D120%2Fsign%3D44147d7d4e82b2b7a79f3dc60196a3d2%2Fc9fcc3cec3fdfc03771506c1c33f8794a4c2265e.jpg%3Ftbpicau%3D2025-04-08-05_5fe90c457d4356ee146a73914e8a8871&refer=http%3A%2F%2Fwww.baidu.com&app=2021&size=w240&n=0&g=0n&q=75&fmt=auto?sec=1744045200&t=627b5377de1d3107a8a09cb4f65c9fdc">
                <span>{{ props.title }}</span>
            </div>
            <div class="hxList-title-right" @click="toVideoAll">
                <span :style="{ color: props.type == 'emby' ? '#52b54b' : 'gray' }">全部</span>
                <span v-if="props.type != 'emby'">{{ props.listData.length }}</span>
                <nut-icon name="rect-right" size="10"
                    :custom-color="props.type == 'emby' ? '#52b54b' : 'gray'"></nut-icon>
            </div>
        </div>
        <div class="hxList-list">
            <scroll-view class="hxList-list-scroll" :scroll-x="true" style="width: 100%" :enhanced="true"
                :showScrollbar="false">
                <div class="hxList-list-movie">
                    <div class="hxList-list-movie__item" v-for="item in listData1" :key="item.name"
                        @click="toVideoDetail(item)">
                        <img :src="!props.isConnected && !item.loadImg ? emptyBg : setEmptyImg(item.poster)"
                            style="object-fit: cover;" @error="imgError(item)" @load="imgLoad(item)">
                        <span class="hxList-list-movie__item-name">{{ removeExtension(item.name) }}</span>
                        <span class="hxList-list-movie__item-time">{{ item.releaseTime || '暂无' }}</span>
                    </div>
                </div>
            </scroll-view>
        </div>
    </div>
</template>
<script setup>
import { ref, nextTick } from "vue";
import emptyBg from "@/static/empty_bg.png";
import posterEmpty from "@/static/poster-empty.png";
import { onShow } from "@dcloudio/uni-app";
import { handleSeasonName } from "@/utils/scrape";
import * as CONFIG from "@/utils/config";
import { useRouter } from "vue-router";

const props = defineProps({
    title: { type: String, default: "电影" },
    type: { type: String, default: "" },
    listData: { type: Array, default: [] },
    isConnected: { type: Boolean, default: false }, //手机是否连接网络
});

const router = useRouter()
const emits = defineEmits(['clickAll'])
const listData1 = ref(JSON.parse(JSON.stringify(props.listData)).slice(0, 30));
listData1.value.forEach((item) => {
    item.loadImg = true;
});

const removeExtension = (filename) => {
    let name = handleSeasonName(filename, true);
    if (name.length > 7) {
        name = name.slice(0, 6) + "...";
    }
    return name;
};

const typeMapping = {
    "电影": "movie",
    "电视剧": "tv",
};
const toVideoDetail = (item) => {
    router.push({
        path: `/homeDetail`,
        query: { name: handleSeasonName(item.name, true), type: typeMapping[props.title], source: JSON.stringify(item.source), movieTvId: item.movieTvId }
    })
};

const toVideoAll = () => {
    if (props.type == 'emby') {
        emits('clickAll')
    } else {
        uni.navigateTo({
            url: `/pages/mobile/video/video-all?title=${props.title}&isConnected1=${props.isConnected}`,
        });
    }
};

const imgError = (item) => {
    item.loadImg = false;
};

const imgLoad = (item) => {
    if (!props.isConnected && !item.loadImg) return;
    item.loadImg = true;
};

const setEmptyImg = (poster) => {
    if (poster) {
        if (props.type == 'emby') {
            return poster
        } else {
            return CONFIG.IMG_DOMAIN + "/t/p/w300_and_h450_bestv2" + poster;
        }
    } else {
        return posterEmpty;
    }
};

onShow(() => {
    nextTick(() => {
        listData1.value = JSON.parse(JSON.stringify(props.listData)).slice(0, 30);
        listData1.value.forEach((item) => {
            item.loadImg = true;
        });
    });
});
</script>
<style lang="scss" scoped>
@keyframes opacityIn {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

.hxList {
    width: 100%;
    margin-bottom: 50rpx;
    overflow-x: hidden;

    .hxList-title {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .hxList-title-left {
            display: flex;
            align-items: center;

            img {
                width: 30rpx;
                height: 30rpx;
            }

            span {
                font-size: 36rpx;
                font-weight: bold;
                color: #000;
            }
        }

        .hxList-title-right {
            display: flex;
            align-items: center;

            span {
                font-size: 30rpx;
                line-height: 30rpx;
                color: gray;
            }

            span:nth-child(2) {
                padding-left: 6rpx;
            }
        }
    }

    .hxList-list {
        margin-top: 24rpx;

        .hxList-list-scroll {
            width: 100%;

            .hxList-list-movie {
                display: flex;
                flex-wrap: nowrap;
                align-items: center;

                .hxList-list-movie__item {
                    margin-left: 24rpx;
                    flex: 0 0 calc((100% - 168rpx) / 8);
                    cursor: pointer;
                    overflow: hidden;

                    img {
                        width: 100%;
                        aspect-ratio: 107 / 160;
                        height: auto;
                        border-radius: 20rpx;
                        object-fit: cover;
                    }

                    &-name {
                        font-size: 28rpx;
                        font-weight: bold;
                        color: #000;
                        display: block;
                        width: 100%;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    &-time {
                        font-size: 24rpx;
                        color: gray;
                        padding-top: 6rpx;
                        display: block;
                    }

                    &:first-child {
                        margin-left: 0;
                    }
                }

                .is-move {
                    transition: transform 0.3s ease;
                }

                .is-new {
                    animation: opacityIn 0.3s ease;
                }
            }
        }
    }
}

// @media (prefers-color-scheme: dark) {
//   .hxList {
//     .hxList-title {
//       .hxList-title-left {
//         color: #fff;
//       }

//       .hxList-title-right {
//         display: flex;
//         align-items: center;

//         span {
//           font-size: 30rpx;
//           line-height: 30rpx;
//           color: rgb(154, 154, 154);
//         }
//       }
//     }

//     .hxList-list {
//       .hxList-list-scroll {
//         .hxList-list-movie {
//           .hxList-list-movie__item {
//             &-name {
//               color: #fff;
//             }

//             &-time {
//               color: rgb(154, 154, 154);
//             }
//           }
//         }
//       }
//     }
//   }
// }</style>