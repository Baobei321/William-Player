<template>
  <div class="recent-played">
    <div class="recent-played-title">
      <div class="recent-played-title-left">最近观看</div>
      <div class="recent-played-title-right" @click="toVideoAll">
        <span>全部</span>
        <span>{{ props.listData.length }}</span>
        <nut-icon name="rect-right" size="10" custom-color="gray"></nut-icon>
      </div>
    </div>
    <div class="recent-played-list">
      <scroll-view class="recent-played-list-scroll" :scroll-x="true" style="width: 100%" :enhanced="true"
        :showScrollbar="false">
        <div class="recent-played-list-movie">
          <div class="recent-played-list-movie__item" v-for="item in scrollData" :key="item.name"
            @click="toVideoPlayer(item)">
            <div class="recent-played-list-movie__item-img">
              <image :src="item.poster" style="width: 100%;height: 100%;position: static;" mode="aspectFill"></image>
              <span style="color: red;font-size: 30px;">
                {{ item.loadImg }}
              </span>
              <image :src="playVideoButton" class="img-button" />
              <span class="img-runtime">{{ handleSecond(item.initialTime) + '/' + item.runtime }}</span>
              <div class="img-process"
                :style="{ width: Number(item.initialTime) / (Number(parseTime(item.runtime)) * 0.6) + '%' }"></div>
            </div>
            <span class="recent-played-list-movie__item-name" v-if="item.type == 'movie'">{{
              handleSeasonName(removeExtension(item.name)) }}</span>
            <span class="recent-played-list-movie__item-name" v-if="item.type == 'tv'">{{
              removeExtension(`${item.titlePlay} 第${item.ji}集 ${item.title}`) }}</span>
          </div>
        </div>
      </scroll-view>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import playVideoButton from "@/static/playVideo-button.png";
import { handleSecond, parseTime, handleSeasonName } from "@/utils/scrape";
import { onShow } from "@dcloudio/uni-app";
import emptyBg from "@/static/empty_bg.png";
import { toStringfy } from "@/pages/mobile/mine/common";

const props = defineProps({
  isFocus: { type: Boolean, default: true },
  listData: { type: Array, default: [] },
});

const scrollData = ref([]);
const tabIndex = ref(-1);


const selectType = ref({});
const selectMedia = ref({});

//判断选择的是webdav还是天翼云盘还是夸克
const judgeSelect = () => {
  let sourceList = uni.getStorageSync("sourceList");
  selectType.value = sourceList.find((item) => {
    let select = item.list.find((i) => i.active);
    if (select) {
      selectMedia.value = select;
      return true;
    } else {
      return false;
    }
  });
};

const removeExtension = (filename) => {
  const firstDotIndex = filename.indexOf(".");
  let name = firstDotIndex === -1 ? filename : filename.substring(0, firstDotIndex);
  if (name.length > 17) {
    name = name.slice(0, 16) + "...";
  }
  return name;
};

//裁剪格式获取电影名
const getMovieName = (val) => {
  const firstDotIndex = val.indexOf(".");
  let name = firstDotIndex === -1 ? val : val.substring(0, firstDotIndex);
  return name;
};

//将点击了的视频放置到数组的第一个去
const setItemFirst = (item) => {
  let index = null;
  if (item.type == "tv") {
    index = scrollData.value.findIndex((i) => i.type == item.type && i.titlePlay == item.titlePlay);
  } else if (item.type == "movie") {
    index = scrollData.value.findIndex((i) => i.type == item.type && getMovieName(i.name) == getMovieName(item.name));
  }
  if (index > -1) {
    scrollData.value.splice(index, 1);
    scrollData.value.unshift(item);
  } else {
    scrollData.value.unshift(item);
  }
  let historyArr = uni.getStorageSync("historyPlay") || [];
  historyArr = historyArr.filter((v) => v.sourceType != selectType.value.type || v.sourceName != selectMedia.value.name);
  uni.setStorageSync("historyPlay", [...historyArr, ...scrollData.value]);
};

const toVideoPlayer = async (item) => {
  uni.setStorageSync("secondPage", "videoPlayer");
  if (item.type == "movie") {
    if (selectType.value.type == "WebDAV") {
      uni.navigateTo({
        url: `/pages/mobile/video/video-player?path=${item.path}&type=movie`,
        success: () => {
          setItemFirst(item);
        },
      });
    } else {
      uni.navigateTo({
        url: `/pages/mobile/video/video-player?path=${item.path}&folderFileId=${item.folderFileId}&type=movie`,
        success: () => {
          setItemFirst(item);
        },
      });
    }
  } else if (item.type == "tv") {
    let localMovieTvData = uni.getStorageSync("localMovieTvData") || {};
    let nowTv = localMovieTvData.tv.find((i) => {
      return (
        i.source.some((v) => {
          return v.seasonArr.some((h) => h.path + "/" + item.name == "/" + item.path);
        }) && i.movieTvId == item.movieTvId
      );
    });
    let openEndTime = {};
    nowTv.openingTime >= 0 ? (openEndTime.openingTime = nowTv.openingTime) : "";
    nowTv.endTime >= 0 ? (openEndTime.endTime = nowTv.endTime) : "";
    if (selectType.value.type == "WebDAV") {
      uni.navigateTo({
        url: `/pages/mobile/video/video-player?path=${item.path}&titlePlay=${item.titlePlay}&type=tv&movieTvId=${item.movieTvId}&${toStringfy(openEndTime)}`,
        success: () => {
          setItemFirst(item);
        },
      });
    } else {
      uni.navigateTo({
        url: `/pages/mobile/video/video-player?path=${item.path}&titlePlay=${item.titlePlay}&wjjId=${item.wjjId}&movieTvId=${item.movieTvId}&folderFileId=${item.folderFileId}&type=tv&${toStringfy(openEndTime)}`,
      });
    }
  }
};

