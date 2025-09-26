<template>
    <div class="actor-list">
        <div class="related-actors" v-if="actors.length">
            <div class="related-actors-title">
                <div class="title-left">相关演员</div>
                <div class="title-right">
                    <div class="arrow-left" @click="slideActor('left')">
                        <img src="@/static/rect-leftblack.png">
                    </div>
                    <div class="arrow-right" @click="slideActor('right')">
                        <img src="@/static/rect-leftblack.png">
                    </div>
                </div>
            </div>
            <scroll-view class="related-actors-scroll" :scroll-x="true" style="width: 100%" :enhanced="true"
                :scroll-with-animation="true" :scroll-into-view="scrollIntoView" :showScrollbar="false">
                <div class="related-actors-list">
                    <div class="related-actors-list__item" v-for="(item, index) in actors" :key="item.name"
                        :id="'name' + (index + 1)">
                        <img class="item-avatar" :src="setActorAvatar(item.profile_path)">
                        <div class="item-name">{{ item.name }}</div>
                        <div class="item job" v-if="item.role">{{ item.role }}</div>
                        <div class="item-role" v-else>饰 {{ item.character }}</div>
                    </div>
                </div>
            </scroll-view>
        </div>
        <div class="tip-footer">
            <span class="tip-footer-name">{{ handleSeasonName(props.selectSource.name, true) + '-' }}</span>
            <span class="tip-footer-webdav">路径：{{ props.selectSource.path }}</span>
            <div class="tip-footer-timesize">
                <span v-if="imgData.runtime">{{ imgData.runtime }}</span><span>{{ props.selectSource.sourceName
                }}</span>
                <span v-if="props.selectSource.size">{{ props.routerParams.type == 'movie' ? props.selectSource.size :
                    handleSize(props.selectSource.size) }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onBeforeMount } from "vue";
import { handleSeasonName, debounce } from "@/utils/scrape";
import * as CONFIG from "@/utils/config";

const props = defineProps({
    routerParams: { type: Object, default: {} },
    selectSource: { type: Object, default: {} },
    imgData: { type: Object, default: {} },
    actorArr: { type: Array, default: [] },
    type: { type: String, default: 'normal' }
});
const director = ref({});
const actors = ref([]);
const scrollIntoView = ref('name1')
let nowTime = 0;

//处理内存大小
const handleSize = (size) => {
    if (size == 0) return "0";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(size) / Math.log(1024));
    const formatted = parseFloat((size / Math.pow(1024, i)).toFixed(2));
    return formatted + " " + sizes[i];
};
//获取演员表
const getActorById = (data, type) => {
    let url = "";
    let obj = JSON.parse(JSON.stringify(data));
    if (!data.movieTvId || !obj.movieTvId) return Promise.reject();
    if (type == "movie") {
        url = `https://api.tmdb.org/3/movie/${obj.movieTvId}/credits`;
    } else if (type == "tv") {
        url = `https://api.tmdb.org/3/tv/${obj.movieTvId}/credits`;
    }
    return new Promise((resolve) => {
        uni.request({
            url: url,
            data: {
                language: "zh-CN",
                api_key: uni.getStorageSync("settingData").tmdbKey,
            },
            method: "GET",
            header: {
                "Content-Type": "application/json",
            },
            success: (res) => {
                resolve(res.data);
            },
        });
    });
};
const getActorList = async () => {
    let res = await getActorById(
        {
            movieTvId: props.routerParams.movieTvId,
        },
        props.routerParams.type
    );
    director.value = res?.crew[0] || {};
    actors.value = res.cast.slice(0, 20);
    if (director.value.name) {
        director.value.role = '导演'
        actors.value.unshift(director.value)
    }
};

//设置演员头像
const setActorAvatar = (url) => {
    if (props.type == 'normal') {
        return url ? CONFIG.IMG_DOMAIN + '/t/p/w100_and_h100_bestv2' + url : 'https://storage.7x24cc.com/storage-server/presigned/ss1/a6-online-fileupload/newMediaImage/2AFA742_427A_user-avatar_20241225150546694newMediaImage.png'
    } else if (props.type == 'emby') {
        return url
    }
}

const setScrollIntoView = debounce((direction) => {
    handleSilde(direction)
}, 300);

const handleSilde = (direction) => {
    if (direction === 'left') {
        let number = +scrollIntoView.value.split('name')[1]
        if (number > 5) {
            scrollIntoView.value = 'name' + (number - 5)
        } else {
            scrollIntoView.value = 'name1'
        }
    } else if (direction === 'right') {
        let number = +scrollIntoView.value.split('name')[1]
        if (number < actors.value.length - 9) {
            if (number + 5 >= actors.value.length - 9) {
                scrollIntoView.value = 'name' + (actors.value.length - 9)
            } else {
                scrollIntoView.value = 'name' + (number + 5)
            }
        } else {
            scrollIntoView.value = 'name' + (actors.value.length - 9)
        }
    }
}
const slideActor = (direction) => {
    let time = Date.now();
    if (time - nowTime > 300) {
        handleSilde(direction)
    } else {
        setScrollIntoView(direction);
    }
    nowTime = time;
}

