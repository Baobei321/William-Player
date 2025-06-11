<template>
  <div class="star-recommend">
    <wil-swiper :options="listData" :auto-play="5000" :pagination-visible="true" imgMode="aspectFill" @change="changeSwiper">
      <template #item="data">
        <div class="swiper-content" @click="toVideoDetail(data)">
          <div class="swiper-content-container">
            <div class="swiper-content-left">
              <div class="left-name">{{ handleSeasonName(data.name,true) }}</div>
              <div class="left-info">
                <div class="left-info-date">{{ data.releaseTime }}</div>
                <div class="left-info-star">
                  <image src="@/static/star-fill.png"></image>
                  <span>{{ data.voteAverage.toFixed(1) }}</span>
                </div>
                <div class="left-info-genres">{{ data.genres }}</div>
              </div>
              <div class="left-desc">{{ data.overview }}</div>
              <div class="left-button">
                <image src="@/static/play-black.png"></image>
                <span>立即观看</span>
              </div>
            </div>
            <div class="swiper-content-right">
              <image mode="aspectFill" :src="CONFIG.IMG_DOMAIN+'/t/p/w300_and_h450_bestv2' + data.poster"></image>
            </div>
          </div>
        </div>
      </template>
    </wil-swiper>
  </div>
</template>

<script setup>
import wilSwiper from "@/components/mobile/wil-swiper/index.vue";
import { ref, onBeforeMount } from "vue";
import { classifyList, handleSeasonName } from "@/utils/scrape";
import { onShow } from "@dcloudio/uni-app";
import * as CONFIG from "@/utils/config";

const emits = defineEmits(["getStarList", "change"]);

const listData = ref([]);
const classifyList1 = ref(JSON.parse(JSON.stringify(classifyList)));
const removeExtension = (filename) => {
  let name = handleSeasonName(filename, true);
  if (name.length > 7) {
    name = name.slice(0, 6) + "...";
  }
  return name;
};

const toVideoDetail = (item) => {
  uni.navigateTo({
    url: `/pages/mobile/video/video-detail?path=${item.path}&name=${handleSeasonName(item.name, true)}&type=${item.type}&source=${JSON.stringify(item.source)}&movieTvId=${item.movieTvId}`,
  });
};

const changeSwiper = (index) => {
  emits("change", index);
};

onShow(() => {
  classifyList1.value = JSON.parse(JSON.stringify(classifyList));
  let localMovieTvData = uni.getStorageSync("localMovieTvData") || {};
  let tv = [];
  if (localMovieTvData?.tv) {
    tv = localMovieTvData.tv.filter((v) => v.voteAverage).sort((a, b) => b.voteAverage - a.voteAverage);
    tv = tv.slice(0, 3).map((item) => {
      let genres = "";
      item.type = "tv";
      item.genre_ids?.forEach((v, vindex) => {
        if (vindex < item.genre_ids.length - 1) {
          genres += classifyList1.value.find((h) => h.id == v)?.label ? classifyList1.value.find((h) => h.id == v).label + " " : "";
        } else {
          genres += classifyList1.value.find((h) => h.id == v)?.label || "";
        }
      });
      item.genres = genres;
      //   item.underImg = CONFIG.IMG_DOMAIN + "/t/p/w1920_and_h1080_bestv2" + item.backdrop;
      return item;
    });
  }
  let movie = [];
  if (localMovieTvData?.movie) {
    movie = localMovieTvData.movie.filter((v) => v.voteAverage).sort((a, b) => b.voteAverage - a.voteAverage);
    movie = movie.slice(0, 3).map((item) => {
      item.name = removeExtension(item.name);
      item.type = "movie";
      let genres = "";
      item.genre_ids?.forEach((v, vindex) => {
        if (vindex < item.genre_ids.length - 1) {
          genres += classifyList1.value.find((h) => h.id == v)?.label ? classifyList1.value.find((h) => h.id == v).label + " " : "";
        } else {
          genres += classifyList1.value.find((h) => h.id == v)?.label || "";
        }
      });
      item.genres = genres;
      //   item.underImg = CONFIG.IMG_DOMAIN + "/t/p/w1920_and_h1080_bestv2" + item.backdrop;
      return item;
    });
  }
  listData.value = [...tv, ...movie];
  emits("getStarList", listData.value);
});
</script>

<style lang="scss" scoped>
.star-recommend {
  height: 70%;
  ::v-deep .wil-swiper {
    background: transparent;
    .nut-swiper {
      .nut-swiper-inner {
        .nut-swiper-item {
          .swiper-content {
            padding: 0 80rpx;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            // padding: 140rpx 0 0 0;
            // background: linear-gradient(180deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.8));
            .swiper-content-container {
              padding: 0 24rpx;
              box-sizing: border-box;
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
            }
            .swiper-content-left {
              flex: 1;
              overflow: hidden;
              //   height: 270rpx;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              align-items: flex-start;

              .left-name {
                font-size: 66rpx;
                font-weight: bold;
                width: 800rpx;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 2; /* 限制显示的行数 */
                overflow: hidden;
                text-overflow: ellipsis;
              }
              .left-info {
                display: flex;
                align-items: center;
                font-size: 28rpx;
                font-weight: bold;
                margin: 20rpx 0;
                .left-info-star {
                  display: flex;
                  align-items: center;
                  margin-left: 50rpx;
                  image {
                    width: 30rpx;
                    height: 30rpx;
                  }
                }
                .left-info-genres {
                  font-size: 28rpx;
                  margin-left: 50rpx;
                }
              }
              .left-desc {
                font-size: 28rpx;
                color: #a2a2a2;
                font-weight: bold;
                display: -webkit-box;
                -webkit-line-clamp: 5; /* 限制行数（可调整） */
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              .left-button {
                display: flex;
                align-items: center;
                background: #e9dfd3;
                box-sizing: border-box;
                padding: 20rpx 50rpx;
                border-radius: 40rpx;
                margin-top: 40rpx;
                image {
                  width: 35rpx;
                  height: 35rpx;
                }
                span {
                  color: #372f28;
                  font-size: 28rpx;
                  padding-left: 10rpx;
                }
              }
            }
            .swiper-content-right {
              flex: 0 0 385.2rpx;
              height: 540rpx;
              border-radius: 12rpx;
              margin-left: 200rpx;
              image {
                width: 100%;
                height: 100%;
                border-radius: 12rpx;
              }
            }
          }
        }
      }
    }
  }
}
</style>
