<template>
  <div class="mine">
    <wil-navbar title="我的" :leftShow="false">
      <template #right>
        <nut-icon name="scan" custom-color="#ff6701" size="16" @click="openUrl"></nut-icon>
      </template>
    </wil-navbar>
    <div class="mine-container">
      <div class="mine-notLog" v-if="!isLogin">
        <div class="mine-notLog__left">
          <img
            src="https://storage.7x24cc.com/storage-server/presigned/ss1/a6-online-fileupload/newMediaImage/2AFA742_427A_user-avatar_20241225150546694newMediaImage.png">
          <span>游客用户</span>
        </div>
        <nut-button custom-color="#ff6701" class="mine-notLog__right" @click="toLogin">去登录</nut-button>
      </div>
      <div class="mine-loged" v-else>
        <div class="mine-loged__left">
          <div class="left-img">
            <img
              :src="userInfo.avatar||'https://storage.7x24cc.com/storage-server/presigned/ss1/a6-online-fileupload/newMediaImage/2AFA742_427A_user-avatar_20241225150546694newMediaImage.png'">
          </div>
          <div class="left-info">
            <div class="left-info-name">
              <span>{{ userInfo.name }}</span>
            </div>
            <div class="left-info-phone">{{ userInfo.phonenumber }}</div>
          </div>
        </div>
      </div>
      <div class="mine-cell">
        <base-cell :options="item" v-for="(item, index) in cellOptions" :key="index" @click-item="clickCell" @toLogin="openLoginPopup"></base-cell>
        <base-cell :options="[{ title: '退出登录', leftIcon: logOut }]" @click-item="clickCell" v-if="Authorization&&userInfo.phonenumber != '19994658532'"></base-cell>
      </div>
    </div>
    <wil-modal ref="wil_modal"></wil-modal>
  </div>
</template>

<script setup>
import { ref } from "vue";
import baseCell from "../../components/wil-cell/index.vue";
import wilNavbar from "../../components/wil-navbar";
import userImg from "../../static/user-img.png";
import * as CONFIG from "../../utils/config";
import logOut from "../../static/log-out.png";
import iconMedia from "../../static/icon-media.png";
import iconTb from "../../static/icon-tb.png";
import iconDownload from "../../static/icon-download.png";
import iconDeepseek from "../../static/icon-deepseek.png";
import iconFeedback from "../../static/icon-feedback.png";
import iconGift from "../../static/icon-gift.png";
import iconSetting from "../../static/icon-setting.png";
import iconAbout from "../../static/icon-about.png";
import { onShow } from "@dcloudio/uni-app";
import { toParse, toStringfy } from "./common";
import showModal from "@/components/wil-modal/index.js";
import wilModal from "@/components/wil-modal/modal.vue";
// const { getUntokenDict } = useDict()

const userInfo = ref(uni.getStorageSync(CONFIG.USER_KEY));
const Authorization = ref(uni.getStorageSync("Authorization"));
const isLogin = ref(false);

const showLoginPopup = ref(false);
const wil_modal = ref(null);

const cellOptions = ref([
  [
    // { title: '报账信息', leftIcon: cellClock, path: '/pages/account-information/list' },
    // { title: '快递查询', leftIcon: cellClock, path: '/account-information/express-search' },
    {
      title: "媒体库列表",
      leftIcon: iconMedia,
      path: "/pages/video/list",
    },
    {
      title: "数据同步",
      leftIcon: iconTb,
      // path: "/pages/backend/data-sync",
      path: null,
      tip: "敬请期待...",
    },
    {
      title: "下载管理",
      leftIcon: iconDownload,
      path: null,
      tip: "敬请期待...",
    },
    {
      title: "深度求索",
      leftIcon: iconDeepseek,
      path: "/pages/backend/index",
      query: {
        url: "https://yuanbao.tencent.com",
        title: "腾讯元宝",
      },
    },
  ],
  [
    {
      title: "问题与反馈",
      leftIcon: iconFeedback,
      // path: null,
      // outside: true,
      // outsideUrl: "https://gitee.com/CWLcwl0219/William-Player/issues",
      path: "/pages/backend/index",
      query: {
        url: "https://chenweiliang6.github.io/app-webview",
        title: "问题与反馈",
      },
    },
    {
      title: "赞赏",
      leftIcon: iconGift,
      path: "/pages/backend/appreciate",
    },
    {
      title: "设置",
      leftIcon: iconSetting,
      path: "/pages/mine/settings",
    },
    {
      title: "关于",
      leftIcon: iconAbout,
      path: "/pages/backend/about-version",
    },
  ],
]);

const openUrl = () => {
  uni.scanCode({
    success: async (res) => {
      if (res.result.startsWith("http://") || res.result.startsWith("https://")) {
        uni.navigateTo({
          url: `/pages/backend/index?url=${res.result}`,
        });
      } else {
        uni.showToast({
          title: "不是网页地址，无法打开",
          icon: "none",
        });
      }
    },
  });
};

