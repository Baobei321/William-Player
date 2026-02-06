<template>
  <div class="app-wrapper">
    <title-frame></title-frame>
    <div class="app-wrapper-container">
      <side-bar v-if="!route.meta.hideSidebar"></side-bar>
      <div class="app-wrapper-container__right">
        <app-main></app-main>
      </div>
    </div>
  </div>
</template>

<script setup>
import titleFrame from './components/title-frame.vue'
import sideBar from './components/sidebar.vue'
import appMain from './components/app-main.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<style lang="scss">
.app-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: 'MyZiti';
  .app-wrapper-container {
    flex: 1;
    overflow: hidden;
    display: flex;
    .app-wrapper-container__right {
      flex: 1;
      overflow: hidden;
    }
  }
  /* 全局滚动条样式 */
  ::-webkit-scrollbar {
    width: 8px; /* 竖直滚动条宽度 */
    height: 8px; /* 水平滚动条高度 */
  }

  ::-webkit-scrollbar-track {
    background: #ffffff; /* 轨道背景色 */
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: #ffffff; /* 滑块颜色 */
    border-radius: 4px;
    transition: background 0.3s ease; /* 添加颜色过渡效果 */
  }
  :hover::-webkit-scrollbar-thumb {
    background: #c1c1c1; /* 鼠标悬停时的滑块颜色 */
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8; /* 鼠标悬停时的滑块颜色 */
  }

  ::-webkit-scrollbar-thumb:active {
    background: #888888; /* 点击拖动时的滑块颜色 */
  }

  /* (可选) 隐藏滚动条按钮和统一角落样式 */
  ::-webkit-scrollbar-button {
    display: none;
  }
  ::-webkit-scrollbar-corner {
    background: #f1f1f1;
  }
}
.nut-button {
  &::after {
    display: block !important;
    width: 100%;
    height: 100%;
    background: #fff;
    opacity: 0;
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    transform: translate(-50%, -50%);
  }
  &:hover {
    &::after {
      opacity: 0.1;
    }
  }
  &:active {
    &::after {
      opacity: 0;
    }
  }
  &.nut-button--disabled {
    &::after {
      opacity: 0;
    }
  }
}

@font-face {
  font-family: 'MyZiti';
  src: url('../assets/fonts/MyZiti.ttf');
}
</style>
