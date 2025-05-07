<template>
  <div class="video-classify">
    <div class="video-classify-title">类别</div>
    <div class="video-classify-list">
      <div class="list-item" v-for="item in listData" :key="item.id" :style="{ background: item.background }" @click="toVideoAll(item)">
        <div class="list-item-title">{{ item.label }}</div>
        <div class="list-item-img">
          <div class="img-one"></div>
          <div class="img-two"></div>
          <div class="img-three">
            <image :src="!props.isConnected && !item.loadImg? emptyBg : item.img" @error="imgError(item)" @load="imgLoad(item)" mode="aspectFill" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { classifyList } from "../../../../utils/common.js";
import emptyBg from "@/static/empty_bg.png";

const props = defineProps({
  isConnected: { type: Boolean, default: false }, //手机是否连接网络
});

const listData = ref([]);

const classifyList1 = ref(JSON.parse(JSON.stringify(classifyList)));

//获取当前缓存的影片的所有类别
const getGenre = () => {
  let idArr = [];
  listData.value = [];
  let movieTvData = uni.getStorageSync("localMovieTvData") || {};
  movieTvData.movie?.forEach((item) => {
    if (item.genre_ids) {
      idArr.push(...item.genre_ids);
    }
  });
  movieTvData.tv?.forEach((item) => {
    if (item.genre_ids) {
      idArr.push(...item.genre_ids);
    }
  });

  idArr = [...new Set(idArr)];
  idArr.forEach((item) => {
    let obj = classifyList1.value.find((i) => i.id == item);
    if (obj) {
      obj.loadImg = true;
      listData.value.push(obj);
    }
  });
};

//跳转到videoAll
const toVideoAll = (item) => {
  uni.navigateTo({
    url: `/pages/video/video-all?title=${item.label}&genreId=${item.id}&isConnected=${props.isConnected}`,
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
  getGenre();
});
</script>

<style lang="scss" scoped>
.video-classify {
  width: 100%;
  overflow-x: hidden;

  .video-classify-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #000;
  }

  .video-classify-list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    width: 100%;

    .list-item {
      flex: 0 0 calc(50% - 10rpx);
      height: 170rpx;
      border-radius: 20rpx;
      margin-top: 20rpx;
      position: relative;
      padding: 30rpx;
      box-sizing: border-box;

      .list-item-title {
        font-size: 36rpx;
        font-weight: bold;
        color: #fff;
      }

      .list-item-img {
        position: absolute;
        overflow: hidden;
        width: 100%;
        height: 100%;
        right: 0;
        top: 0;

        .img-one {
          background: rgba(255, 255, 255, 0.4);
          border-radius: 16rpx;
          width: 140rpx;
          height: 240rpx;
          position: absolute;
          right: 40rpx;
          top: 40rpx;
          transform: rotate(-7deg);
        }

        .img-two {
          background: rgba(255, 255, 255, 0.4);
          border-radius: 16rpx;
          width: 140rpx;
          height: 240rpx;
          position: absolute;
          right: 30rpx;
          top: 30rpx;
          transform: rotate(7deg);
        }

        .img-three {
          background: rgba(255, 255, 255, 0.4);
          border-radius: 16rpx;
          width: 140rpx;
          height: 240rpx;
          position: absolute;
          right: 16rpx;
          top: 20rpx;
          transform: rotate(15deg);

          image {
            width: 100%;
            height: 100%;
            border-radius: 16rpx;
          }
        }
      }
    }
  }
}
</style>
