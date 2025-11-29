<template>
    <div class="forget">
        <wil-navbar @getHeight="getHeight"></wil-navbar>
        <div class="forget-title">
            <div class="forget-title-top">
                <span>HI</span>
                <div>修改密码</div>
            </div>
            <div class="forget-title-bottom">欢迎使用William Player</div>
        </div>
        <div class="forget-form">
            <base-form :options="settings" ref="base_form" v-model="formData">
                <template #authCode="item">
                    <div class="authcode">
                        <input v-bind="item" v-model="formData.authCode" :maxlength="6">
                        <span class="authcode-button"
                            :style="{ color: countDown < 61 ? 'rgba(204,204,204,1)' : 'rgb(255, 103, 1)' }"
                            @click="toSendEmail">{{
                                countDown > 60 ? '发送验证码' : `${countDown}s后重新发送`
                            }}</span>
                    </div>
                </template>
            </base-form>
        </div>
        <div class="forget-button">
            <nut-button custom-color="#ff6701" @click="confirmEdit">确认修改</nut-button>
        </div>
    </div>
</template>

<script setup>
import baseForm from "@/components/mobile/wil-form/index.vue";
import wilNavbar from "@/components/mobile/wil-navbar/index.vue"
import { ref } from "vue";
import { sendEmail, editPwd } from "@/network/apis";

const navbarHeight = ref('')
const countDown = ref(61)//是否展示验证码倒计时,61为不展示
let timer = null
const formData = ref({})
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
const settings = ref([
    { label: "手机号", type: "input", prop: "phone", formItemProps: { placeholder: "请输入手机号", type: "number", inputmode: "numeric" }, rule: [{ validator: validatorPhone }] },
    { label: "邮箱", type: "input", prop: "email", formItemProps: { placeholder: "请输入邮箱", type: "text" }, rule: [{ validator: validatorEmail }] },
    { label: "新密码", type: "input", prop: "password", formItemProps: { placeholder: "请输入新密码", type: "password" }, rule: [{ required: true, message: "请输入新密码" }] },
    { label: "验证码", prop: "authCode", formItemProps: { placeholder: "请输入验证码", type: "number" }, rule: [{ required: true, message: "请输入验证码" }] },
]);

const getHeight = (val) => {
    navbarHeight.value = val
}

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
            let res = await sendEmail({ email: formData.value.email, type: 'editPwd' })
            timer = setInterval(() => {
                countDown.value--
                if (countDown.value === -1) {
                    countDown.value = 61
                    clearInterval(timer)
                    timer = null
                }
            }, 1000);
            codeEncrypt.value = res.codeEncrypt
        }
    } else {
        uni.showToast({
            title: '请先输入邮箱',
            icon: 'none'
        })
    }
}

const confirmEdit = async () => {
    await editPwd(formData.value)
    uni.navigateBack()
}
</script>

<style lang="scss" scoped>
page {
    width: 100%;
    height: 100%;
}

.forget {
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
        padding-top: calc(200rpx - v-bind(navbarHeight));

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
                font-size: 28rpx;
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

    &-form {
        padding: 0 48rpx;

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
    }

    &-button {
        margin-top: 100rpx;
        padding: 0 48rpx;
        padding-bottom: 68rpx;

        :deep(.nut-button) {
            width: 100%;
            height: 80rpx;
        }
    }
}
</style>
