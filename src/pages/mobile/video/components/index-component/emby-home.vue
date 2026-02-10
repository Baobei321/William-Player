<template>
  <div class="emby-home">
    <div class="emby-home-media">
      <div class="emby-home-media__title">
        <div class="emby-home-media__title-left">
          <image
            src="https://gimg3.baidu.com/search/src=https%3A%2F%2Ftiebapic.baidu.com%2Fforum%2Fw%253D120%253Bh%253D120%2Fsign%3D44147d7d4e82b2b7a79f3dc60196a3d2%2Fc9fcc3cec3fdfc03771506c1c33f8794a4c2265e.jpg%3Ftbpicau%3D2025-04-08-05_5fe90c457d4356ee146a73914e8a8871&refer=http%3A%2F%2Fwww.baidu.com&app=2021&size=w240&n=0&g=0n&q=75&fmt=auto?sec=1744045200&t=627b5377de1d3107a8a09cb4f65c9fdc"
          ></image>
          <span>我的媒体</span>
        </div>
        <!-- <div class="emby-home-media__title-right" @click="toVideoAll">
                    <span>全部</span>
                    <nut-icon name="rect-right" size="10" custom-color="#52b54b"></nut-icon>
                </div> -->
      </div>
      <div class="emby-home-media__list">
        <scroll-view class="emby-home-media__list-scroll" :scroll-x="true" style="width: 100%" :enhanced="true" :showScrollbar="false">
          <div class="emby-home-media__list-classify">
            <div class="emby-home-media__list-classify__item" v-for="item in classifyList" :key="item.id" @click="toVideoAll(item)">
              <div class="emby-home-media__list-classify__item-img">
                <image :src="setEmptyImg(item.poster)" style="width: 100%; height: 100%; position: static" mode="aspectFill"></image>
              </div>
              <span class="emby-home-media__list-classify__item-name">{{ item.name }}</span>
            </div>
          </div>
        </scroll-view>
      </div>
    </div>
    <hx-list :listData="item.list" :title="item.name" v-for="item in showList" :key="item.id" type="emby" @clickAll="clickAll(item)"></hx-list>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import hxList from './hx-list.vue'
import emptyBg from '@/static/poster-empty.png'

const classifyList = ref(uni.getStorageSync('embyMovieTvList'))
const showList = ref([])

//设置可展示的数组
const setShowList = () => {
  const CollectionTypeArr = ['movies', 'tvshows', 'music', 'games', 'books', 'musicvideos', 'homevideos', 'livetv', 'channels']
  showList.value = classifyList.value.filter(i => CollectionTypeArr.includes(i.collectionType))
}
setShowList()
const setEmptyImg = poster => {
  if (poster) {
    return poster
  } else {
    return emptyBg
  }
}

const clickAll = item => {
  const typeMapping = {
    'tvshows': 'Series',
    'movies': 'Movie',
  }
  uni.navigateTo({
    url: `/pages/mobile/video/video-all?title=${item.name}&type=emby&embyParentId=${item.id}&embyIncludeItemTypes=${typeMapping[item.collectionType]}&isConnected1=true`,
  })
}

const toVideoAll = item => {
  const typeMapping = {
    'tvshows': 'Series',
    'movies': 'Movie',
  }
  uni.navigateTo({
    url: `/pages/mobile/video/video-all?title=${item.name}&type=emby&embyParentId=${item.id}&embyIncludeItemTypes=${typeMapping[item.collectionType]}&isConnected1=true`,
  })
}
</script>

<style lang="scss" scoped>
.emby-home {
  width: 100%;
  margin-bottom: 50rpx;
  padding: 24rpx;

  .emby-home-media {
    margin-bottom: 50rpx;

    .emby-home-media__title {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .emby-home-media__title-left {
        display: flex;
        align-items: center;

        image {
          width: 30rpx;
          height: 30rpx;
        }

        span {
          font-size: 36rpx;
          font-weight: bold;
          color: #000;
        }
      }

      .emby-home-media__title-right {
        display: flex;
        align-items: center;

        span {
          font-size: 30rpx;
          color: #52b54b;
          line-height: 30rpx;
        }

        span:nth-child(2) {
          padding-left: 6rpx;
          color: #52b54b;
        }
      }
    }

    .emby-home-media__list {
      margin-top: 24rpx;

      .emby-home-media__list-scroll {
        width: 100%;
        overflow-x: auto;

        .emby-home-media__list-classify {
          display: flex;
          flex-wrap: nowrap;
          align-items: center;

          .emby-home-media__list-classify__item {
            margin-left: 24rpx;
            flex: 0 0 480rpx;

            .emby-home-media__list-classify__item-img {
              background-position: center;
              background-repeat: no-repeat;
              background-size: cover;
              height: 250rpx;
              width: 100%;
              border-radius: 20rpx;
              position: relative;
              overflow: hidden;

              image {
                width: 100%;
                height: 100%;
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
}
</style>
