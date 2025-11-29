<template>
    <div class="edit">
        <wil-navbar :title="'编辑' + routerParams.title" :right-show="true">
            <template #right>
                <span style="color: #ff6701;font-weight: 500;" @click="handleSave">保存</span>
            </template>
        </wil-navbar>
        <div class="edit-container">
            <div class="edit-container-name" v-if="routerParams.title === '昵称'">
                <nut-input show-word-limit :max-length="24" v-model="formData.name"></nut-input>
                <div class="edit-container-name__tip">
                    请设置2-24个字符，不包括@/等无效的字符。
                </div>
            </div>
            <div class="edit-container-gender" v-else-if="routerParams.title === '性别'">
                <nut-radio-group v-model="formData.gender" direction="horizontal">
                    <nut-radio label="0" shape="button">男</nut-radio>
                    <nut-radio label="1" shape="button">女</nut-radio>
                    <nut-radio label="2" shape="button">未知</nut-radio>
                </nut-radio-group>
            </div>
            <div class="edit-container-remark" v-else-if="routerParams.title === '简介'">
                <nut-textarea v-model="formData.remark" limit-show :max-length="100" placeholder="请输入简介" />
            </div>
            <div class="edit-container-phonenumber" v-else-if="routerParams.title === '手机号'">
                <wil-form :options="formOptions1" v-model="phoneForm" ref="wil_form">
                    <template #phonenumberOld>
                        <div style="height: 46rpx;line-height: 46rpx;color: #cccccc;">{{ phoneForm.phonenumber }}</div>
                    </template>
                    <template #email>
                        <div style="height: 46rpx;line-height: 46rpx;color: #cccccc;">{{ phoneForm.email }}</div>
                    </template>
                    <template #authCode="item">
                        <div class="authcode">
                            <input v-bind="item" v-model="phoneForm.authCode" :maxlength="6">
                            <span class="authcode-button"
                                :style="{ color: countDown < 61 ? 'rgba(204,204,204,1)' : 'rgb(255, 103, 1)' }"
                                @click="handleSendEmail">{{
                                    countDown > 60 ? '发送验证码' : `${countDown}s后重新发送`
                                }}</span>
                        </div>
                    </template>
                </wil-form>
            </div>
            <div class="edit-container-email" v-else-if="routerParams.title === '邮箱'">
                <wil-form :options="formOptions2" v-model="emailForm" ref="wil_form">
                    <template #emailOld>
                        <div style="height: 46rpx;line-height: 46rpx;color: #cccccc;">{{ emailForm.emailOld }}</div>
                    </template>
                    <template #authCodeOld="item">
                        <div class="authcode">
                            <input v-bind="item" v-model="emailForm.authCodeOld" :maxlength="6">
                            <span class="authcode-button"
                                :style="{ color: countDownOld < 61 ? 'rgba(204,204,204,1)' : 'rgb(255, 103, 1)' }"
                                @click="handleSendOldEmail">{{
                                    countDownOld > 60 ? '发送验证码' : `${countDownOld}s后重新发送`
                                }}</span>
                        </div>
                    </template>
                    <template #authCode="item">
                        <div class="authcode">
                            <input v-bind="item" v-model="emailForm.authCode" :maxlength="6">
                            <span class="authcode-button"
                                :style="{ color: countDown < 61 ? 'rgba(204,204,204,1)' : 'rgb(255, 103, 1)' }"
                                @click="handleSendEmail">{{
                                    countDown > 60 ? '发送验证码' : `${countDown}s后重新发送`
                                }}</span>
                        </div>
                    </template>
                </wil-form>
            </div>
        </div>
    </div>
</template>

