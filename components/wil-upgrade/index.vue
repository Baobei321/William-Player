<template>
  <div class="wil-upgrade">
    <nut-popup v-model:visible="showBottom" round position="bottom" :custom-style="{ height: '45%' }" @closed="closedPopup" @open="open" @close="close">
      <div class="wil-upgrade-container">
        <div class="wil-upgrade-title">
          <div class="wil-upgrade-title__logo">
            <image :src="props.logo"></image>
          </div>
          <div class="wil-upgrade-title__info">
            <div class="wil-upgrade-title__info-name">{{ props.appName }}</div>
            <div class="wil-upgrade-title__info-time">{{ newVersion[props.defaultProps.updateTime] }}</div>
          </div>
        </div>
        <div class="wil-upgrade-list">
          <div class="wil-upgrade-list__title">
            <span>发现新版本</span><span>{{ newVersion[props.defaultProps.version] }}</span>
          </div>
          <div class="wil-upgrade-list__container">
            {{ newVersion[props.defaultProps.remark] }}
          </div>
        </div>
        <div class="wil-upgrade-button">
          <nut-button custom-color="#ff6701" @click="toDownLoad(newVersion[props.defaultProps.apkUrl])" v-if="!showProgress && downStatus == -1">立即下载更新</nut-button>
          <nut-button custom-color="#ff6701" @click="showBottom = false" v-if="!showProgress && downStatus == 0">安装失败，关闭</nut-button>
          <nut-button custom-color="#ff6701" @click="installNow" v-if="!showProgress && downStatus == 1">立即安装</nut-button>
          <nut-button custom-color="#ff6701" @click="downloadInstallApp(newVersion[props.defaultProps.apkUrl])"
            v-if="!showProgress && downStatus == 2">下载中断，继续下载</nut-button>
          <template v-if="showProgress">
            <nut-progress :percentage="percent" stroke-color="#ff6701" text-color="#000" />
            <div class="wil-upgrade-button__tip">{{ tipText }}</div>
          </template>

        </div>
      </div>
    </nut-popup>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, watch } from "vue";
import { onHide } from "@dcloudio/uni-app";

const props = defineProps({
  type: { type: String, default: "outApp" }, //inApp是在应用内更新，outApp是跳转到外部浏览器下载安装包更新
  logo: { type: String, default: "" },
  appName: { type: String, default: "" },
  appVersion: { type: String, default: "" },
  updateFunction: { type: Function },
  visible: { type: Boolean, default: false },
  enableControl: { type: Boolean, default: false },
  defaultProps: {
    type: Object,
    default: {
      updateTime: "cssClass",
      version: "dictLabel",
      remark: "remark",
      apkUrl: "dictValue",
    },
  },
});
const showBottom = ref(false);
const newVersion = ref({});
const tipText = ref("等待下载");
const percent = ref(0); //下载进度
const showProgress = ref(false);

const downStatus = ref(-1); //下载状态,-1是初始化，0是下载失败，1是下载成功
const systemUrl = ref("");
const dFileName = ref("");
const dTask = ref(null);
const downloadedSize = ref(0);

const emits = defineEmits(["closed", "update:visible"]);

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

const judegeShow = () => {
  let remindTime = uni.getStorageSync("remindTime");
  let mapping = {
    "每天": 86400000,
    "每周": 604800000,
  };
  if (remindTime.lastTime) {
    if (Date.now() - remindTime.lastTime > mapping[remindTime.type]) {
      showBottom.value = true;
      uni.setStorageSync("remindTime", { type: remindTime.type, lastTime: Date.now() });
    }
  } else {
    showBottom.value = true;
    uni.setStorageSync("remindTime", { type: remindTime.type, lastTime: Date.now() });
  }
};

const getUpdateInfo = async () => {
  // if (systemInfo.platform != 'android') return
  let res = await props.updateFunction();
  newVersion.value = res.data[res.data.length - 1];
  let version = props.appVersion;
  if (compareVersions(newVersion.value.dictLabel, version) == 1) {
    //此时后台设置已有新版本
    if (props.enableControl) {
      let remindTime = uni.getStorageSync("remindTime");
      if (!remindTime) {
        remindTime = { type: "总是", lastTime: null };
        uni.setStorageSync("remindTime", remindTime);
      }
      if (remindTime.type == "总是") {
        showBottom.value = true;
      } else if (remindTime.type == "每天") {
        judegeShow();
      } else if (remindTime.type == "每周") {
        judegeShow();
      } else if (remindTime.type == "从不") {
      } else {
        showBottom.value = true;
      }
    } else {
      showBottom.value = true;
    }
  }
};

const installNow = () => {
  plus.runtime.install(systemUrl.value, {}, {}, function (error) {
    uni.showToast({
      title: "安装失败",
      icon: "none",
    });
  });
};

const toDownLoad = (apkUrl) => {
  if (props.type == "inApp") {
    downloadInstallApp(apkUrl);
  } else if (props.type == "outApp") {
    plus.runtime.openURL(apkUrl, (error) => {
      if (error) {
        uni.showToast({ title: "打开浏览器失败", icon: "none" });
      }
    });
  }
};

