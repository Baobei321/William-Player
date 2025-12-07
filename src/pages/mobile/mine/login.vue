<template>
  <div class="login">
    <div class="login-title">
      <div class="login-title-top">
        <span>HI</span>
        <div>请登录</div>
      </div>
      <div class="login-title-bottom">欢迎使用William Player</div>
    </div>
    <div class="login-tabs">
      <nut-tabs v-model="tabValue" @change="changeTabs">
        <nut-tab-pane title="手机登录" pane-key="1">
          <base-form :options="settings1" :show-button="false" ref="base_form1" v-model="formData1">
          </base-form>
          <div class="forget" @click="toForget">忘记密码?</div>
        </nut-tab-pane>
        <nut-tab-pane title="邮箱登录" pane-key="2">
          <base-form :options="settings2" :show-button="false" ref="base_form2" v-model="formData2">
          </base-form>
          <div class="forget" @click="toForget">忘记密码?</div>
        </nut-tab-pane>
      </nut-tabs>
    </div>
    <div class="login-button">
      <nut-button custom-color="#ff6701" @click="confirmCommit" v-if="userAgree">登录</nut-button>
      <nut-button custom-color="#C9CDD4" v-else @click="clickNoAgree" class="no-agree">登录</nut-button>
      <div class="register-button">
        <div @click="touristEnter">游客进入</div>
        <div class="register-button-line"></div>
        <div @click="toRegister">注册</div>
      </div>
    </div>
    <div class="user-agreement" @click="checkAgree">
      <image :src="checkIcon" v-show="!userAgree" class="user-agreement-icon" />
      <image :src="checkActiveIcon" v-show="userAgree" class="user-agreement-icon" />
      <div class="user-agreement-word">
        <span>我已阅读并同意</span>
        <span>《用户协议》</span>
        <span>和</span>
        <span>《隐私政策》</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import baseForm from "@/components/mobile/wil-form/index.vue";
import checkIcon from "@/static/check.png";
import checkActiveIcon from "@/static/check-active.png";
import { loginByPhone, loginByEmail, getWeUserByopenId } from "@/network/apis";
import { encrypt } from "@/utils/jsencrypt.js";
import * as CONFIG from "@/utils/config";
import { getUserByopenId } from "./common.js";
import tabsLeft from '@/static/tabs-left.png'
import tabsRight from '@/static/tabs-right.png'

const tabValue = ref('1')

const tabBg = computed(() => {
  if (tabValue.value === '1') {
    return `url(${tabsLeft})`
  } else {
    return `url(${tabsRight})`
  }
})

//手机号校验
const validatorPhone = (val) => {
  return new Promise((resolve, reject) => {
    if (!val) {
      reject('手机号码不能为空')
    } else {
      const reg = /^1[3-9][0-9]\d{8}$/; // 手机号正则表达式
      if (!reg.test(val)) {
        reject('手机号码格式错误')
      } else {
        resolve(); // 所有验证都通过
      }
    }
  })
};
//校验邮箱
const validatorEmail = (val) => {
  return new Promise((resolve, reject) => {
    if (!val) {
      reject('邮箱不能为空')
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(val)) {
        reject('请输入有效的邮箱地址')
      } else {
        resolve(); // 所有验证都通过
      }
    }
  })
};
const settings1 = ref([
  { label: "手机号", type: "input", prop: "phone", formItemProps: { placeholder: "请输入手机号", type: "number", inputmode: "numeric" }, rule: [{ validator: validatorPhone }] },
  { label: "密码", type: "input", prop: "password", formItemProps: { placeholder: "请输入密码", type: "password" }, rule: [{ required: true, message: "请输入密码" }] },
]);
const settings2 = ref([
  { label: "邮箱", type: "input", prop: "email", formItemProps: { placeholder: "请输入邮箱", type: "text", inputmode: "numeric" }, rule: [{ validator: validatorEmail }] },
  { label: "密码", type: "input", prop: "password", formItemProps: { placeholder: "请输入密码", type: "password" }, rule: [{ required: true, message: "请输入密码" }] },
]);

const base_form1 = ref(null);
const base_form2 = ref(null);
const formData1 = ref({});
const formData2 = ref({});
const userAgree = ref(false);

const checkAgree = () => {
  userAgree.value = !userAgree.value;
};

const changeTabs=(obj)=>{
  if(obj.paneKey==='1'){
    formData2.value = {}
    base_form2.value.formRef.reset()
  }else if(obj.paneKey==='2'){
    formData1.value = {}
    base_form1.value.formRef.reset()
  }
}

const confirmCommit = async () => {
  if (tabValue.value === '1') {//手机号登录
    base_form1.value.confirmCommit().then(async (valid) => {
      if (valid) {
        let res = await loginByPhone({ phone: formData1.value.phone, password: encrypt(formData1.value.password) });
        uni.setStorageSync(CONFIG.OPEN_ID, res.openId);
        uni.setStorageSync("Authorization", res.accessToken);
        uni.setStorageSync("refreshToken", res.refreshToken);
        getUserByopenId();
        uni.reLaunch({
          url: "/pages/mobile/video/index",
        });
      }
    });
  } else if (tabValue.value === '2') {//邮箱登录
    base_form2.value.confirmCommit().then(async (valid) => {
      if (valid) {
        let res = await loginByEmail({ email: formData2.value.email, password: encrypt(formData2.value.password) });
        uni.setStorageSync(CONFIG.OPEN_ID, res.openId);
        uni.setStorageSync("Authorization", res.accessToken);
        uni.setStorageSync("refreshToken", res.refreshToken);
        getUserByopenId();
        uni.reLaunch({
          url: "/pages/mobile/video/index",
        });
      }
    });
  }
};

