<template>
    <div class="about-version">
        <div class="about-version-title" @click="back">
            <img src="@/static/rect-leftblack.png">
            <span>问题与反馈</span>
        </div>
        <div class="about-version-container">
            <div class="about-version-container__main">
                <image src="@/static/app-logo1.png"></image>
                <div class="main-name">
                    <span>William Player</span>
                    <span>{{ appVersion }}</span>
                </div>
                <div class="main-time">{{ CONFIG.updateTime }}</div>
            </div>
            <nut-cell title="自动检查更新" :desc="status[0]" :is-link="true" @click="showPopover = true"
                :class="[tabIndex === 0 ? 'active-cell' : '']"></nut-cell>
        </div>
        <div class="about-version-protocol">
            <image src="@/static/tmdb-xy.png"></image>
            <div :class="['about-version-protocol__button', tabIndex === 1 ? 'active-protocol' : '']" @click="toQQpage">
                联系我们</div>
            <!-- <div class="about-version-protocol__tip">@2024-至今，由chenweiliang6开发并开源，仅用于学习和使用，不可用于商用</div> -->
        </div>
        <div :class="['about-version-button', tabIndex == 2 ? 'about-check-active' : '']">
            <nut-button :disabled="isLoading" custom-color="#ff6701" @click="checkUpdate" v-if="showButton">
                <template #icon>
                    <nut-icon name="refresh2" class="nut-icon-am-rotate nut-icon-am-infinite"
                        v-if="isLoading"></nut-icon>
                </template>
                检查更新
            </nut-button>
            <nut-button disabled custom-color="#dedde3" v-else>当前已是最新版本</nut-button>
        </div>
        <nut-popup v-model:visible="showPopover" round position="bottom" safe-area-inset-bottom>
            <nut-picker v-model="status" :columns="popoverList" title="" @confirm="confirm"
                @cancel="showPopover = false" />
        </nut-popup>
        <wil-upgrade :updateFunction="backInfo" :logo="upgradeInfo.logo" :app-name=upgradeInfo.appName
            :appVersion="appVersion" @closed="closedPopup" v-model:visible="showUpgrade">
        </wil-upgrade>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import wilUpgrade from "@/components/mobile/wil-upgrade/index.vue";
import { getUntokenDicts } from "@/network/apis";
import appLogo from "@/static/app-logo1.png";
import * as CONFIG from "@/utils/config";
import { toParse, toStringfy } from "@/pages/mobile/mine/common";
import { useRouter } from "vue-router";

const router = useRouter()

const url = ref("");

const status = ref(["总是"]);
const showPopover = ref(false);
const popoverList = ref([
    { text: "总是", value: "总是" },
    { text: "每天", value: "每天" },
    { text: "每周", value: "每周" },
    { text: "从不", value: "从不" },
]);
const isLoading = ref(false);
const showButton = ref(true);
const showUpgrade = ref(false);
const versionData = ref({});

const appVersion = ref(CONFIG.VERSIOIN);

const tabIndex = ref(0)

const upgradeInfo = ref({
    logo: appLogo,
    appName: "William Player",
});

const back = () => {
    router.go(-1)
}

const checkUpdate = async () => {
    isLoading.value = true;
    await getAppUpdateInfo();
};

const confirm = ({ selectedValue, selectedOptions }) => {
    uni.setStorageSync("remindTime", { type: selectedValue[0] });
    showPopover.value = false;
};

const toQQpage = () => {
    // let query = {
    //     url: CONFIG.BASE_URL.split(":4040")[0] + ":8443/app-webview/#/qqTalk",
    //     title: "QQ交流",
    //     type:'contain'
    // };
    router.push({
        path: "/qqTalk",
    })
};

const compareVersions = (newBb, oldBb) => {
    const v1 = newBb.split(".").map(Number); // 将版本号拆分成数字
    const v2 = oldBb.split(".").map(Number); // 同样拆分另一个版本号

    for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
        // 如果 v1 的当前部分小于 v2 对应的部分，返回 -1
        if ((v1[i] || 0) < (v2[i] || 0)) {
            return -1;
        }
        // 如果 v1 的当前部分大于 v2 对应的部分，返回 1
        if ((v1[i] || 0) > (v2[i] || 0)) {
            return 1;
        }
    }

    return 0; // 如果两个版本号完全相同，返回 0
};

