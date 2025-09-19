<template>
  <div class="video">
    <!-- <div style="background: #efefef;width: 375px;height: 812px;"></div> -->
    <video-navbar @refresh="refreshVideo" @pause="pauseRefresh" :refreshData="refreshData" :loading="refreshLoading"
      ref="video_navbar" :tmdbKey1="tmdbKey" class="navbar-transparent"></video-navbar>
    <Skeleton v-if="refreshLoading"></Skeleton>
    <template v-else>
      <div class="video-container"
        v-if="selectType.type == 'Emby' ? embyMovieTvList?.length : (localMovieTvData?.movie?.length || localMovieTvData?.tv?.length)">
        <scroll-view :scroll-y="true" class="video-container-scroll">
          <template v-if="selectType.type != 'Emby'">
            <star-recommend v-if="settingData.showRecommend"></star-recommend>
            <div class="scroll-list">
              <recent-played v-if="historyPlay.length" :listData="historyPlay"
                :isConnected="isConnected"></recent-played>
              <hx-list title="电影" :listData="localMovieTvData?.movie" v-if="localMovieTvData?.movie?.length"
                :isConnected="isConnected"></hx-list>
              <hx-list title="电视剧" :listData="localMovieTvData?.tv" v-if="localMovieTvData?.tv?.length"
                :isConnected="isConnected"></hx-list>
              <Classify :isConnected="isConnected"></Classify>
            </div>
          </template>
          <!-- emby专用的首页 -->
          <emby-home v-else></emby-home>
        </scroll-view>
      </div>
      <div class="video-empty"
        v-if="selectType.type == 'Emby' ? !embyMovieTvList?.length : (!localMovieTvData?.movie?.length && !localMovieTvData?.tv?.length)">
        <div class="video-empty-logo">
          <image :src="appLogo" />
          <span>William Player</span>
        </div>
        <div class="video-empty-tip">
          <div>从网盘添加资源到媒体库中</div>
          <div>即可打造私人影院，随时观看</div>
        </div>
        <nut-button custom-color="#090909" @click="toAddWebdav">
          <template #icon>
            <nut-icon name="uploader" custom-color="#fff" size="12"></nut-icon>
          </template>
          <span>添加新资源</span>
        </nut-button>
        <nut-dialog title="api_key" v-model:visible="showDialog" @cancel="onCancel" @ok="onOk">
          <nut-input v-model="tmdbKey" placeholder="请输入tmdb的api_key" />
        </nut-dialog>
      </div>
    </template>
    <wil-upgrade :updateFunction="getAppUpdateInfo" :logo="upgradeInfo.logo" :app-name=upgradeInfo.appName
      :enableControl="true" :appVersion="CONFIG.VERSIOIN">
    </wil-upgrade>
    <wil-modal ref="wil_modal"></wil-modal>
    <share-dialog v-model:visible="showShareModal" :shareUrl="shareUrl"></share-dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";
import videoNavbar from "./components/index-component/navbar.vue";
import Skeleton from "./components/index-component/skeleton.vue";
import starRecommend from "./components/index-component/star-recommend.vue";
import recentPlayed from "./components/index-component/recent-played.vue";
import hxList from "./components/index-component/hx-list.vue";
import Classify from "./components/index-component/classify.vue";
import wilUpgrade from "@/components/mobile/wil-upgrade/index.vue";
import wilModal from "@/components/mobile/wil-modal/index.vue";
import shareDialog from "./components/index-component/share-dialog.vue";
import embyHome from "./components/index-component/emby-home.vue";
import { setTmdbKey, getUntokenDicts } from "@/network/apis";
import { getCutContent } from "@/utils/common";
import appLogo from "@/static/app-logo1.png";
import { onShow, onUnload } from "@dcloudio/uni-app";
import * as CONFIG from "@/utils/config";
import { useVideoIndex } from "@/hooks/useVideoIndex.js";

