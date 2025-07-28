<template>
    <nut-transition :show="showPopover" name="fade" :duration="200">
        <div class="popover" ref="popoverRef" :style="{ left: positionObj.left, top: positionObj.top }">
            <div class="popover-item" v-for="item in props.options" :key="item.label" @click="clickItem(item)">
                <image :src="item.icon"></image>
                <span :style="{ color: item.color }">{{ item.label }}</span>
            </div>
        </div>
    </nut-transition>
</template>

<script setup>
import { watch, ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
    options: { type: Array, default: [] },
    visible: { type: Boolean, default: false },
    position: { type: Object, default: {} },
})

const emits = defineEmits(['update:visible'])

const showPopover = ref(false)

const isInit = ref(true)
const positionObj = ref({})

const popoverRef = ref(null)

// 判断弹窗显示的位置
const adjustMenuPosition = () => {
    if (!popoverRef.value) return
    // 获取系统信息（替代 window.innerWidth/Height）
    const systemInfo = uni.getSystemInfoSync()
    const viewportWidth = systemInfo.windowWidth
    const viewportHeight = systemInfo.windowHeight
        console.log(viewportHeight, 'asd');
    // 创建节点查询（替代 offsetWidth/Height）
    const query = uni.createSelectorQuery().in(this)
    query.select('.popover').boundingClientRect(rect => {
        if (!rect) return
        const menuWidth = rect.width
        const menuHeight = rect.height

        // 计算最终位置
        let finalX = props.position.clientX
        let finalY = props.position.clientY
        // 右侧空间检查
        if (finalX + menuWidth > viewportWidth) {
            finalX = viewportWidth - menuWidth - 5
        }

        // 底部空间检查
        if (finalY + menuHeight > viewportHeight) {
            finalY = props.position.clientY - menuHeight
        } else {
        }

        // 应用位置（通过 CSS 变量或直接设置样式）
        positionObj.value = {
            left: `${finalX}px`,
            top: `${finalY}px`,
        }

    }).exec()
}

// 点击选项
const clickItem = (item) => {
    item.func()
}

watch(
    () => props.visible,
    (val) => {
        showPopover.value = val
    }, { immediate: true })
onMounted(() => {
    setTimeout(() => {
        adjustMenuPosition()
    }, 1000);
})
onBeforeUnmount(() => {
})
</script>

<style lang="scss" scoped>
.popover {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateX(-50%);
    background: #fff;
    z-index: 999;
    box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.11);
    border-radius: 8px 8px 8px 8px;
    border: 1px solid #E0E0E0;
    padding: 4px;

    .popover-item {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        cursor: pointer;

        image {
            width: 20px;
            height: 20px;
            display: block;
        }

        span {
            padding-left: 4px;
            font-size: 14px;
              white-space: nowrap; /* 防止文字换行 */
        }

        &:active {
            background: #F6F6F6;
            border-radius: 6px 6px 6px 6px;
        }
    }
}

.m-app {
    .popover-item {
        span {
            font-size: 0.933rem;

        }
    }
}
</style>