defineExpose({
    getActorList,
});
onBeforeMount(() => {
    if (props.actorArr.length) {
        actors.value = props.actorArr
    } else {
        getActorList();
    }
});
</script>

<style lang="scss" scoped>
.actor-list {
    width: 100%;

    .story-introduction {
        margin-top: 50rpx;

        .story-introduction-title {
            font-size: 32rpx;
            font-weight: bold;
            color: #000;
            padding-bottom: 20rpx;
        }

        .story-introduction-text {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 28rpx;
            color: #000;
        }
    }

    .related-actors {
        margin-top: 50rpx;

        .related-actors-title {
            padding-bottom: 20rpx;
            display: flex;
            align-items: center;
            justify-content: space-between;

            .title-left {
                font-size: 32rpx;
                font-weight: bold;
                color: #000;
            }

            .title-right {
                display: flex;
                align-items: center;

                .arrow-left {
                    width: 56rpx;
                    height: 56rpx;
                    border-radius: 50%;
                    border: 2rpx solid #000;
                    padding: 10rpx;
                    cursor: pointer;

                    img {
                        width: 100%;
                        height: 100%;
                    }
                }

                .arrow-right {
                    width: 56rpx;
                    height: 56rpx;
                    border-radius: 50%;
                    border: 2rpx solid #000;
                    padding: 10rpx;
                    margin-left: 24rpx;
                    cursor: pointer;

                    img {
                        width: 100%;
                        height: 100%;
                        transform: rotate(180deg);
                    }
                }
            }
        }

        .related-actors-scroll {
            .related-actors-list {
                display: flex;
                align-items: center;
                flex-wrap: nowrap;

                .related-actors-list__item {
                    margin-left: 24rpx;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    flex: 0 0 calc((100% - 216rpx) / 10);
                    overflow: hidden;

                    &:first-child {
                        margin-left: 0;
                    }

                    .item-avatar {
                        width: 100%;
                        aspect-ratio: 1/1;
                        border-radius: 50%;
                        object-fit: cover;
                    }

                    .item-name {
                        font-size: 28rpx;
                        color: #000;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        text-align: center;
                        width: 100%;
                    }

                    .item-job {
                        padding: 4rpx 6rpx;
                        border: 2rpx solid #000;
                        font-size: 20rpx;
                        color: #000;
                        border-radius: 6rpx;
                        height: 35rpx;
                        box-sizing: border-box;
                    }

                    .item-role {
                        height: 35rpx;
                        line-height: 35rpx;
                        font-size: 24rpx;
                        color: #000;
                        width: 100%;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        text-align: center;
                    }
                }
            }
        }
    }

    .tip-footer {
        margin-top: 50rpx;
        padding-top: 20rpx;
        border-top: 2rpx solid #000;
        width: 100%;

        .tip-footer-name {
            font-size: 24rpx;
            color: #000;
        }

        .tip-footer-webdav {
            font-size: 24rpx;
            color: #000;
            padding-top: 20rpx;
            word-break: break-all;
            /* 允许在任意字符间断行 */
        }

        .tip-footer-timesize {
            font-size: 24rpx;
            color: #000;
            font-weight: bold;
            display: flex;
            align-items: center;
            padding-top: 20rpx;

            span:nth-child(2) {
                padding-left: 10rpx;
            }

            span:last-child {
                padding-left: 10rpx;
            }
        }
    }
}

// @media (prefers-color-scheme: dark) {
//   .actor-list {
//     .story-introduction {
//       .story-introduction-title {
//         color: #fff;
//       }
//       .story-introduction-text {
//         color: #fff;
//       }
//     }

//     .related-actors {
//       .related-actors-title {
//         color: #fff;
//       }

//       .related-actors-scroll {
//         .related-actors-list {
//           .related-actors-list__item {
//             .item-name {
//               color: #fff;
//             }

//             .item-role {
//               height: 35rpx;
//               line-height: 35rpx;
//               font-size: 24rpx;
//               color: #c2c5c6;
//               width: 100%;
//               white-space: nowrap;
//               overflow: hidden;
//               text-overflow: ellipsis;
//               text-align: center;
//             }
//           }
//         }
//       }
//     }
//     .tip-footer {
//       margin-top: 50rpx;
//       padding-top: 20rpx;
//       border-top: 2rpx solid #c2c5c6;
//       width: 100%;
//       .tip-footer-name {
//         font-size: 24rpx;
//         color: #c2c5c6;
//       }

//       .tip-footer-webdav {
//         font-size: 24rpx;
//         color: #c2c5c6;
//         padding-top: 20rpx;
//         word-break: break-all; /* 允许在任意字符间断行 */
//       }

//       .tip-footer-timesize {
//         font-size: 24rpx;
//         color: #acacac;
//         font-weight: bold;
//         display: flex;
//         align-items: center;
//         padding-top: 20rpx;

//         span:nth-child(2) {
//           padding-left: 10rpx;
//         }

//         span:last-child {
//           padding-left: 10rpx;
//         }
//       }
//     }
//   }
// }</style>