//退出登录
const toLogout = () => {
  wil_modal.value.showModal({
    title: "温馨提示",
    content: "是否退出登录",
    confirmColor: "#ff6701",
    confirm: async () => {
      uni.removeStorageSync(CONFIG.USER_ID);
      uni.removeStorageSync(CONFIG.OPEN_ID);
      uni.removeStorageSync(CONFIG.USER_KEY);
      uni.removeStorageSync("Authorization");
      uni.reLaunch({
        url: "/pages/mine/login",
      });
    },
  });
};

//判断是否为登录状态
const judgeLogin = () => {
  userInfo.value = uni.getStorageSync(CONFIG.USER_KEY);
  Authorization.value = uni.getStorageSync("Authorization");
  if (Authorization.value) {
    isLogin.value = userInfo.value.phonenumber == "19994658532" ? false : true;
  } else {
    isLogin.value = false;
  }
};

const clickCell = (item) => {
  if (item.title == "退出登录") {
    toLogout();
  }
  if (item.tip) {
    uni.showToast({
      title: item.tip,
      icon: "none",
    });
  }
  if (item.outside) {
    plus.runtime.openURL(item.outsideUrl, (error) => {
      if (error) {
        uni.showToast({ title: "打开浏览器失败", icon: "none" });
      }
    });
  }
};

const toLogin = () => {
  uni.removeStorageSync(CONFIG.USER_ID);
  uni.removeStorageSync(CONFIG.OPEN_ID);
  uni.removeStorageSync(CONFIG.USER_KEY);
  uni.removeStorageSync("Authorization");
  uni.reLaunch({
    url: "/pages/mine/login",
  });
};

const openLoginPopup = (item) => {
  const whiteList = ["后台管理", "壁纸"];
  if (whiteList.indexOf(item.title) > -1) {
    uni.navigateTo({
      url: item.path + "?" + toStringfy(item.query),
    });
    return;
  }
  showLoginPopup.value = true;
};

const dada1 = ref("");

onShow(() => {
  judgeLogin();
});
</script>

<style lang="scss">
page {
  width: 100%;
  height: 100%;
}

.mine {
  width: 100%;
  height: 100%;
  // background: url("https://storage.7x24cc.com/storage-server/presigned/ss1/a6-online-fileupload/newMediaImage/4844737_427A_bg_20250211152611234newMediaImage.png")
  //   center no-repeat;
  background: linear-gradient(180deg, #ffd3b1 0%, #fff5ec 30%, #f6f7f8 70%);
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  box-sizing: border-box;
  ::v-deep .wil-navbar {
    .nut-navbar {
      .nut-navbar__right {
        display: block;
        position: absolute;
        right: 0;
      }
    }
  }

  &-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0 24rpx;
    overflow: auto;
  }

  &-notLog {
    padding: 24rpx 30rpx 24rpx 24rpx;
    background-color: #fff;
    border-radius: 16rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    // margin-top: 34rpx;
    margin-top: 0;

    &__left {
      display: flex;
      align-items: center;

      img {
        width: 136rpx;
        height: 136rpx;
      }

      span {
        padding-left: 24rpx;
        font-size: 32rpx;
        color: #353a45;
        font-weight: bold;
      }
    }

    &__right {
      height: 32px;
      // padding: 0 17.5px;
    }
  }

  &-loged {
    padding: 24rpx 44rpx 24rpx 24rpx;
    background-color: #fff;
    border-radius: 16rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    // margin-top: 34rpx;
    margin-top: 0;
    &__left {
      display: flex;
      align-items: center;

      .left-img {
        width: 136rpx;
        height: 136rpx;

        img {
          border-radius: 50%;
          width: 100%;
          height: 100%;
        }
      }

      .left-info {
        padding-left: 24rpx;

        .left-info-name {
          font-weight: bold;
          font-size: 32rpx;
          color: #353a45;
          display: flex;
          align-items: center;

          .auth-status {
            padding: 8rpx 20rpx;
            font-size: 26rpx;
            border-radius: 8rpx;
            font-weight: 400;
            margin-left: 20rpx;
          }

          .noAuth {
            border: 2rpx solid #ff3838;
            color: #ff3838;
          }

          .isAuth {
            border: 2rpx solid #ff6701;
            color: #ff6701;
          }
        }

        .left-info-phone {
          font-size: 28rpx;
          color: #86909c;
          margin-top: 6rpx;
        }
      }
    }

    &__right {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 136rpx;
      height: 48rpx;
      background: linear-gradient(180deg, #ffae35 0%, #ff9900 100%);
      border-radius: 80rpx;

      img {
        width: 28rpx;
        height: 28rpx;
      }

      span {
        font-size: 24rpx;
        color: #ffffff;
        margin-left: 16rpx;
      }
    }
  }
}
</style>