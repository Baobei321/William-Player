<template>
  <div class="popover-container" ref="containerRef">
    <!-- 触发元素 -->
    <div
      ref="triggerRef"
      class="popover-trigger"
      @click="handleTriggerClick"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @focus="handleFocus"
      @blur="handleBlur"
    >
      <slot name="reference"></slot>
    </div>

    <!-- 弹出层 -->
    <teleport to="body" :disabled="!teleport">
      <transition :name="transition">
        <div
          v-show="visible"
          ref="popoverRef"
          class="popover-content"
          :class="[placement, popperClass]"
          :style="popoverStyle"
          @mouseenter="handlePopoverEnter"
          @mouseleave="handlePopoverLeave"
        >
          <!-- 箭头 -->
          <div v-if="showArrow" class="popover-arrow" :style="arrowStyle"></div>
          
          <!-- 标题 -->
          <div v-if="title || $slots.title" class="popover-header">
            <slot name="title">{{ title }}</slot>
          </div>
          
          <!-- 内容 -->
          <div class="popover-body">
            <slot>{{ content }}</slot>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  trigger: {
    type: String,
    default: 'hover', // hover, click, focus, manual
    validator: (value) => ['hover', 'click', 'focus', 'manual'].includes(value)
  },
  placement: {
    type: String,
    default: 'bottom',
    validator: (value) => [
      'top-start', 'top', 'top-end',
      'bottom-start', 'bottom', 'bottom-end',
      'left-start', 'left', 'left-end',
      'right-start', 'right', 'right-end'
    ].includes(value)
  },
  title: String,
  content: String,
  width: [String, Number],
  showArrow: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  offset: {
    type: Number,
    default: 12
  },
  showDelay: {
    type: Number,
    default: 0
  },
  hideDelay: {
    type: Number,
    default: 200
  },
  teleport: {
    type: Boolean,
    default: true
  },
  popperClass: String,
  transition: {
    type: String,
    default: 'popover-fade'
  },
  fallbackPlacements: {
    type: Array,
    default: () => [
      'top-start', 'top', 'top-end',
      'bottom-start', 'bottom', 'bottom-end',
      'left-start', 'left', 'left-end',
      'right-start', 'right', 'right-end'
    ]
  }
})

// Emits
const emit = defineEmits(['update:visible', 'show', 'hide', 'visible-change'])

// Refs
const visible = ref(props.visible)
const triggerRef = ref(null)
const popoverRef = ref(null)
const containerRef = ref(null)

// 定时器
let showTimeout = null
let hideTimeout = null
let clickOutsideHandler = null

// 计算样式
const popoverStyle = computed(() => {
  const style = {}
  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  return style
})

const arrowStyle = computed(() => {
  // 根据位置计算箭头的偏移
  const style = {}
  return style
})

// 处理方法
const clearTimeouts = () => {
  if (showTimeout) {
    clearTimeout(showTimeout)
    showTimeout = null
  }
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
}

const show = () => {
  if (props.disabled) return
  
  clearTimeouts()
  showTimeout = setTimeout(() => {
    visible.value = true
    emit('update:visible', true)
    emit('show')
    emit('visible-change', true)
    nextTick(updatePosition)
  }, props.showDelay)
}

const hide = () => {
  clearTimeouts()
  hideTimeout = setTimeout(() => {
    visible.value = false
    emit('update:visible', false)
    emit('hide')
    emit('visible-change', false)
  }, props.hideDelay)
}

const handleTriggerClick = () => {
  if (props.disabled || props.trigger !== 'click') return
  visible.value ? hide() : show()
}

const handleMouseEnter = () => {
  if (props.disabled || props.trigger !== 'hover') return
  clearTimeouts()
  showTimeout = setTimeout(show, props.showDelay)
}

const handleMouseLeave = () => {
  if (props.disabled || props.trigger !== 'hover') return
  clearTimeouts()
  hideTimeout = setTimeout(hide, props.hideDelay)
}

const handleFocus = () => {
  if (props.disabled || props.trigger !== 'focus') return
  show()
}

const handleBlur = () => {
  if (props.disabled || props.trigger !== 'focus') return
  hide()
}

const handlePopoverEnter = () => {
  if (props.disabled || props.trigger !== 'hover') return
  clearTimeouts()
}

const handlePopoverLeave = () => {
  if (props.disabled || props.trigger !== 'hover') return
  hide()
}

// 点击外部关闭
const setupClickOutside = () => {
  if (props.trigger !== 'click') return
  
  clickOutsideHandler = (event) => {
    if (!visible.value) return
    if (!containerRef.value?.contains(event.target) && !popoverRef.value?.contains(event.target)) {
      hide()
    }
  }
  
  document.addEventListener('mousedown', clickOutsideHandler)
}

const removeClickOutside = () => {
  if (clickOutsideHandler) {
    document.removeEventListener('mousedown', clickOutsideHandler)
    clickOutsideHandler = null
  }
}

