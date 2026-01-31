<template>
  <div class="list-item">
    <div class="list-item__container">
      <div class="container-left">
        <div class="container-left-img">
          <image :src="props.data.imgUrl" mode="aspectFill"></image>
        </div>
        <div class="container-left-info">
          <div class="container-left-info__name">{{ props.data.name }}</div>
          <div class="container-left-info__error" v-if="props.data.status === 'ERROR'">下载失败</div>
          <div class="container-left-info__size" v-else>
            <span class="size-value">{{ props.data.status === 'COMPLETED' ? props.data.total_size : props.data.current_size + ' / ' + props.data.total_size }}</span>
            <template v-if="props.data.status !== 'COMPLETED'">
              <span class="size-icon"></span>
              <span class="size-rate">{{ props.data.speed || '0KB/s' }}</span>
            </template>
          </div>
        </div>
      </div>
      <div class="container-right">
        <image src="@/static/pause-black.png" @click.stop="pauseById(props.data.id)" v-if="props.data.status === 'DOWNLOADING'"></image>
        <image src="@/static/play-black.png" @click.stop="resumeById(props.data.id)" v-if="props.data.status === 'PAUSED'"></image>
        <image src="@/static/reload-black.png" @click.stop="resumeById(props.data.id)" v-if="props.data.status === 'ERROR'"></image>
        <image src="@/static/delete-icon.png" @click.stop="deleteById(item)"></image>
      </div>
    </div>
    <div class="list-item__progress">
      <wil-progress
        v-if="props.data.percent < 100"
        :percentage="props.data.percent"
        strokeWidth="10rpx"
        :showText="false"
        color="linear-gradient(270deg, rgb(18, 126, 255) 0%, rgb(32, 147, 255) 32.8156%, rgb(13, 242, 204) 100%)"></wil-progress>
    </div>
  </div>
</template>

<script setup>
import wilProgress from '@/components/mobile/wil-progress/index.vue'
const props = defineProps({
  data: { type: Object, default: {} },
})

const emits = defineEmits(['pauseById', 'resumeById', 'deleteById'])

const pauseById = id => {
  emits('pauseById', id)
}
const resumeById = id => {
  emits('resumeById', id)
}
const deleteById = item => {
  emits('deleteById', item)
}
</script>

<style lang="scss" scoped>
.list-item {
  display: flex;
  flex-direction: column;
  &:active {
    background: #f6f6f6;
  }
  .list-item__container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx;
    .container-left {
      display: flex;
      .container-left-img {
        image {
          display: block;
          width: 120rpx;
          height: 120rpx;
          border-radius: 20rpx;
        }
      }
      .container-left-info {
        margin-left: 36rpx;
        .container-left-info__name {
          font-size: 32rpx;
          font-weight: bold;
        }
        .container-left-info__size {
          font-size: 28rpx;
          color: gray;
          margin-top: 16rpx;
          display: flex;
          align-items: center;
          span{
            display: block;
          }
          .size-icon{
            width: 8rpx;
            height: 8rpx;
            border-radius: 50%;
            background: gray;
            margin: 0 12rpx;
          }
        }
        .container-left-info__error {
          font-size: 28rpx;
          color: #fe4344;
          margin-top: 16rpx;
        }
      }
    }
    .container-right {
      display: flex;
      image {
        display: block;
        width: 40rpx;
        height: 40rpx;
        &:last-child {
          margin-left: 24rpx;
        }
      }
    }
  }
  .list-item__progress {
    height: 10rpx;
    :deep(.wil-progress) {
      .wil-progress-outer {
        border-radius: 0;
        background-color: transparent;
        .wil-progress-inner {
          border-radius: 0 24rpx 24rpx 0;
        }
      }
    }
  }
}
</style>
