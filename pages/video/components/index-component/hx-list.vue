<template>
  <div class="hxList" ref="hx_list">
    <div class="hxList-title">
      <div class="hxList-title-left">{{ props.title }}</div>
      <div class="hxList-title-right" @click="toVideoAll">
        <span>全部</span>
        <span>{{ props.listData.length }}</span>
        <nut-icon name="rect-right" size="10" custom-color="gray"></nut-icon>
      </div>
    </div>
    <div class="hxList-list">
      <scroll-view class="hxList-list-scroll" :scroll-x="true" style="width: 100%" :enhanced="true" :showScrollbar="false">
        <div class="hxList-list-movie">
          <div class="hxList-list-movie__item" v-for="item in listData1" :key="item.name" @click="toVideoDetail(item)">
            <image :src="!props.isConnected && !item.loadImg? emptyBg : 'https://media.themoviedb.org/t/p/w300_and_h450_bestv2' + item.poster" style="object-fit: cover;"
              @error="imgError(item)" @load="imgLoad(item)" mode="aspectFill"></image>
            <span class="hxList-list-movie__item-name">{{ removeExtension(item.name) }}</span>
            <span class="hxList-list-movie__item-time">{{ item.releaseTime }}</span>
          </div>
        </div>
      </scroll-view>
    </div>
  </div>
</template>
<script setup>
import { ref, nextTick } from "vue";
import emptyBg from "@/static/empty_bg.png";
import { onShow } from "@dcloudio/uni-app";
import { handleSeasonName } from "../../../../utils/common";

const props = defineProps({
  title: { type: String, default: "电影" },
  number: { type: String, default: "0" },
  listData: { type: Array, default: [] },
  isConnected: { type: Boolean, default: false }, //手机是否连接网络
});

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

const typeMapping = {
  "电影": "movie",
  "电视剧": "tv",
};
const toVideoDetail = (item) => {
  uni.navigateTo({
    url: `/pages/video/video-detail?path=${item.path}&name=${handleSeasonName(item.name, true)}&type=${typeMapping[props.title]}&source=${JSON.stringify(item.source)}&movieTvId=${item.movieTvId}`,
  });
};

const toVideoAll = () => {
  uni.navigateTo({
    url: `/pages/video/video-all?title=${props.title}&isConnected1=${props.isConnected}`,
  });
};

const imgError = (item) => {
  item.loadImg = false;
};

const imgLoad = (item) => {
  if (!props.isConnected && !item.loadImg) return;
  item.loadImg = true;
};

onShow(() => {
  nextTick(() => {
    listData1.value = JSON.parse(JSON.stringify(props.listData)).slice(0, 30)
    listData1.value.forEach((item) => {
      item.loadImg = true;
    });
  });
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

        .hxList-list-movie__item {
          margin-left: 24rpx;
          flex: 0 0 214rpx;
          image {
            object-fit: cover;
            width: 100%;
            height: 320rpx;
            border-radius: 20rpx;
          }
          &-name {
            font-size: 28rpx;
            font-weight: bold;
            color: #000;
            display: block;
          }
          &-time {
            font-size: 24rpx;
            color: gray;
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
</style>