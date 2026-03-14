<template>
  <div class="wil-share-sheet">
    <nut-popup v-model:visible="visible" position="bottom" :round="props.round">
      <div class="wil-share-sheet__wrapper">
        <div class="wrapper-title">{{ props.title }}</div>
        <div class="wrapper-list" :style="{ flexWrap: props.wrap ? 'wrap' : 'nowrap' }">
          <div
            :class="['wrapper-list-item', item.delay !== null && item.delay !== undefined ? 'animate__fadeInUp' : '']"
            :style="{ animationDelay: item.delay || '0' }"
            v-for="item in props.options"
            :key="item.name"
            @click="handleSelect(item)"
          >
            <div class="wrapper-list-item__icon">
              <image :src="item.icon"></image>
            </div>
            <span class="wrapper-list-item__name">{{ item.name }}</span>
          </div>
        </div>
      </div>
    </nut-popup>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ShareSheetOption } from './types'
import type { PropType } from 'vue'
const props = defineProps({
  title: { type: String, default: '' },
  options: { type: Array as PropType<ShareSheetOption[]>, default: [] },
  cancelText: { type: String, default: '取消' }, //取消按钮文字，传入空字符串可以隐藏按钮
  round: { type: Boolean, default: true },
  duration: { type: [Number, String], default: '0.3' },
  wrap: { type: Boolean, default: false },
})

const visible = defineModel('show')
const emits = defineEmits(['select'])

const handleSelect = (item: ShareSheetOption) => {
  emits('select', item)
  visible.value = false
}
</script>

<style lang="scss" scoped>
.wil-share-sheet {
  :deep(.nut-popup) {
    .wil-share-sheet__wrapper {
      width: 100%;
      .wrapper-title {
        padding: 24rpx 32rpx 0 32rpx;
        font-weight: bold;
        color: #222222;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
      }
      .wrapper-list {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        width: 100%;
        overflow-x: auto;
        padding-top: 24rpx;
        padding-bottom: 60rpx;
        scrollbar-width: none;
        -ms-overflow-style: none;

        &::-webkit-scrollbar {
          display: none;
        }
        .wrapper-list-item {
          flex: 0 0 20%;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 24rpx;
          &:nth-child(5n + 1) {
            margin-left: 0;
          }
          &:nth-child(n + 6) {
            margin-top: 24rpx;
          }
          .wrapper-list-item__icon {
            width: 96rpx;
            height: 96rpx;
            image {
              width: 100%;
              height: 100%;
              display: block;
              border-radius: 50%;
            }
          }
          .wrapper-list-item__name {
            font-size: 24rpx;
            color: #646566;
            padding-top: 16rpx;
          }
        }
      }
    }
  }
}
@keyframes fadeInUp {
  0% {
    transform: translateY(200%);
  }
  80% {
    transform: translateY(-40%);
  }
  100% {
    transform: translateY(0);
  }
}
.animate__fadeInUp {
  animation-duration: 0.2s;
  animation-fill-mode: both;
  animation-name: fadeInUp;
  animation-timing-function: ease-out;
}
</style>
