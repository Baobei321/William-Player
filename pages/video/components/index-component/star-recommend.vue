<template>
  <div class="star-recommend">
    <wil-swiper :options="listData" :auto-play="3000" :pagination-visible="true" imgMode="aspectFill">
      <template #item="data">
        <div class="swiper-content" @click="toVideoDetail(data)">
          <div class="swiper-content-container">
            <div class="swiper-content-left">
              <image mode="aspectFill" :src="'https://media.themoviedb.org/t/p/w300_and_h450_bestv2' + data.poster"></image>
            </div>
            <div class="swiper-content-right">
              <div class="right-genres">{{ data.genres }}</div>
              <div class="right-name">{{ handleSeasonName(data.name,true) }}</div>
              <div class="right-info">
                <div class="right-info-date">{{ data.releaseTime }}</div>
                <div class="right-info-star">
                  <image src="@/static/star-fill.png"></image>
                  <span>{{ data.voteAverage.toFixed(1) }}</span>
                </div>
              </div>
              <div class="right-desc">{{ data.overview }}</div>
            </div>
          </div>
        </div>
      </template>
    </wil-swiper>
  </div>
</template>

<script setup>
import wilSwiper from "@/components/wil-swiper/index.vue";
import { ref, onBeforeMount } from "vue";
import { classifyList, handleSeasonName } from "../../../../utils/common";
import { onShow } from "@dcloudio/uni-app";

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
    url: `/pages/video/video-detail?path=${item.path}&name=${handleSeasonName(item.name, true)}&type=${item.type}&source=${JSON.stringify(item.source)}&movieTvId=${item.movieTvId}`,
  });
};
onShow(() => {
  classifyList1.value = JSON.parse(JSON.stringify(classifyList));
  let localMovieTvData = uni.getStorageSync("localMovieTvData") || {};
  let tv = localMovieTvData.tv.sort((a, b) => b.voteAverage - a.voteAverage);
  tv = tv.slice(0, 3).map((item) => {
    let genres = "";
    item.type = "tv";
    item.genre_ids.forEach((v, vindex) => {
      if (vindex < item.genre_ids.length - 1) {
        genres += classifyList1.value.find((h) => h.id == v)?.label ? classifyList1.value.find((h) => h.id == v).label + " " : "";
      } else {
        genres += classifyList1.value.find((h) => h.id == v)?.label || "";
      }
    });
    item.genres = genres;
    item.underImg = "https://media.themoviedb.org/t/p/w1920_and_h1080_bestv2" + item.backdrop;
    return item;
  });
  let movie = localMovieTvData.movie.sort((a, b) => b.voteAverage - a.voteAverage);
  movie = movie.slice(0, 3).map((item) => {
    item.name = removeExtension(item.name);
    item.type = "movie";
    let genres = "";
    item.genre_ids.forEach((v, vindex) => {
      if (vindex < item.genre_ids.length - 1) {
        genres += classifyList1.value.find((h) => h.id == v)?.label ? classifyList1.value.find((h) => h.id == v).label + " " : "";
      } else {
        genres += classifyList1.value.find((h) => h.id == v)?.label || "";
      }
    });
    item.genres = genres;
    item.underImg = "https://media.themoviedb.org/t/p/w1920_and_h1080_bestv2" + item.backdrop;
    return item;
  });
  listData.value = [...tv, ...movie];
});
</script>

<style lang="scss" scoped>
.star-recommend {
  height: 500rpx;
  ::v-deep .wil-swiper {
    .nut-swiper {
      .nut-swiper-inner {
        .nut-swiper-item {
          .swiper-content {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            padding: 140rpx 0 0 0;
            background: linear-gradient(180deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.8));
            .swiper-content-container {
              padding: 0 24rpx;
              box-sizing: border-box;
              width: 100%;
              height: 100%;
              display: flex;
              align-items: stretch;
            }
            .swiper-content-left {
              flex: 0 0 192.6rpx;
              height: 270rpx;
              border-radius: 12rpx;
              image {
                width: 100%;
                height: 100%;
                border-radius: 12rpx;
              }
            }
            .swiper-content-right {
              flex: 1;
              overflow: hidden;
              height: 270rpx;
              margin-left: 24rpx;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              .right-genres {
                font-size: 26rpx;
              }
              .right-name {
                font-size: 32rpx;
              }
              .right-info {
                display: flex;
                align-items: center;
                font-size: 24rpx;
                font-weight: bold;
                .right-info-star {
                  display: flex;
                  align-items: center;
                  margin-left: 50rpx;
                  image {
                    width: 30rpx;
                    height: 30rpx;
                  }
                }
              }
              .right-desc {
                font-size: 28rpx;
                color: rgb(54, 54, 54);
                display: -webkit-box;
                -webkit-line-clamp: 3; /* 限制行数（可调整） */
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }
          }
        }
      }
    }
  }
}
</style>
