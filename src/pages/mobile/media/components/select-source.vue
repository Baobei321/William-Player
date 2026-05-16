<template>
    <div :class="['select-source', themeClass]">
        <div class="select-source-title">选择资源</div>
        <div class="select-source-container" v-if="show">
            <div class="select-source-item" v-for="item in sourceList" :key="item.type">
                <template v-if="item.list.length">
                    <div class="select-source-item__title">{{ item.type }}</div>
                    <div class="select-source-item__list">
                        <div :class="['list-item', item.list.length == 1 ? 'list-one' : '']" v-for="vitem in item.list"
                            :key="vitem.name" @click="handleSelect(item, vitem)">
                            <div class="list-item-img">
                                <image :src="item.img"></image>
                            </div>
                            <div class="list-item-name">{{ vitem.name }}</div>
                        </div>
                    </div>
                </template>
            </div>
        </div>
        <div class="select-source-empty" v-else>
            <image src="@/static/no-data.png" class="select-source-empty__img"></image>
            <nut-button :custom-color="primaryBtnColor" @click="toAddFile">
                <template #icon>
                    <nut-icon name="uploader" :custom-color="primaryBtnTextColor" size="12"></nut-icon>
                </template>
                <span :style="{ color: primaryBtnTextColor }">添加新资源</span>
            </nut-button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { loginUser, get189Folder, getQuarkFolder } from "@/utils/common";
import { useThemeColors } from '@/hooks/useThemeColors'
import { useThemeClass } from '@/hooks/useThemeClass'

const emits = defineEmits(['openFolder'])
const themeClass = useThemeClass()
const { primaryBtnColor, primaryBtnTextColor } = useThemeColors()
const show = ref(true);
const sourceList = ref([])
const judegeShow = () => {
    sourceList.value = uni.getStorageSync("sourceList");
    show.value = !sourceList.value.every((item) => {
        return !item.list.length;
    });
};
judegeShow();

const handleSelect = async (item, vitem) => {
    uni.showLoading({
        title: '加载中',
    });
    if (item.type == "WebDAV") {
        await loginUser(vitem)
            .then((res) => {
                uni.hideLoading();
                vitem.token = res.data.token;
                emits('openFolder', item, vitem, {})
            })
            .catch((error) => {
                uni.hideLoading();
                uni.showToast({
                    title: "请先开启Alist",
                    icon: "none",
                });
            });
    } else if (item.type == "天翼云盘") {
        await get189Folder({ folderId: "-11" }, { JSESSIONID: vitem.JSESSIONID, COOKIE_LOGIN_USER: vitem.COOKIE_LOGIN_USER })
            .then((res) => {
                uni.hideLoading();
                if (res.res_code == 0) {
                    emits('openFolder', item, vitem, res)
                } else {
                    uni.showToast({
                        title: "请重新登录天翼云盘",
                        icon: "none",
                    });
                }
            })
            .catch((error) => {
                uni.hideLoading();
                uni.showToast({
                    title: "请重新登录天翼云盘",
                    icon: "none",
                });
            });
    } else if (item.type == "夸克网盘") {
        await getQuarkFolder({ fid: "0" }, vitem)
            .then((res) => {
                uni.hideLoading();
                if (res.status == 200) {
                    emits('openFolder', item, vitem, res)
                } else {
                    uni.showToast({
                        title: "请重新登录夸克网盘",
                        icon: "none",
                    });
                }
            })
            .catch((error) => {
                uni.hideLoading();
                uni.showToast({
                    title: "请重新登录夸克网盘",
                    icon: "none",
                });
            });
    }
};
</script>

<style lang="scss" scoped>
.select-source {
    height: 100%;
    display: flex;
    background: var(--app-bg);
    color: var(--app-text-primary);
    flex-direction: column;

    .select-source-title {
        width: 100%;
        text-align: center;
        padding-top: 24rpx;
        font-size: 34rpx;
        font-weight: bold;
        color: var(--app-text-primary);
    }

    .select-source-container {
        flex: 1;
        overflow: auto;
        padding: 0 24rpx;

        .select-source-item {
            padding-bottom: 16rpx;

            .select-source-item__title {
                font-size: 28rpx;
                color: var(--app-text-tertiary);
                padding: 16rpx 0;
            }

            .select-source-item__list {
                background: var(--app-bg-card);
                border-radius: 14rpx;

                .list-item {
                    background: var(--app-bg-card);
                    padding: 6rpx 24rpx;
                    display: flex;
                    align-items: center;
                    position: relative;
                    border: 2prx solid transparent;

                    &::before {
                        position: absolute;
                        content: "";
                        height: 2rpx;
                        background: var(--app-bg-secondary);
                        width: 100%;
                        left: 0;
                        top: 0;
                    }

                    &:active {
                        background: var(--app-bg-secondary);
                    }

                    &:first-child {
                        border-radius: 14rpx;

                        &::before {
                            display: none;
                        }
                    }

                    &:last-child {
                        border-radius: 14rpx;
                    }

                    .list-item-img {
                        width: 100rpx;
                        height: 100rpx;
                        background: url("@/static/source-file.png") center no-repeat;
                        background-size: 100% 100%;
                        // display: flex;
                        // align-items: center;
                        // justify-content: center;
                        position: relative;

                        image {
                            width: 40rpx;
                            height: 40rpx;
                            border-radius: 50%;
                            position: absolute;
                            left: 50%;
                            top: 40%;
                            transform: translate(-50%, 0);
                        }
                    }

                    .list-item-name {
                        padding-left: 10rpx;
                        font-size: 32rpx;
                        color: var(--app-text-primary);
                    }

                    .list-item-activeName {
                        color: var(--app-brand);
                    }

                    .list-item-button {
                        position: absolute;
                        right: 24rpx;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 42rpx;
                        height: 42rpx;
                    }
                }

                .list-one {
                    border-radius: 14rpx !important;
                    border: 2rpx solid transparent !important;
                }

                .list-active {
                    border: 2rpx solid var(--app-brand) !important;
                }
            }
        }
    }

    .select-source-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;

        .select-source-empty__img {
            width: 400rpx;
            height: 400rpx;
        }

        .select-source-empty__tip {
            text-align: center;
            padding: 0 50rpx;
            padding-bottom: 24rpx;
            color: var(--app-text-primary);
        }

        ::v-deep .nut-button {
            border-radius: 12rpx;
        }
    }
}
</style>
