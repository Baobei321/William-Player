<template>
  <div class="tv-navbar">
    <div class="tv-navbar-left">
      <div :class="['tv-navbar-left__search', tabIndex === 0 ? 'search-active' : '']">
        <image src="@/static/search-white.png"></image>
        <span>搜索</span>
      </div>
      <div class="tv-navbar-left__tabs">
        <nut-tabs v-model="activeTab" custom-color="#fff" background="transparent">
          <nut-tab-pane :title="item" :pane-key="item" v-for="item in tabsArr" :key="item">
          </nut-tab-pane>
        </nut-tabs>
      </div>
    </div>
    <div class="tv-navbar-right">
      <div :class="['tv-navbar-right__icon', tabIndex === 3 ? 'tv-navbar-right__icon-active' : '']">
        <image class="tv-navbar-right__icon-img" src="@/static/chilun-icon.png"></image>
      </div>
      <span>{{ nowTime }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { dayjs } from "@/uni_modules/iRainna-dayjs/js_sdk/dayjs.min.js";
import { onUnload } from "@dcloudio/uni-app";

const props = defineProps({
  isFocus: { type: Boolean, default: false },
  focusModel: { type: String, default: "" },
});
const emits = defineEmits(["setFocus"]);

const tabsArr = ref(["影视", "直播"]);
const activeTab = ref("影视");
const nowTime = ref("");
const tabIndex = ref(-1)

const timer = ref(null);

const evtMove = (keyCode) => {
  if (keyCode === "KeyRight") {
    if (tabIndex.value != 3) {
      tabIndex.value++;
    }
  } else if (keyCode === "KeyLeft") {
    if (tabIndex.value > 0) {
      tabIndex.value--;
    }
  } else if (keyCode === "KeyDown") {
    emits("setFocus", 'starRecommend', 'KeyDown');
  }
  if (tabIndex.value == 1) {
    activeTab.value = '影视'
  } else if (tabIndex.value == 2) {
    activeTab.value = '直播'
  }
};
const getScrollTop = () => {
  return 0
}
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
watch(
  () => props.isFocus,
  (val) => {
    if (val) {
      tabIndex.value = 0;
    } else {
      tabIndex.value = -1;
    }
  }
);

defineExpose({
  evtMove,
  getScrollTop,
})
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
    align-items: center;

    .tv-navbar-left__search {
      display: flex;
      align-items: center;
      padding: 20rpx 30rpx;
      border-radius: 40rpx;

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

    .search-active {
      background: #2b2b2b;
    }

    .tv-navbar-left__tabs {
      margin-left: 130rpx;

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
      padding: 10rpx;
      border: 4rpx solid transparent;
      display: flex;

      .tv-navbar-right__icon-img {
        width: 50rpx;
        height: 50rpx;
      }
    }

    .tv-navbar-right__icon-active {
      border: 4rpx solid #fff;
      border-radius: 50%;
    }

    span {
      padding-left: 20rpx;
      color: #fff;
      font-weight: bold;
    }
  }
}
</style>
