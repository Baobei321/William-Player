<template>
    <div class="userInfo">
        <div class="userInfo-avatar">
            <wil-uploader @success="uploadSuccess">
                <image
                    :src="userInfo.avatar || 'https://storage.7x24cc.com/storage-server/presigned/ss1/a6-online-fileupload/newMediaImage/2AFA742_427A_user-avatar_20241225150546694newMediaImage.png'">
                </image>
            </wil-uploader>
        </div>
        <div class="userInfo-cell">
            <wil-cell :options="options1" @clickItem="clickItem">
                <template #icon="item">
                    {{ item.title }}
                </template>
                <template #title="item">
                    <span :style="{ color: item.value ? '#353a45' : '#bbbbbb' }">{{ item.value || item.placeholder
                        }}</span>
                </template>
            </wil-cell>
            <wil-cell :options="options2" @clickItem="clickItem">
                <template #icon="item">
                    {{ item.title }}
                </template>
                <template #title="item">
                    <span :style="{ color: item.value ? '#353a45' : '#bbbbbb' }">{{ item.value || item.placeholder
                        }}</span>
                </template>
            </wil-cell>
            <wil-cell :options="options3" @clickItem="clickItem">
                <template #icon="item">
                    {{ item.title }}
                </template>
                <template #title="item">
                    <span :style="{ color: item.value ? '#353a45' : '#bbbbbb' }">{{ item.value || item.placeholder
                        }}</span>
                </template>
            </wil-cell>
        </div>
    </div>
</template>

<script setup>
import wilUploader from '@/components/mobile/wil-uploader/index.vue'
import wilCell from '@/components/mobile/wil-cell/index.vue'
import * as CONFIG from '@/utils/config.js'
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';

const userInfo = ref({})
const genderDict = {
    '0': '男',
    '1': '女',
    '2': '未知'
}
const options1 = computed(() => [
    {
        title: "用户ID",
        path: null,
        tip: '无法修改用户ID',
        value: uni.getStorageSync(CONFIG.USER_ID),
    },
    {
        title: "昵称",
        path: null,
        value: userInfo.value.name
    },
    {
        title: "性别",
        path: null,
        value: genderDict[userInfo.value.gender]
    },

])
const options2 = computed(() => [
    {
        title: "简介",
        path: null,
        value: userInfo.value.remark,
        placeholder: '介绍一下自己'
    },
])
const options3 = computed(() => [
    {
        title: "账号",
        path: null,
        tip: '无法修改账号',
        value: userInfo.value.userName
    },
    {
        title: "手机号",
        path: null,
        value: userInfo.value.phonenumber
    },
    {
        title: "邮箱",
        path: null,
        value: userInfo.value.email,
        placeholder: '请绑定邮箱'
    },
    {
        title: "Tmdb密钥",
        path: null,
        tip: '无法修改Tmbd密钥',
        value: userInfo.value.tmdbKey
    },
])
const uploadSuccess = (event) => {
    userInfo.value.avatar = event.data.url
    uni.setStorageSync(CONFIG.USER_KEY, userInfo.value)
}

const clickItem = (item) => {
    if (item.tip) {
        uni.showToast({
            title: item.tip,
            icon: "none",
        });
    } else {
        uni.navigateTo({
            url: `/pages/mobile/mine/userInfo/edit?title=${item.title}`
        })
    }
}

onShow(() => {
    userInfo.value = uni.getStorageSync(CONFIG.USER_KEY);

})

</script>

<style lang="scss" scoped>
page {
    width: 100%;
    height: 100%;
}

.userInfo {
    width: 100%;
    height: 100%;
    background: #f5f5f5;
    padding: 0 24rpx;
    display: flex;
    flex-direction: column;
    align-items: center;

    .userInfo-avatar {
        width: 150rpx;
        height: 150rpx;
        margin: 32rpx 0;

        image {
            width: 150rpx;
            height: 150rpx;
            border-radius: 50%;
            display: block;
        }
    }

    .userInfo-cell {
        width: 100%;

        :deep(.wil-cell) {
            margin-top: 24rpx;

            .nut-cell-group__wrap {
                .nut-cell {
                    .nut-cell__icon {
                        flex: 0 0 200rpx;
                        margin-right: 0;
                        color: #949494;
                        font-weight: 500;
                    }

                    .nut-cell__title {
                        flex: 1;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        display: block;
                        font-weight: 500;
                    }
                }
            }
        }
    }
}
</style>
