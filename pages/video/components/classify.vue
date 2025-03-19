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
import emptyBg from "@/static/empty_bg.png";

const props = defineProps({
  isConnected: { type: Boolean, default: false }, //手机是否连接网络
});

const listData = ref([]);

const classifyList = ref([
  { id: "18", label: "剧情", img: "https://n.sinaimg.cn/sinakd20230822s/429/w1000h1029/20230822/85c9-12a6845ed1089e9489c8510b78bfd6ef.jpg", background: "linear-gradient(to bottom, #e90c00, #fc633d)" },
  { id: "10749", label: "爱情", img: "http://mms2.baidu.com/it/u=2417138206,3826310341&fm=253&app=138&f=JPEG?w=500&h=711", background: "linear-gradient(to bottom, #152de0, #5c6bf8)" },
  { id: "10751", label: "家庭", img: "http://mms2.baidu.com/it/u=3450351846,2320385931&fm=253&app=138&f=JPEG?w=500&h=714", background: "linear-gradient(to bottom, #e2860f, #ef9c41)" },
  { id: "35", label: "喜剧", img: "https://img31.mtime.cn/pi/2014/03/06/100404.23427262_1000X1000.jpg", background: "linear-gradient(to bottom, #00a9e8, #55cff7)" },
  { id: "36", label: "历史", img: "http://mms2.baidu.com/it/u=1997636151,980359615&fm=253&app=138&f=JPEG?w=500&h=889", background: "linear-gradient(to bottom, #f3743f, #f98f61)" },
  { id: "12", label: "冒险", img: "http://mms2.baidu.com/it/u=1171152207,1406454474&fm=253&app=138&f=JPEG?w=498&h=778", background: "linear-gradient(to bottom, #8c8259, #a8a17a)" },
  { id: "878", label: "科幻", img: "http://mms0.baidu.com/it/u=543696733,898405375&fm=253&app=120&f=JPEG?w=608&h=950", background: "linear-gradient(to bottom, #4f7077, #74959c)" },
  {
    id: "27",
    label: "恐怖",
    img: "https://bkimg.cdn.bcebos.com/pic/738b4710b912c8fcc3ce413dd2558545d688d53f8bbf?x-bce-process=image/format,f_auto/watermark,image_d2F0ZXIvYmFpa2UyNzI,g_7,xp_5,yp_5,P_20/resize,m_lfit,limit_1,h_1080",
    background: "linear-gradient(to bottom, #8d4615, #b06d41)",
  },
  { id: "53", label: "惊悚", img: "http://mms1.baidu.com/it/u=2731686268,2439194493&fm=253&app=120&f=JPEG?w=380&h=539", background: "linear-gradient(to bottom, #313131, #636363)" },
  { id: "80", label: "犯罪", img: "https://img2.baidu.com/it/u=2409104269,3506751094&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=670", background: "linear-gradient(to bottom, #2655d0, #5a81dc)" },
  { id: "9648", label: "悬疑", img: "http://mms0.baidu.com/it/u=3310303659,3889098684&fm=253&app=138&f=JPEG?w=338&h=507", background: "linear-gradient(to bottom, #f22821, #f95c50)" },
  { id: "10752", label: "战争", img: "https://img2.baidu.com/it/u=1996407550,4166232410&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=677", background: "linear-gradient(to bottom, #848486, #ababab)" },
  { id: "28", label: "动作", img: "https://img1.baidu.com/it/u=477668422,3613401629&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=750", background: "linear-gradient(to bottom, #25add8, #5ecdf0)" },
  { id: "16", label: "动画", img: "https://img1.baidu.com/it/u=3020374768,111332665&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=746", background: "linear-gradient(to bottom, #d73c23, #f46e5b)" },
  { id: "14", label: "奇幻", img: "https://wx1.sinaimg.cn/large/0079wuTAly1gx7yuc7wzyj30ty16ojx9.jpg", background: "linear-gradient(to bottom, #da243d, #dd626e)" },
]);

//获取当前缓存的影片的所有类别
const getGenre = () => {
  let idArr = [];
  listData.value = [];
  let movieTvData = uni.getStorageSync("localMovieTvData");
  movieTvData.movie.forEach((item) => {
    if (item.genre_ids) {
      idArr.push(...item.genre_ids);
    }
  });
  movieTvData.tv.forEach((item) => {
    if (item.genre_ids) {
      idArr.push(...item.genre_ids);
    }
  });
  
  idArr = [...new Set(idArr)];
  idArr.forEach((item) => {
    let obj = classifyList.value.find((i) => i.id == item);
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
