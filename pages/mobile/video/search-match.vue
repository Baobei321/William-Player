<template>
  <div class="search-match">
    <div class="search-match-title">搜索并匹配影片</div>
    <nut-searchbar v-model="searchValue" placeholder="输入影片名称搜索" @search="toSearch" @clear="toCancel">
      <template #leftin>
        <nut-icon name="search" custom-color="#000"></nut-icon>
      </template>
      <template #rightout>
        <span :style="{color:searchValue?'#315ffd':'#d0d0d0'}" @click="toSearch" v-if="!requestParams.query">搜索</span>
        <span v-else style="color:#315ffd" @click="toCancel">取消</span>
      </template>
    </nut-searchbar>
    <div class="search-match-list">
      <wil-list :requestFn="searchMovieTv" :request-params="requestParams" :responseAdapter="responseAdapter" ref="wil_list" :refresherEnabled="false" idKey="id"
        :pageSize="20" pageNumKey="page" v-if="requestParams.query">
        <template #default="item">
          <div class="search-match-list__item" @click="handleSelect(item,item.$index)" :style="{borderColor:activeIndex==item.$index?'#ff6701':'rgb(235, 235, 235)'}">
            <div class="item-left" :style="{backgroundImage:`url(${CONFIG.IMG_DOMAIN}/t/p/w300_and_h450_bestv2${item.poster_path })`}">
              <div :class="['item-left-logo',item.media_type=='tv'?'item-left-tv':'']">
                <template v-if="item.media_type=='tv'">
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
                {{ item.name||item.title }}
              </div>
              <div class="item-right-content">
                <div class="item-right-content__date">
                  <nut-icon name="date" size="14" custom-color="#7a787b"></nut-icon>
                  <span>{{ item.first_air_date || item.release_date ||'暂无' }}</span>
                </div>
                <div class="item-right-content__line"></div>
                <div class="item-right-content__type">{{ item.media_type=='tv'?'电视剧':'电影' }}</div>
              </div>
              <div class="item-right-overview">{{ item.overview || '...' }}</div>
            </div>
          </div>
        </template>
      </wil-list>
      <wil-empty v-else text="仅支持搜索影片名，暂不支持搜索演员"></wil-empty>
    </div>
    <wil-modal ref="wil_modal"></wil-modal>
    <nut-popup v-model:visible="showSeason" position="bottom" round safe-area-inset-bottom>
      <nut-picker v-model="popupValue" :columns="seasonColumns" title="选择季" @confirm="confirmPicker" @cancel="showSeason = false">
      </nut-picker>
    </nut-popup>
  </div>
</template>

<script setup>
import { ref } from "vue";
import wilList from "@/components/mobile/wil-list/index";
import wilEmpty from "@/components/mobile/wil-empty/index";
import movieLittle from "@/static/movie-little.png";
import tvLittle from "@/static/tv-little.png";
import showModal from "@/components/mobile/wil-modal/modal.js";
import wilModal from "@/components/mobile/wil-modal/index.vue";
import { generateChineseNumberMapping } from "@/utils/scrape";
import { onLoad } from "@dcloudio/uni-app";
import * as CONFIG from "@/utils/config";

const searchValue = ref("");
const requestParams = ref({});
const activeIndex = ref(null);

const showSeason = ref(false);
const popupValue = ref([]);
const seasonColumns = ref([]);
const selectItem = ref({});

const routerParams = ref({});

const wil_modal = ref(null);

const responseAdapter = (result) => {
  if (!result) {
    return {
      listData: [],
      listTotal: 0,
    };
  }
  return {
    listData: result.results || [],
    listTotal: +result.total_results,
  };
};
//通过tmdb接口根据关键词搜索影视
const searchMovieTv = (data) => {
  let url = "https://api.tmdb.org/3/search/multi";
  return new Promise((resolve, rej) => {
    uni.request({
      url: url,
      data: {
        ...data,
        language: "zh-CN",
        api_key: uni.getStorageSync("settingData").tmdbKey,
      },
      method: "GET",
      header: { "Content-Type": "application/json" },
      success: (res) => {
        resolve(res.data);
      },
    });
  });
};

