<template>
  <div class="video-all">
    <div class="video-all-list" v-if="!isClearAll">
      <wil-list :requestFn="getMovieTvList" :request-params="requestParams" ref="wil_list" :refresherEnabled="false" idKey="path"
        :listContainerClass="routerParams.title=='最近观看'?'list-recent':'list-container'" :pageSize="12" :changeItemFn="changeItemFn">
        <template #default="item">
          <div class="video-all-list__item" @click="toVideoDetail(item)" @longpress="longPress(item)">
            <div class="item-poster">
              <image :src="(!routerParams.isConnected && !item.loadImg) ? emptyBg : item.poster" class="item-poster-image" mode="aspectFill" @error="imgError(item)"
                @load="imgLoad(item)">
              </image>
              <div :class="[item.select?'item-poster-check':'item-poster-nocheck']" v-if="isSelect">
                <image src="@/static/check-active.png" v-if="item.select"></image>
              </div>
            </div>
            <span class="item-name">{{ removeExtension(item) }}</span>
            <span class="item-time" v-if="routerParams.title!='最近观看'">{{ item.releaseTime }}</span>
          </div>
        </template>
      </wil-list>
    </div>
    <wil-empty v-else text="没有更多了"></wil-empty>
    <div class="video-all-bottom" v-if="isSelect">
      <div class="video-all-bottom__left" @click="clearAll">全部清空</div>
      <div class="video-all-bottom__right" :style="{color:recentSelect.length?'rgb(255, 44, 44)':'rgb(188, 188, 188)'}" @click="clearPart">删除</div>
    </div>
    <wil-modal ref="wil_modal"></wil-modal>
  </div>
</template>

<script setup>
import wilList from "../../components/wil-list/index.vue";
import { ref, nextTick } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import emptyBg from "@/static/empty_bg.png";
import wilModal from "@/components/wil-modal/modal.vue";
import wilEmpty from "@/components/wil-empty/index.vue";
const requestParams = ref({});

const mapping = {
  "电影": "movie",
  "电视剧": "tv",
};

const routerParams = ref({});
const recentSelect = ref([]);
const isSelect = ref(false);
const isClearAll = ref(false);

const wil_list = ref(null);
const wil_modal = ref(null);
const selectType = ref({});

//判断选择的是webdav还是天翼云盘还是夸克
const judgeSelect = () => {
  let sourceList = uni.getStorageSync("sourceList");
  selectType.value = sourceList.find((item) => {
    let select = item.list.find((i) => i.active);
    if (select) {
      return true;
    } else {
      return false;
    }
  });
};
const removeExtension = (item) => {
  if (routerParams.value.title == "最近观看") {
    if (item.type == "tv") {
      item.name1 = `${item.titlePlay} 第${item.ji}集 ${item.title}`;
      const lastDotIndex = item.name1.lastIndexOf(".");
      let name = lastDotIndex === -1 ? item.name1 : item.name1.substring(0, lastDotIndex);
      if (name.length > 12) {
        name = name.slice(0, 11) + "...";
      }
      return name;
    } else if (item.type == "movie") {
      const lastDotIndex = item.name.lastIndexOf(".");
      let name = lastDotIndex === -1 ? item.name : item.name.substring(0, lastDotIndex);
      if (name.length > 7) {
        name = name.slice(0, 6) + "...";
      }
      return name;
    }
  }
  const lastDotIndex = item.name.lastIndexOf(".");
  let name = lastDotIndex === -1 ? item.name : item.name.substring(0, lastDotIndex);
  if (name.length > 7) {
    name = name.slice(0, 6) + "...";
  }
  return name;
};

