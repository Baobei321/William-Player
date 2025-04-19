<template>
  <view class="about-version">
    <div class="about-version-container">
      <div class="about-version-container__main">
        <image src="../../static/app-logo1.png" @click="toLogin"></image>
        <div class="main-name">
          <span>William Player</span>
          <span>{{ appVersion }}</span>
        </div>
        <div class="main-time">2025-04-18</div>
      </div>
      <nut-cell title="自动检查更新" :desc="status[0]" :is-link="true" @click="showPopover = true"></nut-cell>
    </div>
    <div class="about-version-button">
      <nut-button :disabled="isLoading" custom-color="#ff6701" @click="checkUpdate" v-if="showButton">
        <template #icon>
          <nut-icon name="refresh2" class="nut-icon-am-rotate nut-icon-am-infinite" v-if="isLoading"></nut-icon>
        </template>
        检查更新
      </nut-button>
      <nut-button disabled custom-color="#dedde3" v-else>当前已是最新版本</nut-button>
    </div>
    <nut-popup v-model:visible="showPopover" round position="bottom" safe-area-inset-bottom>
      <nut-picker v-model="status" :columns="popoverList" title="" @confirm="confirm" @cancel="showPopover = false" />
    </nut-popup>
    <wil-upgrade :updateFunction="backInfo" :logo="upgradeInfo.logo" :app-name=upgradeInfo.appName :appVersion="appVersion" @closed="closedPopup"
      v-model:visible="showUpgrade">
    </wil-upgrade>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import wilUpgrade from "@/components/wil-upgrade/index.vue";
import { getUntokenDicts } from "../../network/apis";
import appLogo from "../../static/app-logo1.png";
import * as CONFIG from "@/utils/config";

const url = ref("");

const status = ref(["总是"]);
const showPopover = ref(false);
const popoverList = ref([
  { text: "总是", value: "总是" },
  { text: "每天", value: "每天" },
  { text: "每周", value: "每周" },
  { text: "从不", value: "从不" },
]);
const isLoading = ref(false);
const showButton = ref(true);
const showUpgrade = ref(false);
const versionData = ref({});

const appVersion = ref(CONFIG.VERSIOIN);

let num = 0;

const upgradeInfo = ref({
  logo: appLogo,
  appName: "William Player",
});

const checkUpdate = async () => {
  isLoading.value = true;
  await getAppUpdateInfo();
};

const confirm = ({ selectedValue, selectedOptions }) => {
  uni.setStorageSync("remindTime", { type: selectedValue[0] });
  showPopover.value = false;
};
const toLogin = () => {
  if (num == 5) {
    uni.removeStorageSync(CONFIG.USER_ID);
    uni.removeStorageSync(CONFIG.OPEN_ID);
    uni.removeStorageSync(CONFIG.USER_KEY);
    uni.removeStorageSync("Authorization");
    uni.reLaunch({
      url: "/pages/mine/login",
    });
  } else {
    num++;
  }
};

const compareVersions = (newBb, oldBb) => {
  const v1 = newBb.split(".").map(Number); // 将版本号拆分成数字
  const v2 = oldBb.split(".").map(Number); // 同样拆分另一个版本号

  for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
    // 如果 v1 的当前部分小于 v2 对应的部分，返回 -1
    if ((v1[i] || 0) < (v2[i] || 0)) {
      return -1;
    }
    // 如果 v1 的当前部分大于 v2 对应的部分，返回 1
    if ((v1[i] || 0) > (v2[i] || 0)) {
      return 1;
    }
  }

  return 0; // 如果两个版本号完全相同，返回 0
};

const getAppUpdateInfo = async () => {
  let res = await getUntokenDicts("app_version");
  isLoading.value = false;
  let newVersion = res.data[res.data.length - 1];
  versionData.value = res;
  if (compareVersions(newVersion.dictLabel, appVersion.value) == 1) {
    //此时后台设置已有新版本
    showUpgrade.value = true;
  } else {
    showButton.value = false;
  }
};

const backInfo = async () => {
  return versionData.value;
};

const closedPopup = () => {
  showUpgrade.value = false;
};

onLoad((options) => {
  status.value = uni.getStorageSync("remindTime").type ? [uni.getStorageSync("remindTime").type] : ["总是"];
  url.value = decodeURIComponent(options.url);
});
</script>

<style lang="scss">
page {
  width: 100%;
  height: 100%;
}

.about-version {
  width: 100%;
  height: 100%;
  background: #f6f7f8;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  padding-top: 350rpx;
  position: relative;

  .about-version-container {
    width: 100%;

    .about-version-container__main {
      display: flex;
      flex-direction: column;
      align-items: center;

      image {
        width: 240rpx;
        height: 240rpx;
        border-radius: 60rpx;
      }

      .main-name {
        margin-top: 40rpx;
        position: relative;

        span:first-child {
          font-weight: bold;
          font-size: 36rpx;
          color: #000;
        }

        span:last-child {
          position: absolute;
          display: block;
          background: #cc1118;
          color: #fff;
          border-radius: 20rpx;
          padding: 4rpx 8rpx;
          font-size: 28rpx;
          top: -20rpx;
          right: 0;
          transform: translateX(100%);
        }
      }
      .main-time {
        font-size: 28rpx;
        margin-top: 20rpx;
      }
    }

    ::v-deep .nut-popover-wrapper {
      width: 100%;
    }

    ::v-deep .nut-cell {
      width: 100%;
      background: transparent;
      box-shadow: none;
      margin-top: 72rpx;

      .nut-cell__title {
        font-size: 32rpx;
        color: #000;
      }

      .nut-cell__value {
        font-size: 32rpx;
        color: #000;
      }

      .nut-cell__link {
        display: none;
      }
    }
  }

  .about-version-button {
    position: absolute;
    bottom: 50rpx;

    ::v-deep .nut-button {
      .nut-button__wrap {
        flex-direction: row-reverse;

        .nut-button__text {
          margin-left: 0;
        }

        .nut-icon {
          margin-left: 10rpx;
        }
      }
    }
  }
}
</style>