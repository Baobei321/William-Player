<template>
  <div class="video-empty">
    <div class="video-empty-logo">
      <image :src="appLogo" />
      <span>William Player</span>
    </div>
    <div class="video-empty-tip">
      <div>从网盘添加资源到媒体库中</div>
      <div>即可打造私人影院，随时观看</div>
    </div>
    <nut-button custom-color="#ffffff" @click="toAddWebdav" :style="{ border: props.isFocus ? '6rpx solid #ff6701 !important' : 'none' }">
      <template #icon>
        <nut-icon name="uploader" custom-color="#000" size="12"></nut-icon>
      </template>
      <span>添加新资源</span>
    </nut-button>
  </div>
</template>

<script setup>
import appLogo from '@/static/app-logo1.png'
import { ref } from 'vue'

const props = defineProps({
  isFocus: { type: Boolean, default: true },
})
const emits = defineEmits(['setFocus', 'changeSetting'])
const openSetting = () => {
  emits('changeSetting', true)
}
const evtMove = keyCode => {
  if (keyCode === 'KeyUp') {
    emits('setFocus', 'tvNavbar', 'KeyUp')
  } else if (keyCode === 'KeyEnter') {
    openSetting()
  }
}

defineExpose({
  evtMove,
})
</script>

<style lang="scss" scoped>
.video-empty {
  width: 100%;
  height: 100%;
  flex: 1;
  position: relative;
  z-index: 1;
  //   background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .video-empty-logo {
    display: flex;
    flex-direction: column;
    align-items: center;

    image {
      width: 140rpx;
      height: 140rpx;
      border-radius: 20rpx;
    }

    span {
      font-size: 36rpx;
      font-weight: bold;
      color: #fff;
      padding-top: 10rpx;
    }
  }

  .video-empty-tip {
    padding: 60rpx 0 40rpx 0;
    text-align: center;
    color: #fff;
  }

  :deep(.nut-button) {
    border-radius: 12rpx;
    color: #000;
    .nut-button__wrap {
      .nut-button__text {
        color: #000;
      }
    }
  }

  // .nut-overlay{
  //   background: transparent;
  // }
  ::v-deep .nut-popup--center {
    background: #315ffd;

    .nut-dialog {
      background: #315ffd;

      .nut-dialog__header {
        color: #fff;
      }

      .nut-dialog__content {
        .nut-input {
          input {
            color: #fff;
          }
        }
      }

      .nut-dialog__footer {
        .nut-dialog__footer-cancel {
          border: none;
          color: #fff;
        }

        .nut-dialog__footer-ok {
          background: #27c530;
        }
      }
    }
  }
}
</style>
