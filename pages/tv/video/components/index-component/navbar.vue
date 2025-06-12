<template>
  <div class="tv-navbar">
    <div class="tv-navbar-left">
      <div class="tv-navbar-left__search">
        <image src="@/static/search-white.png"></image>
        <span>搜索</span>
      </div>
      <div class="tv-navbar-left__tabs">
        <nut-tabs v-model="activeTab" custom-color="#fff" background="transparent" @change="changeTvSeason">
          <nut-tab-pane :title="item" :pane-key="item" v-for="item in tabsArr" :key="item">
          </nut-tab-pane>
        </nut-tabs>
      </div>
    </div>
    <div class="tv-navbar-right">
      <image class="tv-navbar-right__icon" src="@/static/chilun-icon.png"></image>
      <span>{{ nowTime }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { dayjs } from "@/uni_modules/iRainna-dayjs/js_sdk/dayjs.min.js";
import { onUnload } from "@dcloudio/uni-app";

const props = defineProps({
  isFocus: { type: Boolean, default: false },
});

const tabsArr = ref(["影视", "直播"]);
const activeTab = ref("影视");
const nowTime = ref("");

const timer = ref(null);

const getNowTime = () => {
  nowTime.value = dayjs().format("HH:mm");
};
getNowTime();
timer.value = setInterval(() => {
  getNowTime();
}, 1000);
onUnload(() => {
  clearInterval(timer.value);
  timer.value = null;
});
</script>

<style lang="scss" scoped>
.tv-navbar {
  padding: 40rpx 80rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  width: 100%;
  z-index: 1000;
  box-sizing: border-box;
  .tv-navbar-left {
    display: flex;
    .tv-navbar-left__search {
      display: flex;
      align-items: center;
      image {
        width: 35rpx;
        height: 35rpx;
      }
      span {
        color: #fff;
        font-size: 28rpx;
        padding-left: 14rpx;
      }
    }
    .tv-navbar-left__tabs {
      margin-left: 150rpx;
      ::v-deep .nut-tabs {
        .nut-tabs__titles {
          .nut-tabs__list {
            .nut-tabs__titles-item {
              .nut-tabs__titles-item__text {
                color: #d3d3d3;
              }
              .nut-tabs__titles-item__line {
                height: 4rpx;
              }
            }
            .nut-tabs-active {
              .nut-tabs__titles-item__text {
                color: #fff;
                font-weight: normal;
              }
            }
          }
        }
        .nut-tabs__content {
          display: none;
        }
      }
    }
  }
  .tv-navbar-right {
    display: flex;
    align-items: center;
    .tv-navbar-right__icon {
      width: 50rpx;
      height: 50rpx;
    }
    span {
      padding-left: 30rpx;
      color: #fff;
      font-weight: bold;
    }
  }
}
</style>
