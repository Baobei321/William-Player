<template>
    <div class="appreciate">
        <wil-title :title="t('navbar.appreciate')"></wil-title>
        <div class="appreciate-container">
            <div class="appreciate-container-left">
                <img src="@/static/zanshang.jpg">
                <span>{{ t('backend.appreciateDescription') }}</span>
            </div>
            <div class="appreciate-container-right">
                <div class="appreciate-container-right__title">
                    <span>{{ t('backend.specialThanksDonation') }}</span>
                    <span>{{ t('backend.donationMissingTip') }}</span>
                </div>
                <div class="appreciate-container-right__list">
                    <div class="appreciate-container-right__list-item" v-for="item in appreciateList"
                        :key="item.dictValue">
                        {{ t('backend.donationAmount', { name: item.dictLabel, amount: item.cssClass }) }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>import { ref } from "vue";
import { getUntokenDicts } from "@/network/apis";
import { useRouter } from "vue-router";
import wilTitle from '@/components/electron/wil-title/index.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const appreciateList = ref([]);

const getAppreciateUser = async () => {
    let res = await getUntokenDicts("appreciate_user");
    appreciateList.value = res.data;
};
getAppreciateUser();
</script>

<style lang="scss" scoped>
page {
    width: 100%;
    height: 100%;
}

.appreciate {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .appreciate-container {
        display: flex;
        flex: 1;
    }

    .appreciate-container-left {
        flex: 0 0 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0 80rpx;

        img {
            width: 550rpx;
            height: 550rpx;
            border-radius: 30rpx;
            box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
        }

        span {
            margin-top: 70rpx;
            color: #ffab4b;
            font-weight: bold;
            text-align: center;
            font-size: 32rpx;
        }
    }

    .appreciate-container-right {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        // align-items: center;
        // padding-top: 80rpx;
        padding-left: 80rpx;
        border-left: 2rpx solid #e9e9e9;

        .appreciate-container-right__title {
            display: flex;
            flex-direction: column;
            color: #000;

            span:first-child {
                font-size: 32rpx;
                font-weight: bold;
            }

            span:last-child {
                font-size: 28rpx;
                margin-top: 10rpx;
            }
        }

        .appreciate-container-right__list {
            padding-top: 48rpx;
            flex: 1;
            overflow: auto;

            .appreciate-container-right__list-item {
                margin-top: 24rpx;
                font-size: 28rpx;
                font-weight: bold;
                color: #000;
            }
        }
    }
}
</style>