const getAppUpdateInfo = async () => {
    let res = await getUntokenDicts("app_version");
    isLoading.value = false;
    let newVersion = res.data[res.data.length - 1];
    versionData.value = res;
    if (compareVersions(newVersion.dictLabel, appVersion.value) == 1) {
        //此时后台设置已有新版本
        showUpgrade.value = true;
    } else {
        showButton.value = false;
    }
};

const backInfo = async () => {
    return versionData.value;
};

const closedPopup = () => {
    showUpgrade.value = false;
};

onLoad((options) => {
    status.value = uni.getStorageSync("remindTime").type ? [uni.getStorageSync("remindTime").type] : ["总是"];
    url.value = decodeURIComponent(options.url);
});
</script>

<style lang="scss">
page {
    width: 100%;
    height: 100%;
}

.about-version {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    // padding-top: 250rpx;
    position: relative;
    // background: #1b1b20;
    background: #f7f7f7;

    .about-version-title {
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 24rpx;
        position: absolute;
        top: 0;
        left: 0;

        img {
            width: 40rpx;
            height: 40rpx;
        }

        span {
            margin-left: 12rpx;
            font-weight: bold;
        }
    }

    .about-version-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;

        .about-version-container__main {
            display: flex;
            flex-direction: column;
            align-items: center;

            image {
                width: 200rpx;
                height: 200rpx;
                border-radius: 60rpx;
            }

            .main-name {
                margin-top: 40rpx;
                position: relative;

                span:first-child {
                    font-weight: bold;
                    font-size: 40rpx;
                    color: #000;
                }

                span:last-child {
                    position: absolute;
                    display: block;
                    background: #cc1118;
                    color: #fff;
                    border-radius: 20rpx;
                    padding: 4rpx 8rpx;
                    font-size: 28rpx;
                    top: -20rpx;
                    right: 0;
                    transform: translateX(100%);
                }
            }

            .main-time {
                font-size: 35rpx;
                margin-top: 20rpx;
                color: #000;
            }
        }

        ::v-deep .nut-popover-wrapper {
            width: 100%;
        }

        ::v-deep .nut-cell {
            width: 30%;
            background: transparent;
            box-shadow: none;
            margin-top: 30rpx;

            .nut-cell__title {
                font-size: 32rpx;
                color: #000;
            }

            .nut-cell__value {
                font-size: 32rpx;
                color: #000;
            }

            .nut-cell__link {
                display: none;
            }
        }

        :deep(.active-cell) {
            background: #e5e6ec;

            .nut-cell__title {
                color: #000015;
            }

            .nut-cell__value {
                color: #000015;
            }
        }
    }

    .about-version-protocol {
        margin-top: 24rpx;
        display: flex;
        flex-direction: column;
        align-items: center;

        image {
            width: 526.5rpx;
            height: 178.5rpx;
        }

        .about-version-protocol__button {
            margin-top: 50rpx;
            font-weight: bold;
            font-size: 28rpx;
            color: #68c6b3;
            padding: 16rpx 24rpx;
            border: 2rpx solid transparent;
            border-radius: 16rpx;
        }

        .active-protocol {
            border: 2rpx solid #68c6b3;
        }

        // .about-version-protocol__tip{
        //   padding: 0 100rpx;
        //   margin-top: 24px;
        //   text-align: center;
        //   font-size: 24rpx;
        //   line-height: 35rpx;
        // }
    }

    .about-version-button {
        // position: absolute;
        // bottom: 50rpx;
        margin-top: 50rpx;

        ::v-deep .nut-button {
            border: 4rpx solid #ff6701;

            .nut-button__wrap {
                flex-direction: row-reverse;

                .nut-button__text {
                    margin-left: 0;
                }

                .nut-icon {
                    margin-left: 10rpx;
                }
            }
        }
    }

    .about-check-active {
        ::v-deep .nut-button {
            border: 4rpx solid #000 !important;
        }
    }

    :deep(.nut-popup) {
        width: 50%;
        left: 25%;
    }
}
</style>