<script setup>
import wilNavbar from '@/components/mobile/wil-navbar/index.vue'
import wilForm from '@/components/mobile/wil-form/index.vue'
import { onLoad } from '@dcloudio/uni-app';
import * as CONFIG from '@/utils/config.js'
import { editUserInfo, editUserPhone, editUserEmail } from '@/network/apis.js'
import { toSendEmail } from '@/utils/common.js'
import { ref } from 'vue';
const routerParams = ref({})
const userInfo = ref({})
const countDown = ref(61)//是否展示验证码倒计时,61为不展示
const countDownOld = ref(61) //编辑邮箱的时候使用
const codeEncrypt = ref('')
const codeEncryptOld = ref('') //编辑邮箱的时候使用
userInfo.value = uni.getStorageSync(CONFIG.USER_KEY);
let timer = null
const formData = ref({
    name: userInfo.value.name,
    gender: userInfo.value.gender,
    remark: userInfo.value.remark,
})

//修改电话号的表单
const phoneForm = ref({
    phonenumber: userInfo.value.phonenumber,
    email: userInfo.value.email,
    newPhoneNumber: ''
})

//修改邮箱的表单
const emailForm = ref({
    emailOld: userInfo.value.email,
    email: ''
})

const formOptions1 = [
    { label: "旧手机号", prop: "phonenumberOld", formItemProps: {} },
    { label: "邮箱", prop: "email", formItemProps: {} },
    { label: "新手机号", prop: "newPhoneNumber", type: 'input', formItemProps: { placeholder: "请输入新手机号", type: "text" } },
    { label: "邮箱验证码", prop: "authCode", formItemProps: { placeholder: "请输入验证码", type: "number" } },
]

const formOptions2 = [
    { label: "旧邮箱", prop: "emailOld", formItemProps: {} },
    { label: "新邮箱", prop: "email", type: 'input', formItemProps: { placeholder: "请输入新邮箱", type: "text" } },
    { label: "旧邮箱验证码", prop: "authCodeOld", formItemProps: { placeholder: "请输入验证码", type: "number" } },
    { label: "新邮箱验证码", prop: "authCode", formItemProps: { placeholder: "请输入验证码", type: "number" } },
]

const handleSave = async () => {
    switch (routerParams.value.title) {
        case '昵称':
            let value = formData.value.name.replace(/\s+/g, '')
            if (value.length < 2) {
                uni.showToast({
                    title: '字数不够',
                    icon: 'none'
                })
            } else {
                await editUserInfo({ name: formData.value.name })
                userInfo.value.name = formData.value.name
                uni.setStorageSync(CONFIG.USER_KEY, userInfo.value)
                uni.navigateBack()
            }
            break;
        case '性别':
            await editUserInfo({ gender: formData.value.gender })
            userInfo.value.gender = formData.value.gender
            uni.setStorageSync(CONFIG.USER_KEY, userInfo.value)
            uni.navigateBack()
            break;
        case '简介':
            if (formData.value.remark) {
                await editUserInfo({ remark: formData.value.remark })
                userInfo.value.remark = formData.value.remark
                uni.setStorageSync(CONFIG.USER_KEY, userInfo.value)
                uni.navigateBack()
            } else {
                uni.showToast({
                    title: '请输入简介',
                    icon: 'none'
                })
            }
            break;
        case '手机号':
            if (!phoneForm.value.newPhoneNumber) {
                uni.showToast({
                    title: '手机号码不能为空',
                    icon: 'none'
                })
            } else {
                const reg = /^1[3-9][0-9]\d{8}$/; // 手机号正则表达式
                if (!reg.test(phoneForm.value.newPhoneNumber)) {
                    uni.showToast({
                        title: '手机号码格式错误',
                        icon: 'none'
                    })
                } else {
                    if (phoneForm.value.authCode?.length !== 6) {
                        uni.showToast({
                            title: '验证码为6位',
                            icon: 'none'
                        })
                    } else {
                        await editUserPhone({
                            phonenumber: phoneForm.value.newPhoneNumber,
                            codeEncrypt: codeEncrypt.value,
                            authCode: phoneForm.value.authCode
                        })
                        userInfo.value.phonenumber = phoneForm.value.newPhoneNumber
                        uni.setStorageSync(CONFIG.USER_KEY, userInfo.value)
                        uni.navigateBack()
                    }
                }
            }
            break;
        case '邮箱':
            if (emailForm.value.email) {
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (!emailRegex.test(emailForm.value.email)) {
                    uni.showToast({
                        title: '请输入有效的邮箱地址',
                        icon: 'none'
                    })
                } else {
                    if (emailForm.value.authCode?.length !== 6 || emailForm.value.authCodeOld?.length !== 6) {
                        uni.showToast({
                            title: '验证码为6位',
                            icon: 'none'
                        })
                    } else {
                        await editUserEmail({
                            email: emailForm.value.email,
                            codeEncryptOld: codeEncryptOld.value,
                            authCodeOld: emailForm.value.authCodeOld,
                            codeEncrypt: codeEncrypt.value,
                            authCode: emailForm.value.authCode
                        })
                        userInfo.value.email = emailForm.value.email
                        uni.setStorageSync(CONFIG.USER_KEY, userInfo.value)
                        uni.navigateBack()
                    }
                }
            } else {
                uni.showToast({
                    title: '请输入新的邮箱地址',
                    icon: 'none'
                })
            }
            break;
    }
}
//旧邮箱验证码发送
const handleSendOldEmail = () => {
    toSendEmail(codeEncryptOld, countDownOld, phoneForm.value.emailOld)
}
//发送邮箱验证码
const handleSendEmail = () => {
    toSendEmail(codeEncrypt, countDown, phoneForm.value.email)
}
onLoad((options) => {
    routerParams.value = options
})
</script>

