<template>
  <div class="actor-list">
    <div class="story-introduction" v-if="imgData.overview">
      <div class="story-introduction-title">剧情简介</div>
      <div class="story-introduction-text">{{ imgData.overview }}</div>
    </div>
    <div class="related-actors" v-if="actors.length">
      <div class="related-actors-title">相关演员</div>
      <scroll-view class="related-actors-scroll" :scroll-x="true" style="width: 100%" :enhanced="true" :showScrollbar="false">
        <div class="related-actors-list">
          <div class="related-actors-list__item" v-if="director.name">
            <image class="item-avatar" backgroundColor='#efefef'
              :src="director.profile_path ? 'https://media.themoviedb.org/t/p/w100_and_h100_bestv2' + director.profile_path : 'https://storage.7x24cc.com/storage-server/presigned/ss1/a6-online-fileupload/newMediaImage/2AFA742_427A_user-avatar_20241225150546694newMediaImage.png'"
              mode="aspectFill" />
            <div class="item-name">{{director.name}}</div>
            <div class="item-job">导演</div>
          </div>
          <div class="related-actors-list__item" v-for="item in actors" :key="item.name">
            <image class="item-avatar" backgroundColor='#efefef'
              :src="item.profile_path?'https://media.themoviedb.org/t/p/w100_and_h100_bestv2'+item.profile_path :'https://storage.7x24cc.com/storage-server/presigned/ss1/a6-online-fileupload/newMediaImage/2AFA742_427A_user-avatar_20241225150546694newMediaImage.png'"
              mode="aspectFill" />
            <div class="item-name">{{item.name}}</div>
            <div class="item-role">饰 {{ item.character }}</div>
          </div>
        </div>
      </scroll-view>
    </div>
    <div class="tip-footer">
      <span class="tip-footer-name">{{ handleSeasonName(props.selectSource.name,true)+'-' }}</span>
      <span class="tip-footer-webdav">路径：{{ props.selectSource.path }}</span>
      <div class="tip-footer-timesize">
        <span v-if="imgData.runtime">{{ imgData.runtime }}</span><span>{{ props.selectSource.sourceName }}</span>
        <span v-if="props.selectSource.size">{{ props.routerParams.type=='movie' ? props.selectSource.size : handleSize(props.selectSource.size) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeMount } from "vue";
import { handleSeasonName } from "@/utils/scrape";
const props = defineProps({
  routerParams: { type: Object, default: {} },
  selectSource: { type: Object, default: {} },
  imgData: { type: Object, default: {} },
});
const director = ref({});
const actors = ref([]);
//处理内存大小
const handleSize = (size) => {
  if (size == 0) return "0";
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(size) / Math.log(1024));
  const formatted = parseFloat((size / Math.pow(1024, i)).toFixed(2));
  return formatted + " " + sizes[i];
};
//获取演员表
const getActorById = (data, type) => {
  let url = "";
  let obj = JSON.parse(JSON.stringify(data));
  if (!data.movieTvId || !obj.movieTvId) return Promise.reject();
  if (type == "movie") {
    url = `https://api.tmdb.org/3/movie/${obj.movieTvId}/credits`;
  } else if (type == "tv") {
    url = `https://api.tmdb.org/3/tv/${obj.movieTvId}/credits`;
  }
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
const getActorList = async () => {
  let res = await getActorById(
    {
      movieTvId: props.routerParams.movieTvId,
    },
    props.routerParams.type
  );
  director.value = res.crew[0] || {};
  actors.value = res.cast.slice(0, 20);
};
defineExpose({
  getActorList,
});
onBeforeMount(() => {
  getActorList();
});
</script>

<style lang="scss" scoped>
.actor-list {
  width: 100%;
  .story-introduction {
    margin-top: 50rpx;

    .story-introduction-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #000;
      padding-bottom: 20rpx;
    }

    .story-introduction-text {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 28rpx;
      color: #000;
    }
  }

  .related-actors {
    margin-top: 50rpx;

    .related-actors-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #000;
      padding-bottom: 20rpx;
    }

    .related-actors-scroll {
      .related-actors-list {
        display: flex;
        align-items: center;
        flex-wrap: nowrap;

        .related-actors-list__item {
          margin-left: 12rpx;
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 0 0 140rpx;
          overflow: hidden;

          &:first-child {
            margin-left: 0;
          }

          .item-avatar {
            width: 120rpx;
            height: 120rpx;
            border-radius: 50%;
          }

          .item-name {
            font-size: 28rpx;
            color: #000;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: center;
            width: 100%;
          }

          .item-job {
            padding: 4rpx 6rpx;
            border: 2rpx solid #c2c5c6;
            font-size: 20rpx;
            color: #c2c5c6;
            border-radius: 6rpx;
            height: 35rpx;
            box-sizing: border-box;
          }

          .item-role {
            height: 35rpx;
            line-height: 35rpx;
            font-size: 24rpx;
            color: #c2c5c6;
            width: 100%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: center;
          }
        }
      }
    }
  }
  .tip-footer {
    margin-top: 50rpx;
    padding-top: 20rpx;
    border-top: 2rpx solid #c2c5c6;
    width: 100%;
    .tip-footer-name {
      font-size: 24rpx;
      color: #c2c5c6;
    }

    .tip-footer-webdav {
      font-size: 24rpx;
      color: #c2c5c6;
      padding-top: 20rpx;
      word-break: break-all;  /* 允许在任意字符间断行 */
    }

    .tip-footer-timesize {
      font-size: 24rpx;
      color: #acacac;
      font-weight: bold;
      display: flex;
      align-items: center;
      padding-top: 20rpx;

      span:nth-child(2) {
        padding-left: 10rpx;
      }

      span:last-child {
        padding-left: 10rpx;
      }
    }
  }
}
</style>