const touristEnter = async () => {
  await loginByPhone({ phone: "19994658532", password: encrypt("123456789") })
    .then((res) => {
      uni.setStorageSync(CONFIG.OPEN_ID, res.openId);
      uni.setStorageSync("Authorization", res.accessToken);
      uni.setStorageSync("refreshToken", res.refreshToken);
      getUserByopenId();
      uni.reLaunch({
        url: "/pages/mobile/video/index",
      });
    })
    .catch((error) => {
      uni.reLaunch({
        url: "/pages/mobile/video/index",
      });
      let settingData = uni.getStorageSync("settingData");
      if (settingData) {
        settingData.tmdbKey = "9e0add7c02b66868ab0a368df820a335";
        uni.setStorageSync("settingData", settingData);
      } else {
        uni.setStorageSync("settingData", { tmdbKey: res.data.wuser.tmdbKey, showProgress: true, playercodec: "exoplayer", showRecommend: true });
      }
    });
};

const toForget = () => {
  uni.navigateTo({
    url: "/pages/mobile/mine/forget",
  });
}

const toRegister = () => {
  uni.navigateTo({
    url: "/pages/mobile/mine/register",
  });
};

const clickNoAgree = () => {
  uni.showToast({
    title: "请先勾选用户协议",
    icon: "none",
    duration: 2000,
  });
};
</script>

<style lang="scss" scoped>
page {
  width: 100%;
  height: 100%;
}

.login {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  // background: url("https://storage.7x24cc.com/storage-server/presigned/ss1/a6-online-fileupload/newMediaImage/4844737_427A_bg_20250211152611234newMediaImage.png")
  //   center no-repeat;
  background: linear-gradient(180deg, #ffd3b1 0%, #fff5ec 50%, #f6f7f8 70%);
  background-size: 100% 100%;
  padding: 200rpx 48rpx 68rpx 48rpx;
  position: relative;

  &-title {
    font-weight: bold;
    // font-size: 48rpx;
    color: #262424;
    margin-bottom: 64rpx;

    &-top {
      display: flex;
      align-items: center;

      span {
        font-size: 72rpx;
        color: #fff;
      }

      div {
        width: 160rpx;
        height: 80rpx;
        background: url('@/static/zk-qp.png') center no-repeat;
        background-size: 100% 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32rpx;
        color: #fff;
        padding-left: 14rpx;
      }
    }

    &-bottom {
      font-size: 48rpx;
      color: #FFFFFF;
      margin-top: 18rpx;
    }
  }

  &-tabs {
    :deep(.nut-tabs) {
      .nut-tabs__titles {
        background: v-bind(tabBg) center no-repeat;
        background-size: 100% 100%;
      }

      .nut-tabs__content {
        background: transparent;

        .nut-tab-pane {
          background: rgba(255, 255, 255, 0.6);
          border-radius: 0 0 30rpx 30rpx;
          padding: 48rpx 40rpx;
          padding-bottom: 32rpx;

          .base-form {
            background: transparent;
            padding: 0;

            .nut-cell-group {
              .nut-cell-group__wrap {
                background: transparent;
                border-radius: 20rpx;

                .nut-form-item {
                  padding: 28rpx;
                  padding-right: 36rpx;
                  border-radius: 20rpx !important;
                  margin-bottom: 24rpx;
                  align-items: center;

                  &__label {
                    min-width: 160rpx;

                    &::before {
                      display: none;
                    }
                  }

                  &__body {
                    &__slots {
                      .nut-input {
                        &-value {
                          .nut-input-inner {
                            .nut-input-right-box {
                              img {
                                height: 50rpx;
                                width: 150rpx;
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }

                .remember-password {
                  display: flex;
                  align-items: center;
                  justify-content: flex-start;

                  span {
                    color: #353a45;
                    font-size: 28rpx;
                    padding-left: 20rpx;
                  }
                }
              }
            }
          }

          .forget {
            font-size: 26rpx;
            color: #1492FF;
            text-align: right;
          }
        }
      }
    }
  }

  &-button {
    margin-top: 100rpx;
    display: flex;
    flex-direction: column;
    align-items: center;

    .register-button {
      font-size: 28rpx;
      color: #1492FF;
      display: inline;
      margin-top: 30rpx;
      display: flex;
      align-items: center;

      .register-button-line {
        width: 2rpx;
        height: 34rpx;
        margin: 0 24rpx;
        background: #1492FF;
      }
    }

    .nut-button {
      width: 100%;
      height: 80rpx;
    }
  }

  .user-agreement {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    position: absolute;
    bottom: 68rpx;
    left: 0;
    box-sizing: border-box;

    // padding-bottom: 68rpx;
    .user-agreement-icon {
      width: 28rpx;
      height: 28rpx;
      display: block;
    }

    &-word {
      padding-left: 4rpx;
      display: flex;
      align-items: center;

      span {
        display: inline;
        color: #86909c;
        font-size: 26rpx;
      }

      span:nth-child(2) {
        color: #1492FF;
      }

      span:nth-child(4) {
        color: #1492FF;
      }
    }
  }
}

// @media (prefers-color-scheme: dark) {
//   .login {
//     background: #1e1e20;
//     &-title {
//       color: #fff;
//     }
//     ::v-deep .base-form {
//       background: transparent;
//       padding: 0;
//       .nut-cell-group {
//         .nut-cell-group__wrap {
//           background: transparent;
//           .nut-form-item {
//             align-items: center;
//             &::after {
//               display: none;
//             }
//           }
//         }
//       }
//       .base-form-bottom {
//         .no-agree {
//           background: gray !important;
//         }
//       }
//     }
//   }
// }</style>
