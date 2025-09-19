<template>
  <div class="wil-navbar" :style="{'height':navBarHeight}">
    <nut-navbar :title="$slots.content?'':props.title" :left-show="props.leftShow" :style="{'--content-height':contentHeight}" @on-click-back="clickBack"
      :title-icon="$slots['title-icon']?true:false">
      <template #leftShow v-if="props.leftShow">
        <nut-icon name="rect-left" :custom-color="props.arrowColor"></nut-icon>
      </template>
      <template #left>
        <slot v-if="$slots.left" name="left"></slot>
      </template>
      <template #content>
        <slot v-if="$slots.content" name="content"></slot>
      </template>
      <template #right>
        <slot v-if="$slots.right" name="right"></slot>
      </template>
      <template #title-icon>
        <slot v-if="$slots['title-icon']" name="title-icon"></slot>
      </template>
    </nut-navbar>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";

const props = defineProps({
  title: { type: String, default: "" },
  leftShow: { type: Boolean, default: process.env.uni_ENV === "alipay" ? false : true },
  arrowColor: { type: String, default: "#000" },
});

const navBarHeight = ref("");
const contentHeight = ref("");

const emits = defineEmits(["clickBack", "getHeight"]);

//计算微信navBar高度
const getNavHeight = () => {
  let sysinfo = uni.getSystemInfoSync(); // 获取设备系统对象
  let statusBarHeight = sysinfo.statusBarHeight; // 获取状态栏高度
  navBarHeight.value = statusBarHeight + 44 + "px"; //计算nav导航栏的高度
  contentHeight.value = "44px";
  emits("getHeight", navBarHeight.value);
};

//计算h5的navBar高度
const getH5NavbarHeight = () => {
  let sysinfo = uni.getSystemInfoSync(); // 获取设备系统对象
  navBarHeight.value = "44px";
  contentHeight.value = "44px";
  emits("getHeight", navBarHeight.value);
};

// #ifdef APP-PLUS
getNavHeight();
// #endif

// #ifdef H5
getH5NavbarHeight();
// #endif

const clickBack = () => {
  uni.navigateBack();
  emits("clickBack");
};
</script>

<style lang="scss" scoped>
.wil-navbar {
  width: 100%;
  position: relative;
  background: transparent;
  z-index: 99;
  top: 0;
  ::v-deep .nut-navbar {
    position: absolute;
    width: 100%;
    bottom: 0;
    left: 0;
    height: var(--content-height);
    background: transparent;
    border: none;
    box-shadow: none;
    margin-bottom: 0;
    .nut-navbar__left {
      position: absolute;
      left: 0;
      .nut-icon-rect-left {
        font-size: 17px;
        width: 17px;
        height: 17px;
      }
    }
    .nut-navbar__title {
      min-width: 60%;
      .title {
        color: #000 !important;
        font-size: 17px;
        font-weight: bold;
      }
    }
    .nut-navbar__right {
      display: none;
    }
  }
}
@media (prefers-color-scheme: dark) {
  .wil-navbar {
    ::v-deep .nut-navbar {
      background-color: #1e1e20;
      .nut-navbar__left {
        .nut-icon-rect-left {
          color: #fff !important;
        }
      }
      .nut-navbar__title {
        min-width: 60%;
        .title {
          color: #fff !important;
          font-size: 17px;
          font-weight: bold;
        }
      }
      .nut-navbar__right {
        display: none;
      }
    }
  }
}
</style>