// 下载更新
const downloadInstallApp = (apkUrl) => {
  showProgress.value = true;
  let dtask = plus.downloader.createDownload(apkUrl, { filename: "_downloads/" }, function (d, status) {
    // 下载完成
    if (status == 200) {
      downStatus.value = 1;
      showProgress.value = false;
      systemUrl.value = plus.io.convertLocalFileSystemURL(d.filename);
      dFileName.value = d.filename;
      plus.runtime.install(plus.io.convertLocalFileSystemURL(d.filename), {}, {}, function (error) {
        uni.showToast({
          title: "安装失败",
          icon: "none",
          duration: 7000,
        });
      });
    } else {
      uni.showToast({
        title: "更新失败",
        icon: "none",
      });
      downStatus.value = 0;
      showProgress.value = false;
    }
  });
  dTask.value = dtask;
  downloadProgress(dtask);
};
// 下载进度
const downloadProgress = (dtask) => {
  try {
    dtask.start(); //开启下载任务
    uni.showToast({
      title: "开始下载",
      icon: "none",
    });
    dtask.addEventListener("statechanged", function (task, status) {
      // 给下载任务设置监听
      switch (task.state) {
        case 1:
          tipText.value = "等待下载";
          break;
        case 2:
          tipText.value = "已连接到服务器";
          break;
        case 3:
          downloadedSize.value = task.downloadedSize;
          percent.value = parseInt((parseFloat(task.downloadedSize) / parseFloat(task.totalSize)) * 100);
          tipText.value = "安装包下载中，请稍后（" + handleSize(task.downloadedSize) + "/" + handleSize(task.totalSize) + "）";
          break;
        case 4:
          // 下载完成
          plus.nativeUI.closeWaiting();
          break;
      }
    });
  } catch (e) {
    plus.nativeUI.closeWaiting();
    downStatus.value = 0;
    showProgress.value = false;
    uni.showToast({
      title: "更新失败",
      icon: "none",
    });
  }
};
//处理内存大小
const handleSize = (size) => {
  if (size == 0) return "0";
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(size) / Math.log(1024));
  const formatted = parseFloat((size / Math.pow(1024, i)).toFixed(2));
  return formatted + " " + sizes[i];
};

const closedPopup = () => {
  if (dFileName.value) {
    plus.io.resolveLocalFileSystemURL(
      dFileName.value,
      function (entry) {
        entry.remove(
          function () {
            dFileName.value = "";
            systemUrl.value = "";
          },
          function (e) {
            // console.log('删除文件失败: ' + e.message);
          }
        );
      },
      function (e) {
        // console.log('无法解析文件路径: ' + e.message);
      }
    );
    plus.downloader.clear();
  }
  emits("closed");
};

const open = () => {
  emits("update:visible", true);
};

const close = () => {
  emits("update:visible", false);
};

closedPopup();

onBeforeMount(() => {
  downloadedSize.value = +uni.getStorageSync("downloadedSize");
  if (downloadedSize.value > 0) {
    downStatus.value = 2;
  }
});

watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (!props.enableControl) {
        getUpdateInfo();
      }
    } else {
      if (props.enableControl) {
        getUpdateInfo();
      }
    }
    showBottom.value = val;
  },
  { immediate: true }
);

onHide(() => {
  uni.setStorageSync("downloadedSize", downloadedSize.value);
  if (downStatus.value != 1) {
    if (props.type == "inApp") {
      dTask.value.abort();
    }
  }
});
</script>


<style lang="scss" scoped>
.wil-upgrade {
  .wil-upgrade-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;
    padding-bottom: 24rpx;

    .wil-upgrade-title {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-top: 20rpx;

      &__logo {
        width: 100rpx;
        height: 100rpx;
        // border: 2rpx solid rgb(181, 181, 181);
        // border-radius: 20rpx;
        box-sizing: border-box;

        image {
          width: 100%;
          height: 100%;
          // border-radius: 20rpx;
        }
      }

      &__info {
        &-name {
          font-size: 32rpx;
        }

        &-version {
          color: #555555;
          font-size: 24rpx;
        }

        &-time {
          color: #555555;
          font-size: 24rpx;
        }
      }
    }

    .wil-upgrade-list {
      flex: 1;
      overflow: hidden;
      width: 100%;
      box-sizing: border-box;
      padding-top: 24rpx;
      display: flex;
      flex-direction: column;

      &__title {
        font-size: 36rpx;
        font-weight: bold;
        padding-left: 36rpx;
        padding-bottom: 24rpx;

        span:last-child {
          padding-left: 15rpx;
        }
      }

      &__container {
        padding: 0 60rpx;
        white-space: pre-line;
        overflow: auto;
        flex: 1;
        width: 100%;
        box-sizing: border-box;
      }
    }

    .wil-upgrade-button {
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 0 60rpx;
      box-sizing: border-box;
      padding-top: 24rpx;
      // height: 150px;

      ::v-deep .nut-button {
        width: 100%;
        border: none;
      }

      .wil-upgrade-button__tip {
        padding-top: 10rpx;
        font-size: 28rpx;
        color: #000;
      }
    }
  }
}
</style>