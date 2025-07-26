<template>
    <div class="settings-popup">
        <nut-popup position="right" v-bind="$attrs">
            <div class="popup">
                <div class="popup-title">设置</div>
                <div class="popup-container">
                    <div class="popup-container-list" v-for="(litem, lindex) in settings" :key="lindex">
                        <div :class="['list-item', tabIndex === item.index ? 'list-active' : '']" v-for="item in litem"
                            :key="item.title" @click="clickItem(item)">
                            <image :src="tabIndex === item.index ? item.activeIcon : item.icon"></image>
                            <span>{{ item.title }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </nut-popup>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import datasyncGray from '@/static/datasync-gray.png'
import datasyncBlack from '@/static/datasync-black.png'
const settings = [
    [
        { icon: datasyncGray, activeIcon: datasyncBlack, title: '数据同步', index: 0, path: '/pages/tv/mine/data-sync' },
    ]
]
const tabIndex = ref(0)

const lengthValue = ref(0)
const emits = defineEmits('changeSetting')

//获取settings的长度
const getLength = () => {
    settings.forEach(item => {
        lengthValue.value += item.length
    })
}

const evtMove = (keyCode) => {
    if (keyCode === "KeyUp") {
        if (tabIndex.value > 0) {
            tabIndex.value--;
        }
    } else if (keyCode === "KeyDown") {
        if (tabIndex.value < lengthValue.value - 1) {
            tabIndex.value++;
        }
    } else if (keyCode === 'KeyLeft') {
        emits('changeSetting', false)
    } else if (keyCode === 'KeyEnter') {
        let targetObject = null;
        for (const innerArray of settings) { // 遍历外层数组
            targetObject = innerArray.find(item => item.index === 0); // 在内层数组中查找
            if (targetObject) break; // 找到后立即终止循环
        }
        clickItem(targetObject)
    }
};

//跳转页面
const clickItem = (item) => {
    uni.navigateTo({
        url: item.path
    })
}

getLength()

defineExpose({
    evtMove
})
</script>

<style lang="scss" scoped>
.settings-popup {
    position: relative;
    z-index: 1000;

    :deep(.nut-overlay) {
        background-color: rgba(0, 0, 0, 0.5);
    }

    :deep(.nut-popup) {
        width: 33%;
        height: 100%;
        background: #191c20;

        .popup {
            width: 100%;
            height: 100%;

            .popup-title {
                background: #272a2f;
                height: 150rpx;
                color: #fff;
                font-size: 44rpx;
                font-weight: bold;
                padding-left: 40rpx;
                padding-top: 60rpx;
            }

            .popup-container {
                padding: 24rpx;

                .popup-container-list {
                    border-bottom: 2rpx solid #c5c6d0;
                    padding-bottom: 16rpx;

                    .list-item {
                        display: flex;
                        align-items: center;
                        padding: 20rpx 24rpx;
                        border-radius: 16rpx;

                        image {
                            width: 70rpx;
                            height: 70rpx;
                        }

                        span {
                            padding-left: 24rpx;
                            color: #c5c6d0;
                            font-size: 32rpx;
                        }
                    }

                    .list-active {
                        background: #e5e6ec;

                        span {
                            color: #000015;
                        }
                    }

                    &:last-child {
                        border-bottom: none;
                    }
                }
            }
        }
    }
}
</style>