const getMovieTvList = async (params) => {
  let res = null;
  if (routerParams.value.title == "最近观看") {
    res = uni.getStorageSync("historyPlay");
    res.forEach((item) => {
      item.loadImg = true;
    });
    return {
      code: "200",
      rows: res.slice((params.pageNum - 1) * params.pageSize, params.pageNum * params.pageSize),
      total: res.length,
    };
  } else if (routerParams.value.title == "电视剧" || routerParams.value.title == "电影") {
    res = uni.getStorageSync("localMovieTvData");
    let arr = res[mapping[routerParams.value.title]];
    arr.forEach((item) => {
      item.loadImg = true;
    });
    return {
      code: "200",
      rows: arr.slice((params.pageNum - 1) * params.pageSize, params.pageNum * params.pageSize),
      total: arr.length,
    };
  } else {
    res = uni.getStorageSync("localMovieTvData");
    let arr = [];
    arr.push(...res.movie.filter((i) => i.genre_ids?.indexOf(+routerParams.value.genreId) > -1));
    arr.push(...res.tv.filter((i) => i.genre_ids?.indexOf(+routerParams.value.genreId) > -1));
    arr.forEach((item) => {
      item.loadImg = true;
    });
    return {
      code: "200",
      rows: arr.slice((params.pageNum - 1) * params.pageSize, params.pageNum * params.pageSize),
      total: arr.length,
    };
  }
};

//裁剪格式获取电影名
const getMovieName = (val) => {
  const lastDotIndex = val.lastIndexOf(".");
  let name = lastDotIndex === -1 ? val : val.substring(0, lastDotIndex);
  return name;
};
//将点击了的视频放置到数组的第一个去
const setItemFirst = (item) => {
  let historyPlay = uni.getStorageSync("historyPlay");
  let index = null;
  if (item.type == "tv") {
    index = historyPlay.findIndex((i) => i.type == item.type && i.titlePlay == item.titlePlay);
  } else if (item.type == "movie") {
    index = historyPlay.findIndex((i) => i.type == item.type && getMovieName(i.name) == getMovieName(item.name));
  }
  if (index > -1) {
    historyPlay.splice(index, 1);
    historyPlay.unshift(item);
  } else {
    historyPlay.unshift(item);
  }
  uni.setStorageSync("historyPlay", historyPlay);
};
const toVideoDetail = (item) => {
  //最近观看在选择状态下
  if (isSelect.value) {
    changeItemFn.value = (item) => {
      item.select ? (item.select = false) : (item.select = true);
    };
    if (item.select) {
      recentSelect.value = recentSelect.value.filter((i) => i.titlePlay != item.titlePlay);
    } else {
      recentSelect.value.push(item);
    }
    nextTick(() => {
      wil_list.value.handleEdit(item.path);
    });
  } else {
    if (routerParams.value.title != "最近观看") {
      uni.navigateTo({
        url: `/pages/video/video-detail?path=${item.path}&name=${item.name}&type=${item.type == "1" ? "tv" : "movie"}&source=${JSON.stringify(item.source)}&movieTvId=${item.movieTvId}`,
      });
    } else {
      if (item.type == "movie") {
        if (selectType.value.type == "WebDAV") {
          uni.navigateTo({
            url: `/pages/video/video-player?path=${item.path}&type=movie`,
            success: () => {
              setItemFirst(item);
            },
          });
        } else {
          uni.navigateTo({
            url: `/pages/video/video-player?path=${item.path}&folderFileId=${item.folderFileId}&type=movie`,
            success: () => {
              setItemFirst(item);
            },
          });
        }
      } else if (item.type == "tv") {
        if (selectType.value.type == "WebDAV") {
          uni.navigateTo({
            url: `/pages/video/video-player?path=${item.path}&type=tv`,
            success: () => {
              setItemFirst(item);
            },
          });
        } else {
          uni.navigateTo({
            url: `/pages/video/video-player?path=${item.path}&folderFileId=${item.folderFileId}&type=tv`,
          });
        }
      }
    }
  }
};

const longPress = (item) => {
  if (routerParams.value.title != "最近观看" || isSelect.value) return;
  isSelect.value = true;
  changeItemFn.value = (item) => {
    item.select ? (item.select = false) : (item.select = true);
  };
  if (item.select) {
    recentSelect.value = recentSelect.value.filter((i) => i.titlePlay != item.titlePlay);
  } else {
    recentSelect.value.push(item);
  }
  nextTick(() => {
    wil_list.value.handleEdit(item.path);
  });
};

const clearAll = () => {
  wil_modal.value.showModal({
    title: "温馨提示",
    content: "是否清空全部播放记录？",
    confirmColor: "#ff6701",
    confirm: async () => {
      recentSelect.value = [];
      isClearAll.value = true;
      isSelect.value = false;
      uni.setStorageSync("historyPlay", []);
    },
  });
};

