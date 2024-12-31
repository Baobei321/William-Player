<template>
  <div class="video-all">
    <div class="video-all-list">
      <wil-list :requestFn="getMovieTvList" :request-params="requestParams" ref="wil_list" :refresherEnabled="false"
        :listContainerClass="routerParams.title=='最近观看'?'list-recent':'list-container'" :pageSize="12">
        <template #default="item">
          <div class="video-all-list__item" @click="toVideoDetail(item)">
            <img :src="item.poster" class="item-poster" mode="aspectFill">
            <span class="item-name">{{ removeExtension(item) }}</span>
            <span class="item-time" v-if="routerParams.title!='最近观看'">{{ item.releaseTime }}</span>
          </div>
        </template>
      </wil-list>
    </div>
  </div>
</template>

<script setup>
import wilList from '../../components/wil-list/index.vue'
import { ref } from "vue";
import { onLoad } from '@dcloudio/uni-app';

const requestParams = ref({})

const mapping = {
  '电影': 'movie',
  '电视剧': 'tv',
}

const routerParams = ref({})

const removeExtension = (item) => {
  if (routerParams.value.title == '最近观看') {
    if (item.type == 'tv') {
      item.name1 = `${item.titlePlay} 第${item.ji}集 ${item.title}`
      const lastDotIndex = item.name1.lastIndexOf('.');
      let name = lastDotIndex === -1 ? item.name1 : item.name1.substring(0, lastDotIndex);
      if (name.length > 12) {
        name = name.slice(0, 11) + '...'
      }
      return name
    } else if (item.type == 'movie') {
      const lastDotIndex = item.name.lastIndexOf('.');
      let name = lastDotIndex === -1 ? item.name : item.name.substring(0, lastDotIndex);
      if (name.length > 7) {
        name = name.slice(0, 6) + '...'
      }
      return name
    }
  }
  const lastDotIndex = item.name.lastIndexOf('.');
  let name = lastDotIndex === -1 ? item.name : item.name.substring(0, lastDotIndex);
  if (name.length > 7) {
    name = name.slice(0, 6) + '...'
  }
  return name
};

const getMovieTvList = async (params) => {
  let res = null
  if (routerParams.value.title == '最近观看') {
    res = uni.getStorageSync('historyPlay')
    return {
      code: '200',
      rows: res.slice((params.pageNum - 1) * params.pageSize, params.pageNum * params.pageSize),
      total: res.length
    }
  } else if (routerParams.value.title == '电视剧' || routerParams.value.title == '电影') {
    res = uni.getStorageSync('localMovieTvData')
    let arr = res[mapping[routerParams.value.title]]
    return {
      code: '200',
      rows: arr.slice((params.pageNum - 1) * params.pageSize, params.pageNum * params.pageSize),
      total: arr.length
    }
  } else {
    res = uni.getStorageSync('localMovieTvData')
    let arr = []
    arr.push(...res.movie.filter(i => i.genre_ids.indexOf(+routerParams.value.genreId) > -1))
    arr.push(...res.tv.filter(i => i.genre_ids.indexOf(+routerParams.value.genreId) > -1))

    return {
      code: '200',
      rows: arr.slice((params.pageNum - 1) * params.pageSize, params.pageNum * params.pageSize),
      total: arr.length
    }
  }
}

const toVideoDetail = (item) => {
  uni.navigateTo({
    url: `/pages/video/video-detail?path=${item.path}&name=${item.name}&type=${item.type == '1' ? 'tv' : 'movie'}&source=${JSON.stringify(item.source)}&movieTvId=${item.movieTvId}`
  })
}

onLoad((options) => {
  routerParams.value = options
  uni.setNavigationBarTitle({
    title: routerParams.value.title
  })
})
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
        padding: 0 12px;
        padding-top: 16px;
        .list-item {
          margin-left: 12px;
          margin-bottom: 12px;
          flex: 0 0 calc((100% - 24px) / 3);
          .video-all-list__item {
            .item-poster {
              width: 100%;
              height: 160px;
              border-radius: 10px;
              object-fit: cover;
            }
            .item-name {
              font-size: 14px;
              font-weight: bold;
              color: #000;
              display: block;
            }
            .item-time {
              font-size: 12px;
              color: gray;
              padding-top: 3px;
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
        padding: 0 12px;
        padding-top: 16px;
        .list-item {
          margin-left: 12px;
          margin-bottom: 12px;
          flex: 0 0 calc((100% - 12px) / 2);
          .video-all-list__item {
            .item-poster {
              width: 100%;
              height: 90px;
              border-radius: 10px;
              object-fit: cover;
            }
            .item-name {
              font-size: 14px;
              font-weight: bold;
              color: #000;
            }
            .item-time {
              font-size: 12px;
              color: gray;
              padding-top: 3px;
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
