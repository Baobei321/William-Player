<template>
  <div class="recent-played">
    <div class="recent-played-title">
      <div class="recent-played-title-left">最近观看</div>
      <div class="recent-played-title-right" @click="toVideoAll">
        <span>全部</span>
        <span>{{ listData.length }}</span>
        <nut-icon name="rect-right" size="10" custom-color="gray"></nut-icon>
      </div>
    </div>
    <div class="recent-played-list">
      <scroll-view class="recent-played-list-scroll" :scroll-x="true" style="width: 100%" :enhanced="true" :showScrollbar="false">
        <div class="recent-played-list-movie">
          <div class="recent-played-list-movie__item" v-for="item in listData" :key="item.name" @click="toVideoPlayer(item)">
            <div class="recent-played-list-movie__item-img">
              <image :src="!isConnected&&!item.loadImg ? emptyBg : item.poster" @error="imgError(item)" @load="imgLoad(item)"
                style="width: 100%;height: 100%;position: static;" mode="aspectFill"></image>
              <image :src="playVideoButton" class="img-button" />
              <span class="img-runtime">{{ handleSecond(item.initialTime)+'/'+ item.runtime }}</span>
              <div class="img-process" :style="{width:Number(item.initialTime)/(Number(parseTime(item.runtime))*0.6)+'%'}"></div>
            </div>
            <span class="recent-played-list-movie__item-name" v-if="item.type=='movie'">{{ removeExtension(item.name) }}</span>
            <span class="recent-played-list-movie__item-name" v-if="item.type=='tv'">{{ removeExtension(`${item.titlePlay} 第${item.ji}集 ${item.title}`) }}</span>
          </div>
        </div>
      </scroll-view>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import playVideoButton from "../../../static/playVideo-button.png";
import { handleSecond, parseTime } from "./common";
import { onShow } from "@dcloudio/uni-app";
import emptyBg from "@/static/empty_bg.png";

const props = defineProps({
  isConnected: { type: Boolean, default: false }, //手机是否连接网络
});

const listData = ref(uni.getStorageSync("historyPlay") || []);

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

const removeExtension = (filename) => {
  const lastDotIndex = filename.lastIndexOf(".");
  let name = lastDotIndex === -1 ? filename : filename.substring(0, lastDotIndex);
  if (name.length > 17) {
    name = name.slice(0, 16) + "...";
  }
  return name;
};

//裁剪格式获取电影名
const getMovieName = (val) => {
  const lastDotIndex = val.lastIndexOf(".");
  let name = lastDotIndex === -1 ? val : val.substring(0, lastDotIndex);
  return name;
};

//将点击了的视频放置到数组的第一个去
const setItemFirst = (item) => {
  let index = null;
  if (item.type == "tv") {
    index = listData.value.findIndex((i) => i.type == item.type && i.titlePlay == item.titlePlay);
  } else if (item.type == "movie") {
    index = listData.value.findIndex((i) => i.type == item.type && getMovieName(i.name) == getMovieName(item.name));
  }
  if (index > -1) {
    listData.value.splice(index, 1);
    listData.value.unshift(item);
  } else {
    listData.value.unshift(item);
  }
  uni.setStorageSync("historyPlay", listData.value);
};

const toVideoPlayer = (item) => {
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
};

const toVideoAll = () => {
  uni.navigateTo({
    url: `/pages/video/video-all?title=最近观看&isConnected=${props.isConnected}`,
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
  judgeSelect();
  listData.value = uni.getStorageSync("historyPlay") || [];
  listData.value.forEach((item) => {
    item.loadImg = true;
  });
});
</script>

<style lang="scss" scoped>
.recent-played {
  width: 100%;
  margin-bottom: 50rpx;
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
</style>
