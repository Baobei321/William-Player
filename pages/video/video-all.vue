<template>
  <div class="video-all">
    <div class="video-all-list">
      <wil-list :requestFn="getMovieTvList" :request-params="requestParams" ref="wil_list" :refresherEnabled="false" idKey="name"
        :listContainerClass="routerParams.title=='最近观看'?'list-recent':'list-container'" :pageSize="12" :changeItemFn="changeItemFn">
        <template #default="item">
          <div class="video-all-list__item" @click="toVideoDetail(item)">
            <image :src="(routerParams.isConnected=='false' && !item.loadImg) ? emptyBg : item.poster" class="item-poster" mode="aspectFill"
              @error="imgError(item)" @load="imgLoad(item)"></image>
            <span class="item-name">{{ removeExtension(item) }}</span>
            <span class="item-time" v-if="routerParams.title!='最近观看'">{{ item.releaseTime }}</span>
          </div>
        </template>
      </wil-list>
    </div>
  </div>
</template>

<script setup>
import wilList from "../../components/wil-list/index.vue";
import { ref, nextTick } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import emptyBg from "@/static/empty_bg.png";

const requestParams = ref({});

const mapping = {
  "电影": "movie",
  "电视剧": "tv",
};

const routerParams = ref({});

const wil_list = ref(null);

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
    ref.forEach((item) => {
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
    console.log(arr,'arr123');
    
    return {
      code: "200",
      rows: arr.slice((params.pageNum - 1) * params.pageSize, params.pageNum * params.pageSize),
      total: arr.length,
    };
  } else {
    res = uni.getStorageSync("localMovieTvData");
    let arr = [];
    arr.push(...res.movie.filter((i) => i.genre_ids.indexOf(+routerParams.value.genreId) > -1));
    arr.push(...res.tv.filter((i) => i.genre_ids.indexOf(+routerParams.value.genreId) > -1));
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

const toVideoDetail = (item) => {
  uni.navigateTo({
    url: `/pages/video/video-detail?path=${item.path}&name=${item.name}&type=${item.type == "1" ? "tv" : "movie"}&source=${JSON.stringify(item.source)}&movieTvId=${item.movieTvId}`,
  });
};

const changeItemFn = ref(() => {});
const imgError = (item) => {
  changeItemFn.value = (item) => {
    item.loadImg = false;
  };
  nextTick(() => {
    wil_list.value.handleEdit(item.name);
  });
};

const imgLoad = (item) => {
  if (routerParams.value.isConnected=='false' && !item.loadImg) return;
  changeItemFn.value = (item) => {
    item.loadImg = true;
  };
  nextTick(() => {
    wil_list.value.handleEdit(item.name);
  });
};
onLoad((options) => {
  routerParams.value = options;
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
              object-fit: cover;
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
              object-fit: cover;
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
}
</style>