// 定位计算（支持所有12个位置）
const updatePosition = () => {
  if (!visible.value || !triggerRef.value || !popoverRef.value) return
  
  const triggerRect = triggerRef.value.getBoundingClientRect()
  const popoverRect = popoverRef.value.getBoundingClientRect()
  const scrollY = window.scrollY
  const scrollX = window.scrollX
  
  let top = 0
  let left = 0
  
  // 根据位置计算坐标
  const [position, align = 'center'] = props.placement.split('-')
  
  switch (position) {
    case 'top':
      top = triggerRect.top + scrollY - popoverRect.height - props.offset
      left = calculateHorizontalPosition(triggerRect, popoverRect, align)
      break
    case 'bottom':
      top = triggerRect.bottom + scrollY + props.offset
      left = calculateHorizontalPosition(triggerRect, popoverRect, align)
      break
    case 'left':
      left = triggerRect.left + scrollX - popoverRect.width - props.offset
      top = calculateVerticalPosition(triggerRect, popoverRect, align)
      break
    case 'right':
      left = triggerRect.right + scrollX + props.offset
      top = calculateVerticalPosition(triggerRect, popoverRect, align)
      break
  }
  
  // 边界检查
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  // 检查左侧边界
  if (left < 0) left = 10
  
  // 检查右侧边界
  if (left + popoverRect.width > viewportWidth) {
    left = viewportWidth - popoverRect.width - 10
  }
  
  // 检查顶部边界
  if (top < scrollY) top = scrollY + 10
  
  // 检查底部边界
  if (top + popoverRect.height > scrollY + viewportHeight) {
    top = scrollY + viewportHeight - popoverRect.height - 10
  }
  
  popoverRef.value.style.top = `${top}px`
  popoverRef.value.style.left = `${left}px`
}

// 计算水平位置（用于top和bottom位置）
const calculateHorizontalPosition = (triggerRect, popoverRect, align) => {
  const scrollX = window.scrollX
  const isRTL = false // 可根据实际需求检测RTL
  
  switch (align) {
    case 'start':
      return isRTL ? 
        triggerRect.right + scrollX - popoverRect.width : 
        triggerRect.left + scrollX
    case 'end':
      return isRTL ? 
        triggerRect.left + scrollX : 
        triggerRect.right + scrollX - popoverRect.width
    case 'center':
    default:
      return triggerRect.left + scrollX + (triggerRect.width - popoverRect.width) / 2
  }
}

// 计算垂直位置（用于left和right位置）
const calculateVerticalPosition = (triggerRect, popoverRect, align) => {
  const scrollY = window.scrollY
  
  switch (align) {
    case 'start':
      return triggerRect.top + scrollY
    case 'end':
      return triggerRect.bottom + scrollY - popoverRect.height
    case 'center':
    default:
      return triggerRect.top + scrollY + (triggerRect.height - popoverRect.height) / 2
  }
}

// 监听器
watch(() => props.visible, (newVal) => {
  if (newVal !== visible.value) {
    visible.value = newVal
    if (newVal) {
      nextTick(updatePosition)
    }
  }
})

watch(visible, (newVal) => {
  if (newVal) {
    setupClickOutside()
    nextTick(updatePosition)
  } else {
    removeClickOutside()
  }
})

// 生命周期
onMounted(() => {
  if (props.visible) {
    nextTick(updatePosition)
  }
  window.addEventListener('resize', updatePosition)
  window.addEventListener('scroll', updatePosition)
})

onUnmounted(() => {
  clearTimeouts()
  removeClickOutside()
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition)
})

// 暴露方法给父组件
defineExpose({
  show,
  hide,
  updatePosition
})
</script>

<style scoped>
.popover-container {
  display: inline-block;
  position: relative;
}

.popover-trigger {
  display: inline-block;
}

.popover-content {
  position: fixed;
  z-index: 2000;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 12px;
  min-width: 150px;
  max-width: 400px;
  word-wrap: break-word;
}

.popover-header {
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
  font-weight: 600;
  font-size: 14px;
  color: #303133;
}

.popover-body {
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
}

.popover-arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #fff;
  border: 1px solid transparent;
  border-right-color: transparent;
  border-bottom-color: transparent;
  transform: rotate(45deg);
}

.popover-arrow::before {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  background: #fff;
  transform: rotate(45deg);
}

/* 顶部定位样式 */
.popover-content.top-start .popover-arrow {
  bottom: -4px;
  left: 16px;
  transform: rotate(225deg);
}

.popover-content.top .popover-arrow {
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%) rotate(225deg);
}

.popover-content.top-end .popover-arrow {
  bottom: -4px;
  right: 16px;
  transform: rotate(225deg);
}

/* 底部定位样式 */
.popover-content.bottom-start .popover-arrow {
  top: -4px;
  left: 16px;
  transform: rotate(45deg);
}

.popover-content.bottom .popover-arrow {
  top: -4px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
}

.popover-content.bottom-end .popover-arrow {
  top: -4px;
  right: 16px;
  transform: rotate(45deg);
}

/* 左侧定位样式 */
.popover-content.left-start .popover-arrow {
  right: -4px;
  top: 16px;
  transform: rotate(135deg);
}

.popover-content.left .popover-arrow {
  right: -4px;
  top: 50%;
  transform: translateY(-50%) rotate(135deg);
}

.popover-content.left-end .popover-arrow {
  right: -4px;
  bottom: 16px;
  transform: rotate(135deg);
}

/* 右侧定位样式 */
.popover-content.right-start .popover-arrow {
  left: -4px;
  top: 16px;
  transform: rotate(315deg);
}

.popover-content.right .popover-arrow {
  left: -4px;
  top: 50%;
  transform: translateY(-50%) rotate(315deg);
}

.popover-content.right-end .popover-arrow {
  left: -4px;
  bottom: 16px;
  transform: rotate(315deg);
}

/* 过渡动画 */
.popover-fade-enter-active,
.popover-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.popover-fade-enter-from,
.popover-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>