<template>
  <!-- 此为electron的标题组件，用户隐藏放大和关闭还有拖拽的功能 -->
  <div class="title-frame">
    <div class="title-frame-logo">
      <img src="@/static/app-logo1.png" />
      <span>William Player</span>
    </div>
    <div class="title-frame-button">
      <div class="title-frame-button__hide" @click="windowAction('window-minimize')">
        <wil-svg iconClass="hide-window" color="#9B9B9B"></wil-svg>
      </div>
      <div class="title-frame-button__size" @click="windowAction('window-maximize')" v-if="!notShowSize.includes(route.path)">
        <wil-svg iconClass="min-window" color="#9B9B9B" v-if="isMaxWindow"></wil-svg>
        <wil-svg iconClass="max-window" color="#9B9B9B" v-else></wil-svg>
      </div>
      <div class="title-frame-button__close" @click="windowAction('window-close')">
        <wil-svg iconClass="close-window" color="#9B9B9B"></wil-svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import wilSvg from '@/components/electron/wil-svg/index.vue'
import { ipc } from '@/utils/ipcRenderer'
import { ipcApiRoute } from '@/utils/ipcApiRoute'
import { useRoute } from 'vue-router'

const route = useRoute()
const isMaxWindow = ref(false) //是否最大化

const notShowSize = ['/login', '/entry'] //不显示放大按钮的路由

const windowAction = action => {
  if (action === 'window-maximize') {
    isMaxWindow.value = !isMaxWindow.value
  }
  ipc.invoke(ipcApiRoute.windowAction, { action })
}
</script>

<style lang="scss" scoped>
.title-frame {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  -webkit-app-region: drag;
  .title-frame-logo {
    display: flex;
    align-items: center;

    img {
      display: block;
      width: 60rpx;
      height: 60rpx;
    }
    span {
      font-size: 36rpx;
      font-weight: bold;
      padding-left: 8rpx;
    }
  }
  .title-frame-button {
    display: flex;
    align-items: center;
    -webkit-app-region: no-drag;
    &__hide,
    &__size,
    &__close {
      //   width: 52rpx;
      //   height: 52rpx;
      padding: 6rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6rpx;
      cursor: pointer;
      margin-left: 6rpx;
      &:hover {
        background: #e0e0e0;
      }
      :deep(.svg-icon) {
        display: block;
        width: 30rpx;
        height: 30rpx;
      }
    }
    &__close {
      &:hover {
        background: #ff4b49;
        :deep(.svg-icon) {
          use {
            fill: #fff;
          }
        }
      }
    }
  }
}
</style>
