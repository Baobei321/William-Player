<template>
  <div class="login">
    <div class="login-welcome">
      <span>你好，欢迎登录</span>
      <span>William Player</span>
    </div>
    <div class="login-form">
      <nut-tabs v-model="tabValue">
        <nut-tab-pane title="手机登录" pane-key="1">
          <wil-form :options="settings1" :show-button="false" v-model="formData1"> </wil-form>
        </nut-tab-pane>
        <nut-tab-pane title="邮箱登录" pane-key="2">
          <wil-form :options="settings2" :show-button="false" v-model="formData2"> </wil-form>
        </nut-tab-pane>
      </nut-tabs>
    </div>
    <div class="login-button">
      <nut-button custom-color="#ff6701" :loading="loading" :disabled="disabledButton()" @click="handleLogin">登录</nut-button>
    </div>
    <div class="login-policy">
      <div class="login-policy-privacy" @click="changePrivacy">
        <div class="square-unselect" v-if="!checkPolicy"></div>
        <img src="@/static/square-select.png" style="width: 32rpx; height: 32rpx" v-else />
        <div class="login-policy-privacy__text">
          <span>我已阅读并同意</span>
          <span @click.stop="openAgreement">《用户协议》</span>
          <span>和</span>
          <span @click.stop="openPrivacy">《隐私政策》</span>
        </div>
      </div>
      <div class="login-policy-remember" @click="changePassword">
        <div class="square-unselect" v-if="!checkRemember"></div>
        <img src="@/static/square-select.png" style="width: 32rpx; height: 32rpx" v-else />
        <span>记住密码</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue'
import wilForm from '@/components/mobile/wil-form/index.vue'
import { loginByPhone, loginByEmail, getWeUserByopenId } from '@/network/apis'
import { encrypt } from '@/utils/jsencrypt.js'
import { getUserByopenId } from '../../mobile/mine/common'
import * as CONFIG from '@/utils/config'
import { useRouter } from 'vue-router'
import { ipc } from '@/utils/ipcRenderer'
import { ipcApiRoute } from '@/utils/ipcApiRoute'
//todo，需要在此增加游客登录的按钮
const router = useRouter()
const tabValue = ref('1')
const formData1 = ref({})
const formData2 = ref({})
const loading = ref(false)
const checkPolicy = ref(false)
const checkRemember = ref(true)

//手机号校验
const validatorPhone = val => {
  if (!val) {
    return { pass: false, msg: '手机号码不能为空' }
  } else {
    const reg = /^1[3-9][0-9]\d{8}$/ // 手机号正则表达式
    if (!reg.test(val)) {
      return { pass: false, msg: '手机号码格式错误' }
    } else {
      return { pass: true }
    }
  }
}
//校验邮箱
const validatorEmail = val => {
  if (!val) {
    return { pass: false, msg: '邮箱不能为空' }
  } else {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(val)) {
      return { pass: false, msg: '请输入有效的邮箱地址' }
    } else {
      return { pass: true }
    }
  }
}

const settings1 = ref([
  {
    label: '',
    type: 'input',
    prop: 'phone',
    formItemProps: { placeholder: '请输入手机号', type: 'number', inputmode: 'numeric' },
    // rule: [{ validator: validatorPhone }],
  },
  {
    label: '',
    type: 'input',
    prop: 'password',
    formItemProps: { placeholder: '请输入密码', type: 'password' },
    //    rule: [{ required: true, message: '请输入密码' }]
  },
])
const settings2 = ref([
  {
    label: '',
    type: 'input',
    prop: 'email',
    formItemProps: { placeholder: '请输入邮箱', type: 'text', inputmode: 'numeric' },
    // rule: [{ validator: validatorEmail }],
  },
  {
    label: '',
    type: 'input',
    prop: 'password',
    formItemProps: { placeholder: '请输入密码', type: 'password' },
    //   rule: [{ required: true, message: '请输入密码' }]
  },
])

const openAgreement = () => {
  uni.showToast({
    title: '暂无用户协议',
    icon: 'none',
  })
}
const openPrivacy = () => {
  uni.showToast({
    title: '暂无隐私政策',
    icon: 'none',
  })
}

const changePrivacy = () => {
  checkPolicy.value = !checkPolicy.value
}
const changePassword = () => {
  checkRemember.value = !checkRemember.value
}

//判断是否禁用登录按钮
const disabledButton = () => {
  if (tabValue.value === '1') {
    return !formData1.value.phone || !formData1.value.password
  } else if (tabValue.value === '2') {
    return !formData2.value.email || !formData2.value.password
  }
}

//初始化回显账号密码
const initAccount = () => {
  const userPhone = uni.getStorageSync('userPhone')
  if (userPhone && userPhone.phone && userPhone.password) {
    formData1.value.phone = userPhone.phone
    formData1.value.password = userPhone.password
  }
  const userEmail = uni.getStorageSync('userEmail')
  if (userEmail && userEmail.email && userEmail.password) {
    formData2.value.email = userEmail.email
    formData2.value.password = userEmail.password
  }
}

//登录成功之后，放大窗口
const magnifyWindow = async () => {
  ipc.invoke(ipcApiRoute.changeWindowSize, { width: 1358, height: 841 })
}

