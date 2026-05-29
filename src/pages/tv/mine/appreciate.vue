<template>
    <div class="appreciate">
        <div class="appreciate-left">
            <image src="@/static/zanshang.jpg"></image>
            <span>{{ t('backend.appreciateDescription') }}</span>
        </div>
        <div class="appreciate-right">
            <div class="appreciate-right-title">
                <span>{{ t('backend.specialThanksDonation') }}</span>
                <span>{{ t('backend.donationMissingTip') }}</span>
            </div>
            <div class="appreciate-right-list">
                <div class="appreciate-right-list__item" v-for="item in appreciateList" :key="item.dictValue">
                    {{ t('backend.donationAmount', { name: item.dictLabel, amount: item.cssClass }) }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from 'vue-i18n'
import { getUntokenDicts } from "@/network/apis";

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
    display: flex;
    width: 100%;
    height: 100%;
    background: #020201;

    .appreciate-left {
        flex: 0 0 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0 80rpx;

        image {
            width: 550rpx;
            height: 550rpx;
            border-radius: 30rpx;
        }

        span {
            margin-top: 70rpx;
            color: #ffddb7;
            font-weight: bold;
            text-align: center;
            font-size: 32rpx;
        }
    }

    .appreciate-right {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        // align-items: center;
        padding-top: 80rpx;
        padding-left: 80rpx;

        .appreciate-right-title {
            display: flex;
            flex-direction: column;
            color: #e1e2e9;

            span:first-child {
                font-size: 32rpx;
                font-weight: bold;
            }

            span:last-child {
                font-size: 28rpx;
                margin-top: 10rpx;
            }
        }

        .appreciate-right-list {
            padding-top: 48rpx;

            .appreciate-right-list__item {
                margin-top: 24rpx;
                font-size: 28rpx;
                font-weight: bold;
                color: #e1e2e9;
            }
        }
    }
}
</style>