const toVideoAll = () => {
  uni.navigateTo({
    url: `/pages/mobile/video/video-all?title=最近观看`,
  });
};
//获取上下的组件
const getUpDown = (direction) => {
  if (direction === "up") {
    return "starRecommend";
  } else if (direction === 'down') {
    let localMovieTvData = uni.getStorageSync("localMovieTvData");
    if (localMovieTvData?.movie?.length) {
      return "hxMovie";
    }
    if (localMovieTvData?.tv?.length) {
      return "hxTv";
    }
  }
}

let nowTime = 0;
const evtMove = (keyCode) => {
  if (keyCode === "KeyRight") {
    if (tabIndex.value != props.listData.length - 1) {
      tabIndex.value++;
    }
  } else if (keyCode === "KeyLeft") {
    if (tabIndex.value > 0) {
      tabIndex.value--;
    }
  } else if (keyCode === "KeyUp") {
    emits("setFocus", getUpDown("up"), 'KeyUp');
  } else if (keyCode === "KeyDown") {
    emits("setFocus", getUpDown("down"), 'KeyDown');
  } else if (keyCode === 'KeyEnter') {

  }
  let time = Date.now();
  if (time - nowTime > 300) {
    if (tabIndex.value >= 3) {
      scrollIntoView.value = "name" + (tabIndex.value - 1);
    } else {
      scrollIntoView.value = "name1";
    }
  } else {
    setScrollIntoView();
  }
  nowTime = time;
};

onShow(() => {
  judgeSelect();
  scrollData.value = [...props.listData];
  scrollData.value.forEach((item) => {
    item.loadImg = true;
  });
});

watch(
  () => props.listData,
  (val) => {
    scrollData.value = [...props.listData];
    scrollData.value.forEach((item) => {
      item.loadImg = true;
    });
  },
  { immediate: true, deep: true }
);

watch(
  () => props.isFocus,
  (val) => {
    if (val) {
      tabIndex.value = 0;
    } else {
      tabIndex.value = -1;
    }
  }
);

defineExpose({
  evtMove
})
</script>

<style lang="scss" scoped>
.recent-played {
  width: 100%;
  margin: 50rpx 0;
  padding: 0 80rpx;

  .recent-played-title {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .recent-played-title-left {
      font-size: 36rpx;
      font-weight: bold;
      color: #000;
    }

    .recent-played-title-right {
      display: flex;
      align-items: center;

      span {
        font-size: 30rpx;
        color: gray;
        line-height: 30rpx;
      }

      span:nth-child(2) {
        padding-left: 6rpx;
      }
    }
  }

  .recent-played-list {
    margin-top: 24rpx;

    .recent-played-list-scroll {
      width: 100%;
      overflow-x: auto;

      .recent-played-list-movie {
        display: flex;
        flex-wrap: nowrap;
        align-items: center;

        .recent-played-list-movie__item {
          margin-left: 24rpx;
          flex: 0 0 520rpx;

          .recent-played-list-movie__item-img {
            background-position: center;
            background-repeat: no-repeat;
            background-size: cover;
            height: 320rpx;
            width: 100%;
            border-radius: 20rpx;
            position: relative;
            overflow: hidden;

            .img-button {
              width: 80rpx;
              height: 80rpx;
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
              object-fit: cover;
            }

            .img-runtime {
              position: absolute;
              right: 10rpx;
              bottom: 10rpx;
              background: rgba(0, 0, 0, 0.5);
              color: #fff;
              font-size: 24rpx;
              border-radius: 8rpx;
              padding: 4rpx 8rpx;
            }

            .img-process {
              height: 7rpx;
              background: #ff6701;
              position: absolute;
              bottom: 0;
              left: 0;
            }
          }

          &-name {
            font-size: 28rpx;
            font-weight: bold;
            color: #000;
          }

          &:first-child {
            margin-left: 0;
          }
        }
      }
    }
  }
}

@media (prefers-color-scheme: dark) {
  .recent-played {
    .recent-played-title {
      .recent-played-title-left {
        color: #fff;
      }

      .recent-played-title-right {
        span {
          color: rgb(154, 154, 154);
        }
      }
    }

    .recent-played-list {
      .recent-played-list-scroll {
        .recent-played-list-movie {
          .recent-played-list-movie__item {
            &-name {
              color: #fff;
            }
          }
        }
      }
    }
  }
}
</style>
