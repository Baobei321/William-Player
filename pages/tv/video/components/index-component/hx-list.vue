<template>
  <div class="hxList" ref="hx_list" :style="{'--line-height':lineHeight}">
    <div class="hxList-title">
      <div class="hxList-title-left">{{ props.title }}</div>
      <!-- <div class="hxList-title-right" @click="toVideoAll">
        <span>全部</span>
        <span>{{ props.listData.length }}</span>
        <nut-icon name="rect-right" size="10" custom-color="gray"></nut-icon>
      </div> -->
    </div>
    <div class="hxList-list">
      <scroll-view class="hxList-list-scroll" :scroll-x="true" style="width: 100%" :enhanced="true" :showScrollbar="false">
        <div class="hxList-list-movie">
          <div class="hxList-list-movie__item" v-for="(item,index) in listData1" :key="item.name" @click="toVideoDetail(item)">
            <image :src="setEmptyImg(item.poster)" mode="aspectFill" :class="[tabIndex==index ? 'hxList-list-movie__img-active' : 'hxList-list-movie__item-img']">
            </image>
            <span class="hxList-list-movie__item-name">{{ removeExtension(item.name) }}</span>
            <span class="hxList-list-movie__item-time">{{ item.releaseTime||'暂无' }}</span>
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

const props = defineProps({
  title: { type: String, default: "电影" },
  number: { type: String, default: "0" },
  listData: { type: Array, default: [] },
});

const tabIndex = ref(0);
const lineHeight = ref("");

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

const evtMove = (keyCode) => {
  if (keyCode === "KeyRight") {
    if (tabIndex.value != props.listData.length - 1) {
      tabIndex.value++;
    }
  } else if (keyCode === "KeyLeft") {
    if (tabIndex.value > 0) {
      tabIndex.value--;
    }
  }
  console.log(keyCode);
};

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
});

defineExpose({
  evtMove,
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

    .hxList-list-scroll {
      width: 100%;

      .hxList-list-movie {
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
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
            color: #000;
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
        .hxList-list-movie__active {
          border: 4rpx solid red;
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