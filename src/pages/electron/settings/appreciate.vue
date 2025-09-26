<template>
    <div class="appreciate">
        <div class="appreciate-title" @click="back">
            <img src="@/static/rect-leftblack.png">
            <span>赞赏</span>
        </div>
        <div class="appreciate-container">
            <div class="appreciate-container-left">
                <img src="@/static/zanshang.jpg">
                <span>开发维护不易，如果您觉得此App有用，不妨使用微信扫描上方二维码，也可以在github上⭐一下，支持本软件！App完全免费！ </span>
            </div>
            <div class="appreciate-container-right">
                <div class="appreciate-container-right__title">
                    <span>❤特别感谢以下小伙伴的打赏！</span>
                    <span>若有遗漏请在qq交流群联系我补充，qq群：477326591</span>
                </div>
                <div class="appreciate-container-right__list">
                    <div class="appreciate-container-right__list-item" v-for="item in appreciateList" :key="item.dictValue">
                        {{ `${item.dictLabel}（${item.cssClass}元）` }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>import { ref } from "vue";
import { getUntokenDicts } from "@/network/apis";
import { useRouter } from "vue-router";

const router =useRouter()
const appreciateList = ref([]);

const back = () => {
    router.go(-1)
}

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

    .appreciate-title {
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 24rpx;

        img {
            width: 40rpx;
            height: 40rpx;
        }

        span {
            margin-left: 12rpx;
            font-weight: bold;
        }
    }
    .appreciate-container{
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