<style lang="scss" scoped>
page {
    width: 100%;
    height: 100%;
}

.edit {
    width: 100%;
    height: 100%;
    background: #f5f5f5;
    display: flex;
    flex-direction: column;
    align-items: center;

    .edit-container {
        flex: 1;
        overflow: auto;
        padding: 0 24rpx;
        width: 100%;
        padding-top: 40rpx;

        .edit-container-name {
            :deep(.nut-input) {
                border-radius: 24rpx;
                border-bottom: none;
                padding-right: 20rpx;
            }

            .edit-container-name__tip {
                font-size: 26rpx;
                color: #949494;
                margin-top: 24rpx;
            }
        }

        .edit-container-gender {
            :deep(.nut-radio-group) {
                .nut-radio {
                    .nut-radio__button {
                        background: #ffffff;
                    }
                }
            }
        }

        .edit-container-remark {
            :deep(.nut-textarea) {
                border-radius: 24rpx;
            }
        }

        .edit-container-phonenumber {
            :deep(.base-form) {
                .base-form-content {
                    .nut-form {
                        .nut-cell-group {
                            .nut-cell-group__wrap {
                                margin-bottom: 0;

                                .nut-form-item {
                                    &:last-child {
                                        padding-bottom: 0;
                                    }

                                    .nut-form-item__label {
                                        min-width: 160rpx;

                                        &::before {
                                            display: none;
                                        }
                                    }

                                    .nut-form-item__body {
                                        .nut-form-item__body__slots {
                                            .authcode {
                                                display: flex;
                                                align-items: center;
                                                width: 100%;

                                                input {
                                                    flex: 1;
                                                }

                                                .authcode-button {
                                                    white-space: nowrap;
                                                    font-size: 14px;
                                                    color: rgb(255, 103, 1);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        .edit-container-email {
            :deep(.base-form) {
                .base-form-content {
                    .nut-form {
                        .nut-cell-group {
                            .nut-cell-group__wrap {
                                margin-bottom: 0;

                                .nut-form-item {
                                    &:last-child {
                                        padding-bottom: 0;
                                    }

                                    .nut-form-item__label {
                                        min-width: 190rpx;

                                        &::before {
                                            display: none;
                                        }
                                    }

                                    .nut-form-item__body {
                                        .nut-form-item__body__slots {
                                            .authcode {
                                                display: flex;
                                                align-items: center;
                                                width: 100%;

                                                input {
                                                    flex: 1;
                                                }

                                                .authcode-button {
                                                    white-space: nowrap;
                                                    font-size: 14px;
                                                    color: rgb(255, 103, 1);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>
