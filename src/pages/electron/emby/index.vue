<template>
  <div class="emby">
    <under-img :imgArr="underImgArr" :swipeIndex="swipeIndex" :leave="leave"></under-img>
    <div class="emby-list">
      <div class="emby-media">
        <div class="emby-media-title">
          <img :src="embyIcon" />
          <span>我的媒体</span>
        </div>
        <div class="emby-media-list">
          <div class="emby-media-list__item" v-for="item in classifyList" :key="item.id">
            <img :src="setEmptyImg(item.poster)" />
            <span>{{ item.name }}</span>
          </div>
        </div>
      </div>
      <hx-list :listData="item.list" :title="item.name" v-for="item in showList" :key="item.id" type="emby" @clickAll="clickAll(item)"></hx-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import underImg from '../components/under-img.vue'
import emptyBg from '@/static/poster-empty.png'
import hxList from '../home/components/hx-list.vue'
import { useRouter } from 'vue-router'
interface ClassifyItem {
  id: number | string
  poster: string
  name: string
  collectionType: string
  [key: string]: any
}

const router = useRouter()

const underImgArr = ref<string[]>([])
const swipeIndex = ref(0)
const leave = ref(false)
const showList = ref<ClassifyItem[]>([])
let timer: ReturnType<typeof setInterval> | null = null

const embyIcon: string = 'https://emby.media/support/images/logo.png'
const classifyList = ref<ClassifyItem[]>(uni.getStorageSync('embyMovieTvList') || [])

const setEmptyImg = (poster: string | null): string => {
  if (poster) {
    return poster
  } else {
    return emptyBg
  }
}

const setUnderImg = (): void => {
  if (classifyList.value?.length) {
    let oneNumber = Math.ceil(6 / classifyList.value.length)
    classifyList.value.forEach((item: ClassifyItem) => {
      const posters = item.list.slice(0, oneNumber).map((i: { poster: string }) => i.poster)
      underImgArr.value.push(...posters)
    })
    startAutoPlay()
  }
}

const setShowList = (): void => {
  const CollectionTypeArr = ['movies', 'tvshows', 'music', 'games', 'books', 'musicvideos', 'homevideos', 'livetv', 'channels']
  showList.value = classifyList.value.filter(i => CollectionTypeArr.includes(i.collectionType))
}

//开始轮播背景图
const startAutoPlay = (): void => {
  if (timer !== null) return
  timer = setInterval(() => {
    leave.value = true
    setTimeout(() => {
      if (swipeIndex.value === underImgArr.value.length - 1) {
        swipeIndex.value = 0
      } else {
        swipeIndex.value++
      }
      leave.value = false
    }, 350)
  }, 5000)
}

//点击全部
const clickAll = (item: ClassifyItem) => {
  const typeMapping = {
    'tvshows': 'Series',
    'movies': 'Movie',
  }
  router.push({})
  uni.navigateTo({
    url: `/pages/mobile/video/video-all?title=${item.name}&type=emby&embyParentId=${item.id}&embyIncludeItemTypes=${typeMapping[item.collectionType as keyof typeof typeMapping]}&isConnected1=true`,
  })
}
setUnderImg()
setShowList()
</script>

<style lang="scss" scoped>
.emby {
  position: relative;
  width: 100%;
  height: 100%;
  background: #fff;
  overflow: hidden;
  :deep(.under-img) {
    top: 0;
    left: 0;
  }
  .emby-list {
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 100rpx;
    .emby-media {
      position: relative;
      z-index: 99;
      margin-bottom: 50rpx;
      .emby-media-title {
        display: flex;
        align-items: center;

        img {
          display: block;
          width: 44rpx;
          height: 44rpx;
          object-fit: cover;
          object-position: left;
        }

        span {
          font-size: 36rpx;
          font-weight: bold;
          color: #000;
        }
      }

      .emby-media-list {
        display: flex;
        align-items: center;
        flex-wrap: nowrap;

        .emby-media-list__item {
          margin-left: 24rpx;
          flex: 0 0 calc((100% - 72rpx) / 4);
          cursor: pointer;
          overflow: hidden;

          img {
            width: 100%;
            aspect-ratio: 13/8;
            // display: block;
            object-fit: cover;
            object-position: center;
            border-radius: 20rpx;
          }

          span {
            font-size: 28rpx;
            font-weight: bold;
            color: #000;
            display: block;
            width: 100%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          &:first-child {
            margin-left: 0;
          }
        }
      }
    }
    :deep(.hxList) {
      position: relative;
      z-index: 99;
    }
  }
}
</style>
