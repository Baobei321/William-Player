<template>
  <div class="register">
    <wil-navbar @getHeight="getHeight"></wil-navbar>
    <div class="register-container">
      <div class="register-title">
        <div class="register-title-top">
          <span>HI</span>
          <div>请注册</div>
        </div>
        <div class="register-title-bottom">欢迎使用William Player</div>
      </div>
      <div class="register-form">
        <wil-form :options="settings" :show-button="false" ref="base_form" v-model="formData">
          <template #authCode="item">
            <div class="authcode">
              <input v-bind="item" v-model="formData.authCode">
              <span class="authcode-button"
                :style="{ color: countDown < 61 ? 'rgba(204,204,204,1)' : 'rgb(255, 103, 1)' }" @click="toSendEmail">{{
                  countDown > 60 ? '发送验证码' : `${countDown}s后重新发送`
                }}</span>
            </div>
          </template>
        </wil-form>
        <div class="register-form-button">
          <nut-button custom-color="#ff6701" @click="confirmCommit" v-if="userAgree">注册并登录</nut-button>
          <nut-button custom-color="#C9CDD4" v-else @click="clickNoAgree" class="no-agree">注册并登录</nut-button>
        </div>
      </div>

      <div class="user-agreement" @click="checkAgree">
        <image :src="checkIcon" v-show="!userAgree" />
        <image :src="checkActiveIcon" v-show="userAgree" />
        <div class="user-agreement-word">
          <span>我已阅读并同意</span>
          <span>《用户协议》</span>
          <span>和</span>
          <span>《隐私政策》</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import wilForm from "@/components/mobile/wil-form/index.vue";
import wilNavbar from "@/components/mobile/wil-navbar/index.vue";
import checkIcon from "@/static/check.png";
import checkActiveIcon from "@/static/check-active.png";
import { registerUser, getWeUserByopenId, loginByPhone, sendEmail } from "@/network/apis";
import * as CONFIG from "@/utils/config";
import { encrypt } from "@/utils/jsencrypt.js";
import { getUserByopenId } from "./common.js";

const codeEncrypt = ref('')
const navbarHeight = ref('')
const countDown = ref(61)//是否展示验证码倒计时,61为不展示
let timer = null
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
//校验验证码
const validatorCode = (val) => {
  return new Promise((resolve, reject) => {
    // 处理未输入的情况
    if (!val) {
      reject("验证码不能为空");
    }
    if (val.length < 6) {
      reject("验证码格式错误：必须为6位纯数字");
    }
    resolve()
  })
}
const settings = ref([
  // { label: "姓名", type: "input", prop: "nickName", formItemProps: { placeholder: "请输入姓名", type: "text" }, rule: [{ required: true, message: "请输入姓名" }] },
  { label: "手机号", type: "input", prop: "phonenumber", formItemProps: { placeholder: "请输入手机号", type: "number" }, rule: [{ validator: validatorPhone }] },
  { label: "账号", type: "input", prop: "userName", formItemProps: { placeholder: "请输入账号", type: "text" }, rule: [{ required: true, message: "请输入账号" }] },
  { label: "密码", type: "input", prop: "password", formItemProps: { placeholder: "请输入密码", type: "password" }, rule: [{ required: true, message: "请输入密码" }] },
  { label: "邮箱", type: "input", prop: "email", formItemProps: { placeholder: "请输入邮箱", type: "text" }, rule: [{ validator: validatorEmail }] },
  { label: "验证码", prop: "authCode", formItemProps: { placeholder: "请输入验证码", type: "number", maxlength: 6 }, rule: [{ validator: validatorCode }] },
]);

const base_form = ref(null);
const formData = ref({});
const userAgree = ref(false);

const checkAgree = () => {
  userAgree.value = !userAgree.value;
};

