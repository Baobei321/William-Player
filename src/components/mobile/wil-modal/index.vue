<template>
  <nut-transition :show="show" name="fade" :duration="200" style="position: fixed;z-index: 9999;">
    <div :class="['wil-modal']">
      <div :class="['wil-modal-top',$slots.default?'':'wil-modal-height']">
        <div class="wil-modal-title">{{data.title}}</div>
        <slot v-if="$slots.default"></slot>
        <div class="wil-modal-content" v-else>{{data.content}}</div>
      </div>
      <div class="wil-modal-button">
        <div class="wil-modal-button__cancel" :style="{color:theme=='light'?data.cancelColor:'#fff'}" @click="cancel">{{ data.cancelText }}</div>
        <div class="wil-modal-button__confirm" :style="{color:data.confirmColor}" @click="confirm">{{ data.confirmText }}</div>
      </div>
    </div>
    <div :class="['wil-overlay']"></div>
  </nut-transition>
</template>

<script setup>
import { ref, nextTick } from "vue";

const props = defineProps({
  title: { type: String, default: "温馨提示" },
  content: { type: String, default: "是否退出登录" },
  confirmText: { type: String, default: "确定" },
  confirmColor: { type: String, default: "#00B2A0" },
  cancelText: { type: String, default: "取消" },
  cancelColor: { type: String, default: "#000" },
  confirm: { type: Function, default: () => {} },
  cancel: { type: Function, default: () => {} },
});

const theme = ref(uni.getSystemInfoSync().theme);

const data = ref({}); //由于app端无法引入这个方法使用，所以还是使用组件的形式

const show = ref(false);
const changeTheme = () => {
  theme.value = uni.getSystemInfoSync().theme;
};
const showModal = (obj) => {
  data.value = { ...data.value, ...props, ...obj };
  show.value = true;
  uni.onThemeChange(changeTheme);
};

const cancel = () => {
  show.value = false;
  uni.offThemeChange(changeTheme);
  setTimeout(() => {
    data.value.cancel();
  }, 200);
};

const confirm = () => {
  show.value = false;
  uni.offThemeChange(changeTheme);
  setTimeout(() => {
    data.value.confirm();
  }, 200);
};
defineExpose({
  showModal,
});
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
  z-index: 9999;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% - 60rpx);
  .wil-modal-top {
    // height: 250rpx;
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
  .wil-modal-height {
    height: 250rpx;
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
  z-index: 9998;
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
@media (prefers-color-scheme: dark) {
  .wil-modal {
    background: #2f2f2f;
    .wil-modal-top {
      .wil-modal-title {
        color: #fff;
      }
      .wil-modal-content {
        color: #fff;
      }
    }
    .wil-modal-button {
      border-top: 2rpx solid rgb(73, 73, 73);
      .wil-modal-button__cancel {
        border-right: 2rpx solid rgb(73, 73, 73);
        color: #fff;
        &:active {
          background: rgba(0, 0, 0, 0.1);
        }
      }
      .wil-modal-button__confirm {
        &:active {
          background: rgba(0, 0, 0, 0.1);
        }
      }
    }
  }
}
</style>