//获取电视剧详情，包括有多少季
const getTvDetail = (id) => {
  let url = `https://api.tmdb.org/3/tv/${id}`;
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

//获取电影详情，包括有多少季
const getMovieDetail = (id) => {
  let url = `https://api.tmdb.org/3/movie/${id}`;
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

const toSearch = () => {
  requestParams.value.query = searchValue.value;
};

const toCancel = () => {
  searchValue.value = "";
  requestParams.value.query = "";
};

const handleSelect = async (item, index) => {
  activeIndex.value = index;
  selectItem.value = item;
  let res = {};
  if (item.media_type == "tv") {
    res = await getTvDetail(item.id);
    if (routerParams.value.maxSeasonLength > res.seasons.length) {
      uni.showToast({
        title: "库内影片的季数大于当前影片",
        icon: "none",
      });
      return;
    } else {
      if (res.seasons.length >= 2 && routerParams.value.maxSeasonLength == 1) {
        seasonColumns.value = res.seasons.map((v) => {
          return { text: v.name, value: v.season_number };
        });
        showSeason.value = true;
        return;
      }
    }
  } else {
    res = await getMovieDetail(item.id);
  }

  wil_modal.value.showModal({
    title: "温馨提示",
    content: "是否确认匹配该影片？",
    confirmColor: "#ff6701",
    confirm: async () => {
      let localMovieTvData = uni.getStorageSync("localMovieTvData");
      if (localMovieTvData.movie.some((i) => i.movieTvId == item.id) || localMovieTvData.tv.some((i) => i.movieTvId == item.id)) {
        uni.showToast({
          title: "库里存在相同影片",
          icon: "none",
        });
        return;
      }
      let type = item.media_type == "tv" ? "tv" : "movie";
      const mapping = {
        "tv": "电视剧",
        "movie": "电影",
      };
      if (routerParams.value.type != type) {
        uni.showToast({
          title: `当前影片为${mapping[routerParams.value.type]}类型，不能选择${mapping[type]}类型`,
          icon: "none",
        });
        return;
      }
      uni.setStorageSync("resetMovieTv", { type: type, movieTvId: item.id, name: item.name || item.title }); //设置到缓存，详情页去获取
      uni.navigateBack();
    },
  });
};

const confirmPicker = ({ selectedValue, selectedOptions }) => {
  let localMovieTvData = uni.getStorageSync("localMovieTvData");
  if (localMovieTvData.movie.some((i) => i.movieTvId == selectItem.value.id) || localMovieTvData.tv.some((i) => i.movieTvId == selectItem.value.id && selectedValue[0] == i.season)) {
    uni.showToast({
      title: "库里存在相同影片",
      icon: "none",
    });
    return;
  }
  let type = selectItem.value.media_type == "tv" ? "tv" : "movie";
  const mapping = {
    "tv": "电视剧",
    "movie": "电影",
  };
  if (routerParams.value.type != type) {
    uni.showToast({
      title: `当前影片为${mapping[routerParams.value.type]}类型，不能选择${mapping[type]}类型`,
      icon: "none",
    });
    return;
  }
  const numberMapping = generateChineseNumberMapping(40, "number");
  // console.log(selectedValue[0],'选择');
  let season = numberMapping[selectedValue[0]] == "一" || !numberMapping[selectedValue[0]] ? "" : ` 第${numberMapping[selectedValue[0]]}季`;
  if (selectedValue[0] == "0") season = " 特别篇";
  console.log(selectItem.value.name + season);

  uni.setStorageSync("resetMovieTv", { type: type, movieTvId: selectItem.value.id, name: routerParams.value.type == "tv" ? selectItem.value.name + season : selectItem.value.title }); //设置到缓存，详情页去获取
  uni.navigateBack();
};

onLoad((options) => {
  routerParams.value = options;
});
</script>

<style lang="scss" scoped>
page {
  width: 100%;
  height: 100%;
}
.search-match {
  padding: 24rpx 24rpx 0 24rpx;
  background: #fff;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  .search-match-title {
    font-size: 36rpx;
    font-weight: bold;
  }
  ::v-deep .nut-searchbar {
    padding: 18rpx 0;
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
  .search-match-list {
    display: flex;
    // align-items: center;
    justify-content: center;
    flex: 1;
    overflow: hidden;
    ::v-deep .load-list {
      .search-match-list__item {
        margin-bottom: 24rpx;
        border-radius: 16rpx;
        border: 2rpx solid rgb(235, 235, 235);
        display: flex;
        align-items: center;
        .item-left {
          width: 180rpx;
          height: 250rpx;
          background-position: center;
          background-repeat: no-repeat;
          background-size: cover;
          border-radius: 16rpx 0 0 16rpx;
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
          flex: 1;
          overflow: hidden;
          padding-right: 20rpx;
          box-sizing: border-box;
          .item-right-name {
            font-size: 30rpx;
            color: #000;
            font-weight: bold;
            display: -webkit-box; /* 启用弹性盒子布局 */
            -webkit-box-orient: vertical; /* 设置子元素垂直排列 */
            -webkit-line-clamp: 2; /* 限制显示行数为2行 */
            overflow: hidden; /* 隐藏超出内容 */
            text-overflow: ellipsis;
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
          .item-right-overview {
            display: -webkit-box; /* 启用弹性盒子布局 */
            -webkit-box-orient: vertical; /* 设置子元素垂直排列 */
            -webkit-line-clamp: 2; /* 限制显示行数为2行 */
            overflow: hidden; /* 隐藏超出内容 */
            text-overflow: ellipsis;
            width: 100%;
            font-size: 28rpx;
            color: #7a787b;
            padding-top: 16rpx;
          }
        }
      }
    }
  }
}
@media (prefers-color-scheme: dark) {
  .search-match {
    background: #1e1e20;
    ::v-deep .nut-searchbar {
      background-color: #1e1e20;
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
    .search-match-list {
      ::v-deep .load-list {
        .search-match-list__item {
          border: 2rpx solid rgb(40, 40, 40);

          .item-right {
            .item-right-name {
              color: #fff;
            }
            .item-right-content {
              color: #cacaca;
              .item-right-content__line {
                background: #cacaca;
              }
            }
            .item-right-overview {
              color: #cacaca;
            }
          }
        }
      }
    }
  }
}
</style>