const handleLogin = async () => {
  if (!checkPolicy.value) {
    uni.showToast({
      title: '请同意用户协议和隐私政策',
      icon: 'none',
    })
    return
  }
  let validate = {}
  switch (tabValue.value) {
    case '1':
      validate = validatorPhone(formData1.value.phone)
      if (!validate.pass) {
        uni.showToast({
          title: validate.msg,
          icon: 'none',
        })
      } else {
        loading.value = true
        try {
          let res = await loginByPhone({ phone: formData1.value.phone, password: encrypt(formData1.value.password) })
          uni.setStorageSync(CONFIG.OPEN_ID, res.openId)
          uni.setStorageSync('Authorization', res.accessToken)
          uni.setStorageSync('refreshToken', res.refreshToken)
          if (checkRemember.value) {
            uni.setStorageSync('userPhone', { phone: formData1.value.phone, password: formData1.value.password })
          } else {
            uni.removeStorageSync('userPhone')
          }
          getUserByopenId()
          loading.value = false
          magnifyWindow()
          router.replace({
            path: '/home',
          })
        } catch (error) {
          loading.value = false
        }
      }
      break
    case '2':
      validate = validatorEmail(formData2.value.email)
      if (!validate.pass) {
        uni.showToast({
          title: validate.msg,
          icon: 'none',
        })
      } else {
        loading.value = true
        try {
          let res = await loginByEmail({ email: formData2.value.email, password: encrypt(formData2.value.password) })
          uni.setStorageSync(CONFIG.OPEN_ID, res.openId)
          uni.setStorageSync('Authorization', res.accessToken)
          uni.setStorageSync('refreshToken', res.refreshToken)
          if (checkRemember.value) {
            uni.setStorageSync('userEmail', { email: formData2.value.email, password: formData2.value.password })
          } else {
            uni.removeStorageSync('userEmail')
          }
          getUserByopenId()
          loading.value = false
          magnifyWindow()
          router.replace({
            path: '/home',
          })
        } catch (error) {
          loading.value = false
        }
      }
      break
    default:
      break
  }
}
initAccount()
</script>

<style lang="scss" scoped>
.login {
  padding: 20rpx 80rpx;
  background: #fff;
  width: 100%;
  height: 100%;
  .login-welcome {
    font-size: 42rpx;
    font-weight: bold;
    color: #262626;
    span {
      display: block;
    }
  }
  .login-form {
    margin-top: 24rpx;
    :deep(.nut-tabs) {
      .nut-tabs__titles {
        height: 92rpx;
        background: transparent;
        .nut-tabs__list {
          justify-content: flex-start;
          .nut-tabs__titles-item {
            flex: 0 0 auto;
            width: auto;
            .nut-tabs__titles-item__line {
              background: #ff6701;
            }
            &:nth-child(2) {
              padding: 0 48rpx;
            }
          }
        }
      }
      .nut-tabs__content {
        .nut-tab-pane {
          padding: 0;
          .base-form {
            background: transparent;
            padding: 0;

            .nut-cell-group {
              .nut-cell-group__wrap {
                background: transparent;
                border-radius: 20rpx;
                padding-top: 20rpx;

                .nut-form-item {
                  padding: 16rpx 28rpx;
                  padding-right: 36rpx;
                  border-radius: 8rpx !important;
                  margin-bottom: 32rpx;
                  align-items: center;
                  border: 3rpx solid #dcdfe6;
                  transition: border 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
                  &::before {
                    display: none;
                  }
                  &::after {
                    display: none;
                  }
                  &:focus-within {
                    // box-shadow: 0 0 0 3rpx #409eff inset;
                    border: 3rpx solid #2a94ff !important;
                  }
                  &:hover {
                    border: 3rpx solid #c0c4cc;
                  }

                  &__label {
                    min-width: 160rpx;

                    &::before {
                      display: none;
                    }
                  }

                  &__body {
                    &__slots {
                      .input-placeholder {
                        color: #a8abb2;
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
        }
      }
    }
  }
  .login-button {
    width: 100%;
    :deep(.nut-button) {
      width: 100%;
      border-radius: 12rpx;
    }
  }
  .login-policy {
    margin-top: 24rpx;
    .login-policy-privacy {
      display: flex;
      align-items: center;
      .square-unselect {
        width: 32rpx;
        height: 32rpx;
        border: 2rpx solid #dcdfe6;
        border-radius: 6rpx;
      }
      :deep(.nut-checkbox) {
        margin-right: 0;
        .nut-checkbox__icon {
        }
        .nut-checkbox__label {
          display: none;
        }
      }
      .login-policy-privacy__text {
        padding-left: 4rpx;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        flex: 1;
        font-size: 26rpx;
        cursor: pointer;

        span {
          color: #86909c;
          font-size: 26rpx;
          &:first-child {
            padding-left: 10rpx;
          }
        }

        span:nth-child(2) {
          color: #1492ff;
        }

        span:nth-child(4) {
          color: #1492ff;
        }
      }
    }
    .login-policy-remember {
      display: flex;
      align-items: center;
      margin-top: 24rpx;
      cursor: pointer;
      .square-unselect {
        width: 32rpx;
        height: 32rpx;
        border: 2rpx solid #dcdfe6;
        border-radius: 6rpx;
      }
      span {
        color: #86909c;
        font-size: 26rpx;
        padding-left: 10rpx;
      }
    }
  }
}
</style>
