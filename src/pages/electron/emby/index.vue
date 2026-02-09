<template>
  <div class="emby">
    <under-img :imgArr="underImgArr" :swipeIndex="swipeIndex" :leave="leave"></under-img>
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import underImg from '../components/under-img.vue'
import emptyBg from '@/static/poster-empty.png'
interface ClassifyItem {
  id: number | string
  poster: string
  name: string
  collectionType: string
  [key: string]: any
}

const underImgArr = ref<string[]>([])
const swipeIndex = ref(0)
const leave = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const embyIcon: string =
  'https://gimg3.baidu.com/search/src=https%3A%2F%2Ftiebapic.baidu.com%2Fforum%2Fw%253D120%253Bh%253D120%2Fsign%3D44147d7d4e82b2b7a79f3dc60196a3d2%2Fc9fcc3cec3fdfc03771506c1c33f8794a4c2265e.jpg%3Ftbpicau%3D2025-04-08-05_5fe90c457d4356ee146a73914e8a8871&refer=http%3A%2F%2Fwww.baidu.com&app=2021&size=w240&n=0&g=0n&q=75&fmt=auto?sec=1744045200&t=627b5377de1d3107a8a09cb4f65c9fdc'
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

setUnderImg()
</script>

<style lang="scss" scoped>
.emby {
  padding: 100rpx;
  position: relative;
  width: 100%;
  height: 100%;
  background: #fff;
  :deep(.under-img) {
    top: 0;
    left: 0;
  }
  .emby-media {
    position: relative;
    z-index: 2;
    .emby-media-title {
      display: flex;
      align-items: center;

      img {
        display: block;
        width: 44rpx;
        height: 44rpx;
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
}
</style>
