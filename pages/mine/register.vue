<template>
  <div class="register">
    <wil-navbar></wil-navbar>
    <div class="register-container">
      <div class="register-title">用户注册登录</div>
      <wil-form :options="settings" :show-button="true" ref="base_form" v-model="formData">
        <template #bottom>
          <nut-button custom-color="#ff6701" @click="confirmCommit" v-if="userAgree">注册并登录</nut-button>
          <nut-button custom-color="#C9CDD4" v-else @click="clickNoAgree">注册并登录</nut-button>
        </template>
      </wil-form>
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
import wilForm from "@/components/wil-form/index.vue";
import wilNavbar from "@/components/wil-navbar/index.vue";
import checkIcon from "../../static/check.png";
import checkActiveIcon from "../../static/check-active.png";
import { registerUser, getWeUserByopenId, loginByPhone } from "../../network/apis";
import * as CONFIG from "../../utils/config";
import { encrypt } from "../../utils/jsencrypt.js";

//手机号校验
const validatorPhone = (val) => {
  if (!val) {
    return false;
  } else {
    const reg = /^1[3-9][0-9]\d{8}$/; // 手机号正则表达式
    if (!reg.test(val)) {
      return false;
    } else {
      return true;
    }
  }
};
const settings = ref([
  { label: "姓名", type: "input", prop: "nickName", formItemProps: { placeholder: "请输入姓名", type: "text" }, rule: [{ required: true, message: "请输入姓名" }] },
  { label: "手机号", type: "input", prop: "phonenumber", formItemProps: { placeholder: "请输入手机号", type: "number" }, rule: [{ validator: validatorPhone, message: "请输入正确的手机号" }] },
  { label: "账号", type: "input", prop: "userName", formItemProps: { placeholder: "请输入账号", type: "text" }, rule: [{ required: true, message: "请输入账号" }] },
  { label: "密码", type: "input", prop: "password", formItemProps: { placeholder: "请输入密码", type: "password" }, rule: [{ required: true, message: "请输入密码" }] },
]);

const base_form = ref(null);
const formData = ref({});
const userAgree = ref(false);

const checkAgree = () => {
  userAgree.value = !userAgree.value;
};
const getUserByopenId = async () => {
  let res = await getWeUserByopenId({ openId: uni.getStorageSync(CONFIG.OPEN_ID) });
  uni.setStorageSync(CONFIG.USER_ID, res.data.userId);
  uni.setStorageSync(CONFIG.USER_KEY, { roleKey: res.data.roleKey, avatar: res.data.avatar, ...res.data.wuser });
  uni.setStorageSync("Authorization", res.data.token);
  uni.setStorageSync("tmdbKey", res.data.wuser.tmdbKey);
};
const confirmCommit = async () => {
  base_form.value.confirmCommit().then(async (valid) => {
    if (valid) {
      try {
        let params = { nickName: formData.value.nickName, phonenumber: formData.value.phonenumber, userName: formData.value.userName, password: encrypt(formData.value.password) };
        let res = await registerUser(params);
        uni.setStorageSync(CONFIG.OPEN_ID, res.openId);
        getUserByopenId();
        uni.reLaunch({
          url: "/pages/video/index",
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
.register {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #ffd3b1 0%, #fff5ec 30%, #f6f7f8 70%);
  background-size: 100% 100%;
  &-title {
    font-weight: bold;
    font-size: 48rpx;
    color: #262424;
    margin-bottom: 64rpx;
  }
  .register-container {
    flex: 1;
    overflow: hidden;
    padding: 120rpx 48rpx 68rpx 48rpx;
    box-sizing: border-box;
    position: relative;
  }
  ::v-deep .base-form {
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
    .base-form-bottom {
      margin-top: 166rpx;
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
    position: absolute;
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
</style>
  