<template>
    <div class="actor-list">
        <tv-scroll :scroll-y="true" style="width: 100%;height: 100%;" :enhanced="true" :showScrollbar="false"
            :scrollIntoView="scrollIntoView">
            <div class="actor-list-item" v-for="item in actorList" :key="item.id">
                <image
                    :src="item.profile_path ? CONFIG.IMG_DOMAIN + '/t/p/w300_and_h450_bestv2' + item.profile_path : 'https://storage.7x24cc.com/storage-server/presigned/ss1/a6-online-fileupload/newMediaImage/2AFA742_427A_user-avatar_20241225150546694newMediaImage.png'"
                    mode="aspectFill">
                </image>
                <div class="item-right">
                    <div class="item-right-name">{{ item.name }}</div>
                    <div class="item-right-role">{{ item.known_for_department != 'Acting' ? '导演' : '饰' + item.character
                        }}
                    </div>
                    <div class="item-right-gender">{{ item.gender == 1 ? '女' : '男' }}</div>
                    <div class="item-right-tag">TMDB</div>
                </div>
            </div>
        </tv-scroll>
    </div>
</template>

<script setup>
import tvScroll from "@/components/tv/tv-scroll/index.vue";
import * as CONFIG from "@/utils/config";
import { ref } from "vue";

const props = defineProps({
    routerParams: { type: Object, default: {} },
})

const actorList = ref([])

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
    actorList.value = res.cast.slice(0, 20);
    res.crew[0] ? actorList.value.unshift(res.crew[0]) : ''

};
getActorList()
</script>

<style lang="scss" scoped>
.actor-list {
    ::v-deep .tv-scroll {
        .uni-scroll-view {
            .uni-scroll-view-content {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                .actor-list-item {
                    display: flex;
                    flex: 0 0 50%;
                    margin-bottom: 24rpx;

                    image {
                        width: 250rpx;
                        height: 375rpx;
                        border-radius: 20rpx;
                        border: 6rpx solid transparent;
                    }

                    .item-right {
                        padding-top: 6rpx;
                        padding-left: 20rpx;

                        .item-right-name {
                            font-size: 36rpx;
                            font-weight: bold;
                            color: #fff;
                        }

                        .item-right-role {
                            font-size: 28rpx;
                            color: #fff;
                            padding-top: 12rpx;
                        }

                        .item-right-gender {
                            font-size: 32rpx;
                            color: #fff;
                            padding-top: 20rpx;
                            padding-bottom: 12rpx;
                        }

                        .item-right-tag {
                            display: inline-block;
                            font-size: 26rpx;
                            border: 2rpx solid #86caa5;
                            color: #86caa5;
                            border-radius: 10rpx;
                            padding: 6rpx 10rpx;
                        }
                    }
                }
            }
        }
    }


}
</style>
