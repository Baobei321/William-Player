<template>
  <div class="video-search">
    <wil-navbar>
      <template #content>
        <nut-searchbar v-model="searchValue" placeholder="输入影片名称搜索" @search="toSearch" @clear="toCancel">
          <template #leftin>
            <nut-icon name="search" custom-color="#000"></nut-icon>
          </template>
          <template #rightout>
            <span :style="{color:searchValue?'#315ffd':'#d0d0d0'}" @click="toSearch">搜索</span>
          </template>
        </nut-searchbar>
      </template>
    </wil-navbar>
    <div class="video-search-list" v-if="listData.length">
      <div class="video-search-list__item" v-for="item in listData" :key="item.movieTvId" @click="toVideoDetail(item)">
        <div class="item-left" :style="{backgroundImage:`url(${setEmptyImg(item.poster)})`}">
          <div :class="['item-left-logo',item.type=='1'?'item-left-tv':'']">
            <template v-if="item.type=='1'">
              <image :src="tvLittle" />
              <span>电视剧</span>
            </template>
            <template v-else>
              <image :src="movieLittle" />
              <span>电影</span>
            </template>
          </div>
        </div>
        <div class="item-right">
          <div class="item-right-name">
            <span v-for="second in handleName(item.name)" :key="second" :style="{color:second.color}">{{ second.label }}</span>
          </div>
          <div class="item-right-content">
            <div class="item-right-content__date">
              <nut-icon name="date" size="14" custom-color="#7a787b"></nut-icon>
              <span>{{ item.releaseTime }}</span>
            </div>
            <div class="item-right-content__line"></div>
            <div class="item-right-content__type">{{ item.type=='1'?'电视剧':'电影' }}</div>
          </div>
        </div>
      </div>
    </div>
    <wil-empty v-else text="仅支持搜索影片名，暂不支持搜索演员"></wil-empty>
  </div>
</template>

<script setup>
import { ref } from "vue";
import wilNavbar from "@/components/mobile/wil-navbar/index.vue";
import wilEmpty from "@/components/mobile/wil-empty/index.vue";
import movieLittle from "@/static/movie-little.png";
import tvLittle from "@/static/tv-little.png";
import { handleSeasonName } from "@/utils/scrape.js";
import posterEmpty from "@/static/poster-empty.png";
import * as CONFIG from "@/utils/config";

const oldValue = ref("");
const searchValue = ref("");
const listData = ref([]);

const toSearch = () => {
  if (oldValue.value == searchValue.value || !searchValue.value) return;
  let data = uni.getStorageSync("localMovieTvData");
  let movieArr = data.movie.filter((item) => item.name.indexOf(searchValue.value) > -1);
  let tvArr = data.tv.filter((item) => item.name.indexOf(searchValue.value) > -1);
  listData.value = [...movieArr, ...tvArr];
  oldValue.value = searchValue.value;
};

const toCancel = () => {
  searchValue.value = "";
  oldValue.value = "";
  listData.value = [];
};

const handleName = (name) => {
  let arr = [];
  name = handleSeasonName(name);
  arr.push({ label: name.split(oldValue.value)[0] });
  arr.push({ label: oldValue.value, color: "#315bfe" });
  arr.push({ label: name.split(oldValue.value)[1] });
  arr = arr.filter((i) => i.label);
  return arr;
};

const setEmptyImg = (poster) => {
  if (poster) {
    return CONFIG.IMG_DOMAIN + "/t/p/w300_and_h450_bestv2" + poster;
  } else {
    return posterEmpty;
  }
};

const toVideoDetail = (item) => {
  uni.navigateTo({
    url: `/pages/mobile/video/video-detail?path=${item.path}&name=${item.name}&type=${item.type == "1" ? "tv" : "movie"}&source=${JSON.stringify(item.source)}&movieTvId=${item.movieTvId}`,
  });
};
</script>

<style lang="scss" scoped>
page {
  width: 100%;
  height: 100%;
}
.video-search {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  ::v-deep .wil-navbar {
    background: #fff;
    .nut-navbar {
      padding-right: 0;
      .nut-navbar__title {
        margin: 0 0 0 20rpx;
        flex: 1;
        max-width: 100%;
        .nut-searchbar {
          .nut-searchbar__search-input {
            border-radius: 12rpx;
            align-items: center;
            overflow: hidden;
            .nut-searchbar__input-bar {
              color: #000;
              min-height: 0;
            }
          }
          .nut-searchbar__search-icon {
            margin-top: -6rpx;
            span {
              font-size: 30rpx;
            }
          }
          .nut-searchbar__right-search-icon {
            margin-top: 0;
            white-space: nowrap;
          }
        }
      }
    }
  }
  .video-search-list {
    padding: 24rpx 24rpx 68rpx 24rpx;
    flex: 1;
    overflow: auto;
    .video-search-list__item {
      display: flex;
      align-items: center;
      margin-top: 30rpx;
      .item-left {
        width: 140rpx;
        height: 220rpx;
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        border-radius: 16rpx;
        position: relative;
        .item-left-logo {
          display: inline-flex;
          align-items: center;
          background: #031963;
          border-radius: 16rpx 0 16rpx 0;
          padding: 8rpx;
          position: absolute;
          top: 0;
          left: 0;
          image {
            width: 24rpx;
            height: 24rpx;
          }
          span {
            font-size: 22rpx;
            color: #fff;
            padding-left: 4rpx;
          }
        }
        .item-left-tv {
          background: #315bfd;
        }
      }
      .item-right {
        margin-left: 20rpx;
        .item-right-name {
          display: flex;
          align-items: baseline;
          font-size: 30rpx;
          color: #000;
          font-weight: bold;
        }
        .item-right-content {
          display: flex;
          align-items: center;
          color: #7a787b;
          font-size: 28rpx;
          margin-top: 20rpx;
          .item-right-content__date {
            display: flex;
            align-items: center;
            span {
              padding-left: 10rpx;
            }
          }
          .item-right-content__line {
            height: 28rpx;
            width: 2rpx;
            background: #cecece;
            margin: 0 20rpx;
          }
        }
      }
      &:first-child {
        margin-top: 0;
      }
    }
  }
}
@media (prefers-color-scheme: dark) {
  .video-search {
    ::v-deep .wil-navbar {
      background-color: #1e1e20;
      .nut-navbar {
        background: #1e1e20;
        .nut-navbar__title {
          .nut-searchbar {
            background: #1e1e20;
            .nut-searchbar__search-input {
              background: #2f2f2f;
              .nut-searchbar__search-icon {
                .nut-icon-search {
                  color: #606060 !important;
                }
              }
              .nut-searchbar__input-inner {
                .nut-searchbar__input-form {
                  .uni-input-input {
                    color: #fff;
                  }
                }
              }
            }
          }
        }
      }
    }
    .video-search-list {
      .video-search-list__item {
        .item-right {
          .item-right-name {
            color: #fff;
          }
          .item-right-content {
            color: #b9b9b9;
            .item-right-content__line {
              background: #b9b9b9;
            }
          }
        }
      }
    }
  }
}
</style>
