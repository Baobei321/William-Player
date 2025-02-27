<template>
  <div :class="['wil-modal',animation?'modal-show':'modal-hide']" v-if="show">
    <div class="wil-modal-top">
      <div class="wil-modal-title">{{data.title}}</div>
      <div class="wil-modal-content">{{data.content}}</div>
    </div>
    <div class="wil-modal-button">
      <div class="wil-modal-button__cancel" :style="{color:data.cancelColor}" @click="cancel">{{ data.cancelText }}</div>
      <div class="wil-modal-button__confirm" :style="{color:data.confirmColor}" @click="confirm">{{ data.confirmText }}</div>
    </div>
  </div>
  <div :class="['wil-overlay',animation?'overlay-show':'overlay-hide']" v-if="show"></div>
</template>

<script setup>
import { ref } from 'vue'
const data = ref({
  title: '温馨提示',
  content: '是否退出登录',
  confirmText: '确定',
  confirmColor: '#00B2A0',
  cancelText: '取消',
  cancelColor: '#000',
  confirm: () => { },
  cancel: () => { }
})

const show = ref(false)
const animation = ref(false)

const showModal = (obj) => {
  data.value = { ...data.value, ...obj }
  show.value = true
  animation.value = true
}

const cancel = () => {
  animation.value = false
  data.value.cancel()
  setTimeout(() => {
    show.value = false
  }, 180);
}

const confirm = () => {
  animation.value = false
  data.value.confirm()
  setTimeout(() => {
    show.value = false
  }, 180);
}

defineExpose({
  showModal
})

</script>

<style lang="scss" scoped>
@keyframes opacity1 {
  from {
    opacity: 0;
    position: fixed;
    z-index: 2;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.7);
  }
  to {
    opacity: 1;
    position: fixed;
    z-index: 2;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(1);
  }
}
@keyframes opacity2 {
  from {
    opacity: 1;
    position: fixed;
    z-index: 2;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(1);
  }
  to {
    opacity: 0;
    position: fixed;
    z-index: 2;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.7);
  }
}
@keyframes overlay1 {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes overlay2 {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
.wil-modal {
  border-radius: 30rpx;
  background: #fff;
  position: fixed;
  z-index: 2;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% - 60rpx);
  .wil-modal-top {
    height: 250rpx;
    padding: 56rpx 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    .wil-modal-title {
      font-size: 36rpx;
      color: #000;
      font-weight: bold;
    }
    .wil-modal-content {
      font-size: 34rpx;
      color: #808080;
      margin-top: 25rpx;
      padding: 0 30rpx;
      text-align: center;
    }
  }
  .wil-modal-button {
    border-top: 2rpx solid #e9e9e9;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .wil-modal-button__cancel {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 120rpx;
      border-right: 2rpx solid #e9e9e9;
      border-radius: 0 0 0 30rpx;
      font-size: 32rpx;
      font-weight: bold;
      &:active {
        background: rgba(0, 0, 0, 0.2);
      }
    }
    .wil-modal-button__confirm {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 120rpx;
      border-radius: 0 0 30rpx 0;
      font-size: 32rpx;
      font-weight: bold;
      &:active {
        background: rgba(0, 0, 0, 0.2);
      }
    }
  }
}
.wil-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  background: var(--nut-overlay-bg-color, rgba(0, 0, 0, 0.5));
}
.modal-show {
  animation: opacity1 0.2s ease;
}
.modal-hide {
  animation: opacity2 0.2s ease;
}
.overlay-show {
  animation: overlay1 0.2s ease;
}
.overlay-hide {
  animation: overlay2 0.2s ease;
}
</style>
