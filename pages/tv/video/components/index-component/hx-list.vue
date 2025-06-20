<template>
  <div class="hxList" ref="hx_list" :style="{ '--line-height': lineHeight }">
    <div class="hxList-title">
      <div class="hxList-title-left">{{ props.title }}</div>
    </div>
    <div class="hxList-list">
      <tv-scroll class="hxList-list-scroll" :scroll-x="true" style="width: 100%" :enhanced="true" :showScrollbar="false"
        :scrollIntoView="scrollIntoView">
        <div class="hxList-list-movie__item" v-for="(item, index) in listData1" :id="'name' + (index + 1)"
          :key="item.name" @click="toVideoDetail(item)">
          <image :src="setEmptyImg(item.poster)" mode="aspectFill"
            :class="[props.title == '电影' ? 'hxList-list-movie__img-movie' : 'hxList-list-movie__img-tv', tabIndex == index ? 'hxList-list-movie__img-active' : 'hxList-list-movie__item-img']">
          </image>
          <span class="hxList-list-movie__item-name">{{ removeExtension(item.name) }}</span>
          <span class="hxList-list-movie__item-time">{{ item.releaseTime || '暂无' }}</span>
        </div>
      </tv-scroll>
    </div>
  </div>
</template>
<script setup>
import { ref, nextTick, watch, onMounted } from "vue";
import posterEmpty from "@/static/poster-empty.png";
import { onShow } from "@dcloudio/uni-app";
import { handleSeasonName, throttle, debounce } from "@/utils/scrape";
import * as CONFIG from "@/utils/config";
import tvScroll from "@/components/tv/tv-scroll/index.vue";

const props = defineProps({
  title: { type: String, default: "电影" },
  number: { type: String, default: "0" },
  listData: { type: Array, default: [] },
  isFocus: { type: Boolean, default: false },
  focusModel: { type: String, default: "" },
  historyPlay: { type: Array, default: [] },
  offsetTop: { type: Number, default: 0 },
});

const emits = defineEmits(["setFocus"]);

const tabIndex = ref(-1);
const lineHeight = ref("");
const scrollIntoView = ref("");

const scrollTop = ref(0)

const listData1 = ref(JSON.parse(JSON.stringify(props.listData)).slice(0, 30));
listData1.value.forEach((item) => {
  item.loadImg = true;
});

//获取上下的组件
const getUpDown = (direction) => {
  if (props.focusModel === "hxMovie") {
    if (direction === "up") {
      if (props.historyPlay.length) {
        return "recentPlayed";
      }
      return "starRecommend";
    } else {
      let localMovieTvData = uni.getStorageSync("localMovieTvData");
      if (localMovieTvData?.tv?.length) {
        return "hxTv";
      }
      return "videoClassify";
    }
  } else if (props.focusModel === "hxTv") {
    if (direction === "up") {
      let localMovieTvData = uni.getStorageSync("localMovieTvData");
      if (localMovieTvData?.movie?.length) {
        return "hxMovie";
      }
      if (props.historyPlay.length) {
        return "recentPlayed";
      }
      return "starRecommend";
    } else {
      return "videoClassify";
    }
  }
};

const removeExtension = (filename) => {
  let name = handleSeasonName(filename, true);
  if (name.length > 7) {
    name = name.slice(0, 6) + "...";
  }
  return name;
};
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

const setScrollIntoView = debounce(() => {
  if (tabIndex.value >= 3) {
    scrollIntoView.value = "name" + (tabIndex.value - 1);
  } else {
    scrollIntoView.value = "name1";
  }
}, 300);

const typeMapping = {
  "电影": "movie",
  "电视剧": "tv",
};
const toVideoDetail = (item) => {
  uni.navigateTo({
    url: `/pages/mobile/video/video-detail?path=${item.path}&name=${handleSeasonName(item.name, true)}&type=${typeMapping[props.title]}&source=${JSON.stringify(item.source)}&movieTvId=${item.movieTvId}`,
  });
};