const wil_modal = ref(null)
const { video_navbar, refreshData, refreshLoading, movieTvData, localMovieTvData, tmdbKey, historyPlay, settingData, selectType, refreshVideo } = useVideoIndex({ wil_modal });
const showDialog = ref(false);
const showShareModal = ref(false);
const shareUrl = ref("");

const upgradeInfo = ref({
  logo: appLogo,
  appName: "William Player",
});

const isConnected = ref(false); //手机是否连接网络

const embyMovieTvList = ref(uni.getStorageSync('embyMovieTvList'))

const pauseRefresh = () => {
  refreshData.value = { found: 0, toupdate: 0, updated: 0, success: 0, fail: 0 };
  movieTvData.value = { movie: [], tv: [] };
  localMovieTvData.value.tv = [];
  localMovieTvData.value.movie = [];
  uni.setStorageSync("localMovieTvData", localMovieTvData.value);
  refreshLoading.value = false;
};

const toAddWebdav = () => {
  uni.navigateTo({
    url: "/pages/mobile/source/source-list",
  });
};

const onCancel = () => {
  showDialog.value = false;
  tmdbKey.value = "";
};

const onOk = async () => {
  showDialog.value = false;
  let settingData = uni.getStorageSync("settingData");
  if (settingData) {
    settingData.tmdbKey = tmdbKey.value;
    uni.setStorageSync("settingData", settingData);
  } else {
    uni.setStorageSync("settingData", { tmdbKey: tmdbKey.value, showProgress: true });
  }
  await setTmdbKey({ tmdbKey: tmdbKey.value });
  video_navbar.value.showProgress();
};

//获取应用更新信息
const getAppUpdateInfo = async () => {
  let res = await getUntokenDicts("app_version");
  return res;
};
onShow(async () => {
  let shareUrl1 = await getCutContent();
  if (shareUrl1) {
    shareUrl.value = shareUrl1;
    showShareModal.value = true;
  }
});

const listenerNetwork = (res) => {
  isConnected.value = res.isConnected;
};
uni.getNetworkType({
  success: (res) => {
    if (res.networkType != "none") {
      isConnected.value = true;
    } else {
      isConnected.value = false;
    }
  },
});
uni.onNetworkStatusChange(listenerNetwork);
onUnload(() => {
  uni.offNetworkStatusChange(listenerNetwork);
});
</script>

<style lang="scss" scoped>
page {
  width: 100%;
  height: 100%;
}

.video {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f6f7f8;
  box-sizing: border-box;

  .video-container {
    flex: 1;
    overflow: hidden;
    // padding: 0 12px;
    width: 100%;
    box-sizing: border-box;
    position: relative;
    z-index: 1;

    .video-container-scroll {
      width: 100%;
      height: 100%;

      .scroll-list {
        padding: 40rpx 24rpx;
        box-sizing: border-box;

        .hxList:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  .video-empty {
    width: 100%;
    flex: 1;
    position: relative;
    z-index: 1;
    background: #fff;
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
        color: #000;
        padding-top: 10rpx;
      }
    }

    .video-empty-tip {
      padding: 60rpx 0 40rpx 0;
      text-align: center;
      color: #000;
    }

    ::v-deep .nut-button {
      border-radius: 12rpx;
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
              color: #000;
            }
          }
        }

        .nut-dialog__footer {
          .nut-dialog__footer-cancel {
            border: none;
            color: #000;
          }

          .nut-dialog__footer-ok {
            background: #27c530;
          }
        }
      }
    }
  }
}

// @media (prefers-color-scheme: dark) {
//   .video {
//     background: #1e1e20;

//     .video-empty {
//       background: #1e1e20;

//       .video-empty-logo {
//         span {
//           color: #fff;
//         }
//       }

//       .video-empty-tip {
//         color: #fff;
//       }

//       ::v-deep .nut-button {
//         background-color: #fff !important;

//         .nut-button__wrap {
//           .nut-icon-uploader {
//             color: #000 !important;
//           }

//           .nut-button__text {
//             color: #000 !important;
//           }
//         }

//         &::before {
//           background-color: #fff !important;
//         }
//       }
//     }
//   }
// }
</style>
