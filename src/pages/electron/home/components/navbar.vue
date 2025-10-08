<template>
    <div class="home-navbar">
        <div class="home-navbar-container">
            <img src="@/static/search-black.png">
            <img src="@/static/refresh-black.png"
                :class="['home-navbar-container__refresh', loading ? 'refresh-rotate' : '']" @click="showProgress">
            <img src="@/static/jia-black.png" @click="toSourceList">
        </div>
        <!-- 使用teleport挂载到body去 -->
        <template v-if="showPopover">
            <div :class="['home-navbar-arrow', isShowPopover ? 'popover-in' : 'popover-out']"
                :style="{ left: popoverStyle.left, top: popoverStyle.top }">
                <image src="@/static/rect-san.png" style="width: 100%;height: 100%;"></image>
            </div>
            <div :class="['home-navbar-popover', , isShowPopover ? 'popover-in' : 'popover-out']"
                :style="{ left: popoverStyle.left, top: +popoverStyle?.top?.split('px')[0] + 12 + 'px' }">
                <div class="popover-title">
                    <div class="popover-title-left">
                        <span>{{ popoverData.title }}</span>
                    </div>
                </div>
                <div class="popover-list">
                    <div class="popover-list-item" v-for="(item, index) in popoverData.list" :key="item.label">
                        <span>{{ item.label }}</span>
                        <span>{{ item.value }}</span>
                        <template v-if="index != popoverData.list.length - 1">，</template>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import dayjs from 'dayjs';
import { onUnload } from "@dcloudio/uni-app";
import { useRouter } from "vue-router";

const router = useRouter()

const props = defineProps({
    refreshData: { type: Object, default: {} },
    loading: { type: Boolean, default: false },
});
const emits = defineEmits(['refresh']);

const loading = ref(false) //是否正在旋转，刮削中
const showPopover = ref(false) //是否显示蓝色的框，用来显示刮削到多少部影片
const popoverData = ref({}) //用于存储蓝色框显示的数据
const selectType = ref({}) //被选中资源的type
const selectMedia = ref({}) //被选中资源的media

const timer1 = ref(null)
const timer2 = ref(null)

const popoverStyle = ref({})
const isShowPopover = ref(false)

const toSourceList = () => {
    router.push({
        path: '/sourceList'
    })
}

//判断选择的是webdav还是天翼云盘还是夸克
const judgeSelect = () => {
    let sourceList = uni.getStorageSync("sourceList");
    selectType.value = sourceList.find((item) => {
        let select = item.list.find((i) => i.active);
        if (select) {
            selectMedia.value = select;
            return true;
        } else {
            return false;
        }
    });
};

//父组件调用此方法旋转刷新按钮，触发刮削
const showProgress = () => {
    clearTimeout(timer1.value);
    timer1.value = null;
    clearTimeout(timer2.value)
    timer2.value = null
    if (loading.value) {
        showPopover.value = true;
        return;
    }
    popoverData.value.title = "正在扫描";
    popoverData.value.list = [
        { label: "已找到", value: 0 },
        { label: "待更新", value: 0 },
        { label: "已更新", value: 0 },
    ];
    showPopover.value = true;
    isShowPopover.value = true
    judgeSelect()
    if (selectType.value.type == 'Emby') {
        showPopover.value = false;
        isShowPopover.value = false
    }
    emits("refresh");
    timer1.value = setTimeout(() => { //刮削时间到了60s那就自动暂停
        isShowPopover.value = false
        setTimeout(() => {
            showPopover.value = false;
        }, 300);
        clearTimeout(timer1.value);
        timer1.value = null;
        emits("pause");
    }, 60000);
};

const getScrollTop = () => {
    return 0
}
watch(
    () => props.refreshData,
    (val) => {
        if (props.loading) {
            popoverData.value.list = [
                { label: "已找到", value: 0 },
                { label: "待更新", value: 0 },
                { label: "已更新", value: 0 },
            ];
            popoverData.value.list.find((i) => i.label == "待更新").value = val.toupdate || 0;
        } else {
            popoverData.value.list = [
                { label: "已找到", value: 0 },
                { label: "已失败", value: 0 },
                { label: "已更新", value: 0 },
            ];
            popoverData.value.list.find((i) => i.label == "已失败").value = val.fail || 0;
        }
        popoverData.value.list.find((i) => i.label == "已找到").value = val.found || 0;
        popoverData.value.list.find((i) => i.label == "已更新").value = val.updated || 0;
    },
    { deep: true }
);
watch(
    () => props.loading,
    (val) => {
        loading.value = val;
        if (!val) {
            popoverData.value.title = `已完成同步${props.refreshData.success || 0}个影片`;
            timer2.value = setTimeout(() => {
                isShowPopover.value = false
                setTimeout(() => {
                    showPopover.value = false
                }, 300);
            }, 6000);
            clearTimeout(timer1.value);
            timer1.value = null;
        }
    },
    { deep: true }
);

onMounted(() => {
    const query = uni.createSelectorQuery();
    query.select(".home-navbar-container__refresh").fields(
        {
            rect: true,
            size: true,
        },
        (res) => {
            popoverStyle.value = { left: res.left + res.width / 2 + 'px', top: res.top + res.height + 'px' }
        }
    ).exec();
})
defineExpose({
    getScrollTop,
    showProgress
})
</script>

<style lang="scss" scoped>
@keyframes spin-reverse {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
.home-navbar {
    position: absolute;
    width: 100%;
    z-index: 1000;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 100rpx;
    top: 50rpx;

    .home-navbar-container {
        img {
            width: 40rpx;
            height: 40rpx;
            cursor: pointer;
            margin-left: 24rpx;

            &:first-child {
                margin-left: 0;
            }
        }
        .refresh-rotate {
            animation: spin-reverse 1s linear infinite reverse;
        }
    }

    .home-navbar-arrow {
        width: 16px;
        height: 16px;
        position: fixed;
        transform: translateX(-50%);
    }

    .home-navbar-popover {
        position: fixed;
        transform: translateX(-70%);
        background: #315ffd;
        padding: 12px;
        border-radius: 10px;

        .popover-title {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .popover-title-left {
                font-size: 15px;
                color: #fff;

                .popover-title-left__button {
                    display: inline-block;
                    border: 1px solid #fff;
                    margin-left: 5px;
                    padding: 0 2px;
                }
            }

            .popover-title-right {
                .nut-icon-close {
                    font-size: 15px;
                    width: 15px;
                    height: 15px;
                    display: block;
                }
            }
        }

        .popover-list {
            display: flex;
            align-items: center;
            margin-top: 10px;

            .popover-list-item {
                display: flex;
                align-items: baseline;

                span:first-child {
                    font-size: 14px;
                    color: #d0d0d0;
                    white-space: nowrap;
                }

                span:last-child {
                    font-size: 14px;
                    padding-left: 3px;
                    color: #fff;
                    font-weight: bold;
                }
            }
        }
    }

    .popover-in {
        animation: fadeIn 0.3s ease-in-out forwards;
    }

    .popover-out {
        animation: fadeOut 0.3s ease-in-out forwards;
    }
}
</style>
