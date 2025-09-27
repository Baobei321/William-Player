<template>
    <div class="wil-tooltip-container" ref="triggerEl" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave"
        @click="handleClick">
        <!-- 触发提示的元素 -->
        <slot></slot>

        <!-- 使用Teleport将提示框挂载到body，避免被裁剪 -->
        <teleport to="body" :disabled="!appendToBody">
            <transition name="tooltip-fade">
                <div v-show="isVisible" class="wil-tooltip"
                    :class="[computedPlacement, { 'has-custom-content': $slots.content }]" :style="tooltipStyle"
                    ref="tooltipEl">
                    <!-- 支持默认文本和自定义插槽内容 -->
                    <slot name="content">
                        {{ content }}
                    </slot>
                    <!-- 指示箭头 -->
                    <div class="tooltip-arrow" :class="computedPlacement"></div>
                </div>
            </transition>
        </teleport>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

// 定义Props
const props = defineProps({
    content: {
        type: String,
        required: true
    },
    placement: {
        type: String,
        default: 'top'
    },
    trigger: {
        type: String,
        default: 'hover'
    },
    appendToBody: {
        type: Boolean,
        default: true
    },
    delay: {
        type: Number,
        default: 100
    },
    onlyWhenOverflow: {
        type: Boolean,
        default: false
    }
})

// 响应式数据
const isVisible = ref(false)
const triggerEl = ref(null)
const tooltipEl = ref(null)
const tooltipStyle = ref({ top: '0px', left: '0px' })

// 处理点击外部关闭
const handleClickOutside = (event) => {
    if (triggerEl.value && tooltipEl.value && event.target instanceof Node) {
        if (!triggerEl.value.contains(event.target) && !tooltipEl.value.contains(event.target)) {
            isVisible.value = false
        }
    }
}

// 检测内容是否溢出
const checkOverflow = (element) => {
    if (!element) return false
    return element.scrollWidth > element.offsetWidth || element.scrollHeight > element.offsetHeight
}

// 事件处理函数
let showTimeout = null

const handleMouseEnter = () => {
    if (props.trigger !== 'hover') return

    if (props.onlyWhenOverflow && triggerEl.value) {
        if (!checkOverflow(triggerEl.value)) return
    }

    if (props.delay > 0) {
        showTimeout = setTimeout(showTooltip, props.delay)
    } else {
        showTooltip()
    }
}

const handleMouseLeave = () => {
    if (props.trigger !== 'hover') return
    if (showTimeout) clearTimeout(showTimeout)
    hideTooltip()
}

const handleClick = () => {
    if (props.trigger !== 'click') return

    if (props.onlyWhenOverflow && triggerEl.value) {
        if (!checkOverflow(triggerEl.value)) return
    }

    isVisible.value = !isVisible.value
    if (isVisible.value) {
        nextTick(updatePosition)
    }
}

// 显示/隐藏工具提示
const showTooltip = () => {
    isVisible.value = true
    nextTick(updatePosition)
}

const hideTooltip = () => {
    isVisible.value = false
}

// 更新提示框位置
const updatePosition = () => {
    if (!triggerEl.value || !tooltipEl.value) return

    const triggerRect = triggerEl.value.getBoundingClientRect()
    const tooltipRect = tooltipEl.value.getBoundingClientRect()
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft
    const scrollY = window.pageYOffset || document.documentElement.scrollTop

    let top = 0
    let left = 0
    const gap = 8 // 提示框与触发元素的间隙

    switch (props.placement) {
        case 'top':
            top = triggerRect.top + scrollY - tooltipRect.height - gap
            left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2
            break
        case 'top-start':
            top = triggerRect.top + scrollY - tooltipRect.height - gap
            left = triggerRect.left + scrollX - tooltipRect.width / 2
            break
        case 'top-end':
            top = triggerRect.top + scrollY - tooltipRect.height - gap
            left = triggerRect.left + scrollX - tooltipRect.width / 2 + triggerRect.width
            break
        case 'bottom':
            top = triggerRect.bottom + scrollY + gap
            left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2
            break
        case 'bottom-start':
            top = triggerRect.bottom + scrollY + gap
            left = triggerRect.left + scrollX - tooltipRect.width / 2
            break
        case 'bottom-end':
            top = triggerRect.bottom + scrollY + gap
            left = triggerRect.left + scrollX - tooltipRect.width / 2 + triggerRect.width
            break
        case 'left':
            top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2
            left = triggerRect.left + scrollX - tooltipRect.width - gap
            break
        case 'right':
            top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2
            left = triggerRect.right + scrollX + gap
            break
        default:
            top = triggerRect.top + scrollY - tooltipRect.height - gap
            left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2
    }

    // 边界检测，确保提示框在视口内
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    left = Math.max(10, Math.min(left, viewportWidth - tooltipRect.width - 10))
    top = Math.max(10, Math.min(top, viewportHeight + scrollY - tooltipRect.height - 10))

    tooltipStyle.value = {
        top: `${top}px`,
        left: `${left}px`
    }
}

// 计算位置类名
const computedPlacement = computed(() => {
    return props.placement.split('-')[0]
})

// 监听显示状态变化，添加/移除点击外部事件
watch(isVisible, (newVal) => {
    if (newVal && props.trigger === 'click') {
        document.addEventListener('click', handleClickOutside)
    } else {
        document.removeEventListener('click', handleClickOutside)
    }
})
</script>

<style lang="scss" scoped>
.wil-tooltip-container {
    display: inline-block;
    position: relative;
}

.wil-tooltip {
    position: absolute;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 10rpx 20rpx;
    border-radius: 8rpx;
    font-size: 28rpx;
    line-height: 40rpx;
    max-width: 300px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

    &.has-custom-content {
        padding: 24rpx;
    }

    /* 箭头样式 */
    .tooltip-arrow {
        position: absolute;
        width: 16rpx;
        height: 16rpx;
        background: inherit;
        transform: rotate(45deg);
    }

    .tooltip-arrow.top {
        bottom: -8rpx;
        left: 50%;
        margin-left: -8rpx;
    }

    .tooltip-arrow.bottom {
        top: -8rpx;
        left: 50%;
        margin-left: -8rpx;
    }

    .tooltip-arrow.left {
        right: -8rpx;
        top: 50%;
        margin-top: -8rpx;
    }

    .tooltip-arrow.right {
        left: -8rpx;
        top: 50%;
        margin-top: -8rpx;
    }
}


/* 淡入淡出过渡效果 */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
    transition: opacity 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
    opacity: 0;
}
</style>