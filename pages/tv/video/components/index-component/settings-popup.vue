<template>
    <div class="settings-popup">
        <nut-popup position="right" v-bind="$attrs" @closed="closedPopup">
            <div :class="['popup', openAnimation ? 'settings-leave' : 'settings-enter']"
                v-show="showType == 'settings'">
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
            <source-list v-if="showType == 'source'" :class="[openAnimation ? 'source-enter' : 'source-leave']"
                ref="source_list" @changeShowType="changeShowType" @openModal="openModal">
            </source-list>
            <catelog-mulu v-if="showType == 'catelogMulu'" :class="[openAnimation ? 'source-enter' : 'source-leave']"
                ref="catelog_mulu" @changeShowType="changeShowType">
            </catelog-mulu>
        </nut-popup>
    </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import ziyuankuGray from '@/static/ziyuanku-gray.png'
import ziyuankuBlack from '@/static/ziyuanku-black.png'
import datasyncGray from '@/static/datasync-gray.png'
import datasyncBlack from '@/static/datasync-black.png'
import guanyuGray from '@/static/guanyu-gray.png'
import guanyuBlack from '@/static/guanyu-black.png'
import xspGray from '@/static/xsp-gray.png'
import xspBlack from '@/static/xsp-black.png'
import dyGray from '@/static/dy-gray.png'
import dyBlack from '@/static/dy-black.png'
import fankuiGray from '@/static/fankui-gray.png'
import fankuiBlack from '@/static/fankui-black.png'
import zanshangGray from '@/static/zanshang-gray.png'
import zanshangBlack from '@/static/zanshang-black.png'
import sourceList from './source-list.vue'
import catelogMulu from './catelog-mulu.vue'
const settings = [
    [
        { icon: ziyuankuGray, activeIcon: ziyuankuBlack, title: '资源库', index: 0, type: 'source' },
        { icon: datasyncGray, activeIcon: datasyncBlack, title: '数据同步', index: 1, path: '/pages/tv/mine/data-sync' },
        { icon: xspGray, activeIcon: xspBlack, title: '电视剧目录设置', index: 2, type: 'catelogMulu' },
        { icon: dyGray, activeIcon: dyBlack, title: '电影目录设置', index: 3, path: '/pages/tv/mine/data-sync' },
    ],
    [
        { icon: fankuiGray, activeIcon: fankuiBlack, title: '问题与反馈', index: 4, path: '/pages/tv/mine/enter-qqgroup' },
        { icon: zanshangGray, activeIcon: zanshangBlack, title: '赞赏', index: 5, path: '/pages/tv/mine/appreciate' },
        { icon: guanyuGray, activeIcon: guanyuBlack, title: '关于', index: 6, path: '/pages/tv/mine/about-version' },
    ]
]
const tabIndex = ref(0)
const showType = ref('settings')//在popup中展示的模块
const openAnimation = ref(false) //true就是点击跳转，false就是返回

const source_list = ref(null)
const catelog_mulu = ref(null)

const lengthValue = ref(0)
const emits = defineEmits(['changeSetting', 'openModal'])

//获取settings的长度
const getLength = () => {
    settings.forEach(item => {
        lengthValue.value += item.length
    })
}

const evtMove = (keyCode) => {
    if (showType.value === 'settings') {
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
                targetObject = innerArray.find(item => item.index === tabIndex.value); // 在内层数组中查找
                if (targetObject) break; // 找到后立即终止循环
            }
            clickItem(targetObject)
        }
    } else if (showType.value === 'source') {
        source_list.value.evtMove(keyCode)
    } else if (showType.value === 'catelogMulu') {
        catelog_mulu.value.evtMove(keyCode)
    }
};

//跳转页面
const clickItem = (item) => {
    if (item.path) {
        uni.navigateTo({
            url: item.path
        })
        return
    }
    if (item.type) {
        openAnimation.value = true
        setTimeout(() => {
            showType.value = item.type
            openAnimation.value = false
            setTimeout(() => {
                openAnimation.value = true
            }, 0);
        }, 150);
    }
}

//二级popup返回settings
const changeShowType = (val) => {
    if (val === 'settings') {
        openAnimation.value = false
        setTimeout(() => {
            showType.value = val
            openAnimation.value = true
            setTimeout(() => {
                openAnimation.value = false
            }, 0);
        }, 150);
    }
}

//关闭popup之后
const closedPopup = () => {
    showType.value = 'settings'
    openAnimation.value = false
    emits('closed')
}

const openModal = (obj) => {
    emits('openModal', obj)
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
        overflow: hidden;

        .popup {
            width: 100%;
            height: 100%;
            transition: transform 0.15s ease-in-out, opacity 0.15s ease;

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
                    border-bottom: 2rpx solid #747474;
                    padding: 16rpx 0;

                    &:first-child {
                        padding-top: 0;
                    }

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

        .settings-leave {
            transform: translateX(-50rpx);
            opacity: 0;
        }

        .source-list {
            transform: translateX(50rpx);
            opacity: 0;
            transition: transform 0.15s ease-in-out, opacity 0.15s ease;
        }

        .catelog-mulu {
            transform: translateX(50rpx);
            opacity: 0;
            transition: transform 0.15s ease-in-out, opacity 0.15s ease;
        }

        .source-leave {
            transform: translateX(50rpx);
            opacity: 0;
        }

        .source-enter {
            transform: translateX(0);
            opacity: 1;
        }
    }
}
</style>
