<template>
    <div class="appreciate">
        <div class="appreciate-left">
            <image src="@/static/zanshang.jpg"></image>
            <span>开发维护不易，如果您觉得此App有用，不妨使用微信扫描上方二维码，也可以在github上⭐一下，支持本软件！App完全免费！ </span>
        </div>
        <div class="appreciate-right">
            <div class="appreciate-right-title">
                <span>❤特别感谢以下小伙伴的打赏！</span>
                <span>若有遗漏请在qq交流群联系我补充，qq群：477326591</span>
            </div>
            <div class="appreciate-right-list">
                <div class="appreciate-right-list__item" v-for="item in appreciateList" :key="item.dictValue">
                    {{ `${item.dictLabel}（${item.cssClass}元）` }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>import { ref } from "vue";
import { getUntokenDicts } from "@/network/apis";
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
