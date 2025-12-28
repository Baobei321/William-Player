<template>
  <div class="tvlist-popup">
    <nut-popup v-model:visible="visible" position="bottom">
      <div class="tvlist-popup-wrapper">
        <div class="tvlist-popup-wrapper__title" :style="{ height: navBarHeight }">
          <div class="tvlist-popup-wrapper__title-content" :style="{ height: contentHeight }">
            <nut-icon name="rect-down" @click="close"></nut-icon>
            <span>{{ props.title }}</span>
          </div>
        </div>
        <div class="tvlist-popup-wrapper__list">
          <div class="tvlist-popup-wrapper__list-item" v-for="(item, index) in props.tvList" :key="item.name" @click="playVideo(item, index)">
            <div class="item-img">
              <image :src="item.poster" mode="aspectFill"></image>
            </div>
            <div class="item-info">
              <div class="item-info-title">{{ index + 1 + '.' + (item.title || `第${index + 1}集`) }}</div>
              <div class="item-info-star">
                <image src="@/static/star-fill.png"></image>
                <span class="star-score">{{ item.vote_average.toFixed(1) }}</span>
                <span class="star-runtime">{{ calTime(item.runtimeOrg, 'cn') }}</span>
              </div>
              <div class="item-info-desc">{{ item.overview }}</div>
            </div>
          </div>
        </div>
      </div>
    </nut-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { calTime } from '@/utils/scrape'

const props = defineProps({
  tvList: { type: Array, default: [] },
  title: { type: String, default: '' },
})

const emits = defineEmits(['playVideo'])
const visible = defineModel('visible')
const navBarHeight = ref('')
const contentHeight = ref('')

//计算微信navBar高度
const getNavHeight = () => {
  let sysinfo = uni.getSystemInfoSync() // 获取设备系统对象
  let statusBarHeight = sysinfo.statusBarHeight // 获取状态栏高度
  navBarHeight.value = statusBarHeight + 44 + 'px' //计算nav导航栏的高度
  contentHeight.value = '44px'
}

//计算h5的navBar高度
const getH5NavbarHeight = () => {
  let sysinfo = uni.getSystemInfoSync() // 获取设备系统对象
  navBarHeight.value = '44px'
  contentHeight.value = '44px'
}
const close = () => {
  visible.value = false
}

const playVideo = (item, index) => {
  emits('playVideo', item, index)
}

// #ifdef APP-PLUS
getNavHeight()
// #endif

// #ifdef H5
getH5NavbarHeight()
// #endif
</script>

<style lang="scss" scoped>
.tvlist-popup {
  :deep(.nut-popup) {
    width: 100%;
    height: 100%;
    .tvlist-popup-wrapper {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      .tvlist-popup-wrapper__title {
        width: 100%;
        position: relative;
        .tvlist-popup-wrapper__title-content {
          position: absolute;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          bottom: 0;
          left: 0;
          .nut-icon-rect-down {
            width: 40rpx;
            height: 40rpx;
            font-size: 40rpx;
            position: absolute;
            left: 32rpx;
            cursor: pointer;
          }
          span {
            font-size: 32rpx;
            font-weight: bold;
            color: #000;
          }
        }
      }
      .tvlist-popup-wrapper__list {
        flex: 1;
        overflow: auto;
        border-top: 2rpx solid #ebebeb;
        .tvlist-popup-wrapper__list-item {
          display: flex;
          padding: 24rpx;
          border-bottom: 1px solid #ebebeb;
          .item-img {
            flex: 0 0 150rpx;
            height: 224rpx;
            image {
              display: block;
              width: 100%;
              height: 100%;
              border-radius: 20rpx;
            }
          }
          .item-info {
            padding-left: 24rpx;
            .item-info-title {
              font-size: 32rpx;
              font-weight: bold;
            }
            .item-info-star {
              display: flex;
              align-items: center;
              padding-top: 16rpx;
              image {
                width: 32rpx;
                height: 32rpx;
                display: block;
              }
              .star-score {
                color: #f4bc22;
                font-size: 28rpx;
              }
              .star-runtime {
                padding-left: 16rpx;
                font-size: 28rpx;
                color: #000;
              }
            }
            .item-info-desc {
              padding-top: 16rpx;
              display: -webkit-box;
              -webkit-line-clamp: 3;
              -webkit-box-orient: vertical;
              overflow: hidden;
              text-overflow: ellipsis;
              font-size: 28rpx;
              color: #848484;
              line-height: normal;
            }
          }
        }
      }
    }
  }
}
</style>