const confirmCommit = async () => {
  base_form.value.confirmCommit().then(async (valid) => {
    if (valid) {
      try {
        let params = {
          nickName: formData.value.userName, phonenumber: formData.value.phonenumber, userName: formData.value.userName,
          password: encrypt(formData.value.password), email: formData.value.email, codeEncrypt: codeEncrypt.value, authCode: formData.value.authCode
        };
        let res = await registerUser(params);
        uni.setStorageSync(CONFIG.OPEN_ID, res.openId);
        uni.setStorageSync("Authorization", res.accessToken);
        uni.setStorageSync("refreshToken", res.refreshToken);
        getUserByopenId();
        uni.reLaunch({
          url: "/pages/mobile/video/index",
        });
      } catch (error) {
        uni.showToast({
          title: error.msg,
          icon: "none",
        });
      }
    }
  });
};

const getHeight = (val) => {
  navbarHeight.value = val
}

const clickNoAgree = () => {
  uni.showToast({
    title: "请先勾选用户协议",
    icon: "none",
    duration: 2000,
  });
};

//发送邮箱验证码
const toSendEmail = async () => {
  if (countDown.value < 61) return //如果正在倒计时，那么点击不进行任何响应
  if (formData.value.email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.value.email)) {
      uni.showToast({
        title: '请输入有效的邮箱地址',
        icon: 'none'
      })
    } else {
      timer = setInterval(() => {
        countDown.value--
        if (countDown.value === -1) {
          countDown.value = 61
          clearInterval(timer)
          timer = null
        }
      }, 1000);
      let res = await sendEmail({ email: formData.value.email })
      codeEncrypt.value = res.codeEncrypt
    }
  } else {
    uni.showToast({
      title: '请先输入邮箱',
      icon: 'none'
    })
  }
}
// toSendEmail()
</script>

<style lang="scss" scoped>
page {
  width: 100%;
  height: 100%;
}

.register {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #ffd3b1 0%, #fff5ec 50%, #f6f7f8 100%);
  background-size: 100% 100%;

  &-title {
    font-weight: bold;
    // font-size: 48rpx;
    color: #262424;
    margin-bottom: 64rpx;
    padding: 0 48rpx;

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

  .register-container {
    flex: 1;
    padding: 0 0 68rpx 0;
    padding-top: calc(200rpx - v-bind(navbarHeight));
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    // position: relative;

    .register-form {
      flex: 1;
      overflow: auto;
      padding: 0 48rpx;
      padding-bottom: 20rpx;

      :deep(.base-form) {
        padding: 48rpx 40rpx;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 30rpx;

        .nut-cell-group {
          .nut-cell-group__wrap {
            background: transparent;
            border-radius: 20rpx;
            margin-bottom: 0;

            .nut-form-item {
              padding: 28rpx;
              padding-right: 36rpx;
              border-radius: 20rpx !important;
              margin-bottom: 24rpx;
              align-items: center;

              &:last-child {
                margin-bottom: 0;
              }

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

                  .authcode {
                    display: flex;
                    align-items: center;

                    .authcode-button {
                      white-space: nowrap;
                      font-size: 14px;
                      color: rgb(255, 103, 1);
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

        .base-form-bottom {
          margin-top: 100rpx;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-bottom: 0;

          .nut-button {
            width: 100%;
            height: 80rpx;
          }
        }
      }

      .register-form-button {
        margin-top: 100rpx;
        display: flex;
        flex-direction: column;
        align-items: center;

        .nut-button {
          width: 100%;
          height: 80rpx;
        }
      }
    }



    .user-agreement {
      display: flex;
      width: 100%;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      // position: absolute;
      bottom: 68rpx;
      left: 0;
      box-sizing: border-box;

      // padding-bottom: 34px;
      image {
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
          color: #4080ff;
        }

        span:nth-child(4) {
          color: #4080ff;
        }
      }
    }
  }
}

// @media (prefers-color-scheme: dark) {
//   .register {
//     background: #1e1e20;

//     &-title {
//       color: #fff;
//     }

//     ::v-deep .base-form {
//       background: transparent;

//       .nut-cell-group {
//         .nut-cell-group__wrap {
//           .nut-form-item {
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