const clearPart = () => {
  let historyPlay = uni.getStorageSync("historyPlay");
  if (recentSelect.value.length == historyPlay.length) {
    recentSelect.value = [];
    isClearAll.value = true;
    isSelect.value = false;
    uni.setStorageSync("historyPlay", []);
  } else {
    historyPlay = historyPlay.filter((item) => {
      return recentSelect.value.every((v) => v.path != item.path);
    });
    recentSelect.value.forEach((item) => {
      wil_list.value.handleDelete(item.path);
    });
    recentSelect.value = [];
    isSelect.value = false;
    uni.setStorageSync("historyPlay", historyPlay);
  }
};

const changeItemFn = ref(() => {});
const imgError = (item) => {
  changeItemFn.value = (item) => {
    item.loadImg = false;
  };
  nextTick(() => {
    wil_list.value.handleEdit(item.path);
  });
};

const imgLoad = (item) => {
  if (routerParams.value.isConnected == "false" && !item.loadImg) return;
  changeItemFn.value = (item) => {
    item.loadImg = true;
  };
  nextTick(() => {
    wil_list.value.handleEdit(item.path);
  });
};
onLoad((options) => {
  judgeSelect();
  routerParams.value = options;
  routerParams.value.isConnected = routerParams.value.isConnected1 == "true" ? true : false;
  uni.setNavigationBarTitle({
    title: routerParams.value.title,
  });
});
</script>

<style lang="scss" scoped>
page {
  width: 100%;
  height: 100%;
}
.video-all {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .video-all-list {
    flex: 1;
    overflow: hidden;
    // padding-top: 16px;
    ::v-deep .load-list {
      .list-container {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        padding: 0 24rpx;
        padding-top: 16px;
        .list-item {
          margin-left: 24rpx;
          margin-bottom: 24rpx;
          flex: 0 0 calc((100% - 48rpx) / 3);
          .video-all-list__item {
            .item-poster {
              width: 100%;
              height: 320rpx;
              border-radius: 20rpx;
              position: relative;
              .item-poster-image {
                width: 100% !important;
                height: 320rpx !important;
                border-radius: 20rpx;
                object-fit: cover;
              }
            }
            .item-name {
              font-size: 28rpx;
              font-weight: bold;
              color: #000;
              display: block;
            }
            .item-time {
              font-size: 24rpx;
              color: gray;
              padding-top: 6rpx;
              display: block;
            }
          }
          &:nth-child(3n + 1) {
            margin-left: 0;
          }
        }
      }
      .list-recent {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        padding: 0 24rpx;
        padding-top: 32rpx;
        .list-item {
          margin-left: 24rpx;
          margin-bottom: 24rpx;
          flex: 0 0 calc((100% - 24rpx) / 2);
          .video-all-list__item {
            .item-poster {
              width: 100%;
              height: 180rpx;
              border-radius: 20rpx;
              position: relative;
              .item-poster-image {
                width: 100%;
                height: 180rpx;
                border-radius: 20rpx;
                object-fit: cover;
              }
              .item-poster-check {
                width: 30rpx;
                height: 30rpx;
                box-sizing: border-box;
                // border: 2rpx solid #ff6701;
                background: #ff6701;
                position: absolute;
                top: 20rpx;
                right: 20rpx;
                border-radius: 8rpx;
                image {
                  width: 100%;
                  height: 100%;
                }
              }
              .item-poster-nocheck {
                width: 30rpx;
                height: 30rpx;
                box-sizing: border-box;
                border: 2rpx solid #ff6701;
                background: #fff;
                position: absolute;
                top: 20rpx;
                right: 20rpx;
                border-radius: 8rpx;
              }
            }
            .item-name {
              font-size: 28rpx;
              font-weight: bold;
              color: #000;
            }
            .item-time {
              font-size: 24rpx;
              color: gray;
              padding-top: 6rpx;
            }
          }
          &:nth-child(2n + 1) {
            margin-left: 0;
          }
        }
      }
    }
  }
  .video-all-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24rpx;
    font-size: 32rpx;
    font-weight: bold;
    height: 120rpx;
    border-top: 2rpx solid rgb(227, 227, 227);
    box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.3);
    &__left {
      color: #2457fd;
    }
    &__right {
      color: rgb(188, 188, 188);
    }
  }
}
</style>