const toVideoAll = () => {
  uni.navigateTo({
    url: `/pages/mobile/video/video-all?title=${props.title}`,
  });
};

const setEmptyImg = (poster) => {
  if (poster) {
    return CONFIG.IMG_DOMAIN + "/t/p/w300_and_h450_bestv2" + poster;
  } else {
    return posterEmpty;
  }
};

const setItemWidth = () => {
  let sysinfo = uni.getSystemInfoSync(); // 获取设备系统对象
  let windowWidth = sysinfo.windowWidth;
  const scale = uni.upx2px(100) / 100; // 获取1rpx对应的px比例
  lineHeight.value = (((windowWidth - uni.upx2px(320)) / 6) * 160) / 107 / scale + "rpx";
};
setItemWidth();

onShow(() => {
  nextTick(() => {
    listData1.value = JSON.parse(JSON.stringify(props.listData)).slice(0, 30);
    listData1.value.forEach((item) => {
      item.loadImg = true;
    });
  });
  setTimeout(() => {
    let windowHeight = uni.getSystemInfoSync().windowHeight
    const query = uni.createSelectorQuery();
    if (props.title == '电影') {
      query.select(".hxList-list-movie__img-movie").fields(
        {
          rect: true,
          size: true,
        },
        (res) => {
          scrollTop.value = (props.offsetTop + res.top - windowHeight / 2 + res.height / 2) < 0 ? 0 : props.offsetTop + res.top - windowHeight / 2 + res.height / 2
        }
      ).exec();
    } else if (props.title == '电视剧') {
      query.select(".hxList-list-movie__img-tv").fields(
        {
          rect: true,
          size: true,
        },
        (res) => {
          scrollTop.value = (props.offsetTop + res.top - windowHeight / 2 + res.height / 2) < 0 ? 0 : props.offsetTop + res.top - windowHeight / 2 + res.height / 2
        }
      ).exec();
    }
  }, 0);
});

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

const getScrollTop = () => {
  return scrollTop.value
}


defineExpose({
  evtMove,
  getScrollTop
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
  box-sizing: border-box;
  padding: 0 80rpx;

  .hxList-title {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .hxList-title-left {
      font-size: 36rpx;
      font-weight: bold;
      color: #000;
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

    ::v-deep .hxList-list-scroll {
      width: 100%;

      .uni-scroll-view-content {
        display: flex;
        flex-direction: row;
        align-items: center;
        flex-wrap: nowrap;
        width: 100%;

        .hxList-list-movie__item {
          margin-left: 32rpx;
          // flex: 0 0 214rpx;
          flex: 0 0 calc((100% - 160rpx) / 6);
          box-sizing: border-box;

          image {
            object-fit: cover;
            width: 100%;
            // height: 320rpx;
            height: var(--line-height);
            border-radius: 20rpx;
            box-sizing: border-box;
          }

          .hxList-list-movie__img-active {
            border: 6rpx solid #ff6701;
          }

          &-img {
            border: 6rpx solid transparent;
          }

          &-name {
            font-size: 28rpx;
            font-weight: bold;
            color: #fff;
            display: block;
          }

          &-time {
            font-size: 24rpx;
            color: #c3c6cf;
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

@media (prefers-color-scheme: dark) {
  .hxList {
    .hxList-title {
      .hxList-title-left {
        color: #fff;
      }

      .hxList-title-right {
        display: flex;
        align-items: center;

        span {
          font-size: 30rpx;
          line-height: 30rpx;
          color: rgb(154, 154, 154);
        }
      }
    }

    .hxList-list {
      .hxList-list-scroll {
        .hxList-list-movie {
          .hxList-list-movie__item {
            &-name {
              color: #fff;
            }

            &-time {
              color: rgb(154, 154, 154);
            }
          }
        }
      }
    }
  }
}
</style>