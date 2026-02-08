<!-- src/components/MessageBox/index.vue -->
<template>
  <transition name="messagebox-fade">
    <div v-if="visible" class="messagebox-wrapper" @click.self="handleWrapperClick">
      <div class="messagebox" :style="{ width: width }">
        <!-- 头部 -->
        <div class="messagebox-header" v-if="title || showClose">
          <span class="messagebox-title">{{ title }}</span>
          <wil-svg iconClass="close-window" color="#9B9B9B" v-if="showClose" @click="handleClose"></wil-svg>
        </div>

        <!-- 内容区域 -->
        <div class="messagebox-content">
          <!-- 图标 -->
          <div v-if="type" class="messagebox-status" :class="typeClass">
            <svg class="icon" :viewBox="typeIcon[type].viewBox" width="16" height="16">
              <path :d="typeIcon[type].path" fill="currentColor"></path>
            </svg>
          </div>

          <!-- 消息内容 -->
          <div class="messagebox-message">
            <div v-if="dangerouslyUseHTMLString" v-html="message"></div>
            <div v-else>{{ message }}</div>

            <!-- 输入框（prompt模式） -->
            <div v-if="showInput" class="messagebox-input">
              <input v-model="inputValue" :type="inputType" :placeholder="inputPlaceholder" class="messagebox-input-inner" ref="inputRef" @keyup.enter="handleEnter" />
              <div v-if="inputErrorMessage" class="messagebox-errormessage">
                {{ inputErrorMessage }}
              </div>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="messagebox-btns">
          <nut-button :type="props.cancelButtonType" v-if="showCancelButton" @click="handleCancel">
            {{ cancelButtonText }}
          </nut-button>
          <nut-button :type="props.confirmButtonType" v-if="showConfirmButton" @click="handleConfirm" :disabled="confirmButtonDisabled">
            {{ confirmButtonText }}
          </nut-button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import wilSvg from '@/components/electron/wil-svg/index.vue'

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: '', // 'success', 'warning', 'info', 'error'
    validator: val => ['', 'success', 'warning', 'info', 'error'].includes(val),
  },
  showInput: {
    type: Boolean,
    default: false,
  },
  inputType: {
    type: String,
    default: 'text',
  },
  inputValue: {
    type: String,
    default: '',
  },
  inputPlaceholder: {
    type: String,
    default: '',
  },
  inputValidator: {
    type: Function,
    default: null,
  },
  inputErrorMessage: {
    type: String,
    default: '',
  },
  showConfirmButton: {
    type: Boolean,
    default: true,
  },
  showCancelButton: {
    type: Boolean,
    default: true,
  },
  confirmButtonText: {
    type: String,
    default: '确定',
  },
  cancelButtonText: {
    type: String,
    default: '取消',
  },
  confirmButtonType: {
    type: String,
    default: 'info',
    validator: val => ['primary', 'success', 'warning', 'danger', 'info', 'text'].includes(val),
  },
  cancelButtonType: {
    type: String,
    default: 'default',
    validator: val => ['', 'primary', 'success', 'warning', 'danger', 'info', 'text'].includes(val),
  },
  confirmButtonDisabled: {
    type: Boolean,
    default: false,
  },
  showClose: {
    type: Boolean,
    default: true,
  },
  width: {
    type: String,
    default: '420px',
  },
  dangerouslyUseHTMLString: {
    type: Boolean,
    default: false,
  },
  closeOnClickModal: {
    type: Boolean,
    default: true,
  },
  closeOnPressEscape: {
    type: Boolean,
    default: true,
  },
  beforeClose: {
    type: Function,
    default: null,
  },
})

const emit = defineEmits(['confirm', 'cancel', 'close', 'update:inputValue', 'update:visible'])

const visible = ref(false)
const inputValue = ref(props.inputValue)
const inputRef = ref(null)
const inputErrorMessage = ref('')

// 类型图标配置
const typeIcon = {
  success: {
    viewBox: '0 0 1024 1024',
    path: 'M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 0 1-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.4 12.7z',
  },
  warning: {
    viewBox: '0 0 1024 1024',
    path: 'M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m0 192a58.43 58.43 0 0 0-58.24 63.744l23.36 256.384a35.072 35.072 0 0 0 69.76 0l23.296-256.384A58.43 58.43 0 0 0 512 256m0 512a51.2 51.2 0 1 0 0-102.4 51.2 51.2 0 0 0 0 102.4',
  },
  info: {
    viewBox: '0 0 1024 1024',
    path: 'M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm32 664c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V456c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272zm-32-344a48.01 48.01 0 0 1 0-96 48.01 48.01 0 0 1 0 96z',
  },
  error: {
    viewBox: '0 0 1024 1024',
    path: 'M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm165.4 618.2l-70-69.8c-4.7-4.7-12.3-4.7-17 0L512 602.7l-78.4 78.5c-4.7 4.7-12.3 4.7-17 0l-70-69.8c-4.7-4.7-4.7-12.3 0-17l78.4-78.5-78.4-78.5c-4.7-4.7-4.7-12.3 0-17l70-69.8c4.7-4.7 12.3-4.7 17 0l78.4 78.5 78.4-78.5c4.7-4.7 12.3-4.7 17 0l70 69.8c4.7 4.7 4.7 12.3 0 17L601.5 512l78.4 78.5c4.8 4.7 4.8 12.3.1 17z',
  },
}

// 计算属性
const typeClass = computed(() => {
  return props.type ? `is-${props.type}` : ''
})

const confirmButtonClasses = computed(() => {
  return ['messagebox-btn', 'messagebox-confirm', props.confirmButtonType ? `btn-${props.confirmButtonType}` : '']
})

const cancelButtonClasses = computed(() => {
  return ['messagebox-btn', 'messagebox-cancel', props.cancelButtonType ? `btn-${props.cancelButtonType}` : '']
})

// 方法
const handleWrapperClick = () => {
  if (props.closeOnClickModal) {
    handleClose()
  }
}

const handleClose = async () => {
  if (props.beforeClose) {
    const result = await props.beforeClose('close')
    if (result === false) return
  }
  emit('close')
  close()
}

const handleCancel = async () => {
  if (props.beforeClose) {
    const result = await props.beforeClose('cancel')
    if (result === false) return
  }
  emit('cancel')
  close()
}

const handleConfirm = async () => {
  if (props.showInput && props.inputValidator) {
    const validResult = await props.inputValidator(inputValue.value)
    if (typeof validResult === 'string') {
      inputErrorMessage.value = validResult
      return
    } else if (validResult === false) {
      return
    }
  }

  if (props.beforeClose) {
    const result = await props.beforeClose('confirm')
    if (result === false) return
  }
  emit('confirm', props.showInput ? inputValue.value : null)
  if (props.showInput) {
    emit('update:inputValue', inputValue.value)
  }
  close()
}

const handleEnter = () => {
  handleConfirm()
}

const open = () => {
  visible.value = true
  if (props.showInput) {
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
}

const close = () => {
  visible.value = false
  inputErrorMessage.value = ''
}

// 监听属性变化
watch(
  () => props.inputValue,
  val => {
    inputValue.value = val
  }
)

// 挂载时打开
onMounted(() => {
  open()
})

// 定义方法供外部调用
defineExpose({
  open,
  close,
})
</script>

<style lang="scss" scoped>
.messagebox-wrapper {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.5);
  transition: opacity 0.3s ease;

  &:after {
    content: '';
    display: inline-block;
    height: 100%;
    width: 0;
    vertical-align: middle;
  }

  .messagebox {
    display: inline-block;
    width: 840rpx;
    padding: 24rpx;
    vertical-align: middle;
    background-color: #fff;
    border-radius: 16rpx;
    border: 2rpx solid #ebeef5;
    font-size: 36rpx;
    box-shadow: 0 4rpx 24rpx 0 rgba(0, 0, 0, 0.1);
    text-align: left;
    overflow: hidden;
    backface-visibility: hidden;
    transition: all 0.3s ease;

    .messagebox-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .messagebox-title {
        font-size: 36rpx;
        line-height: 1;
        color: #303133;
        font-weight: 600;
      }

      :deep(.wil-svg) {
        cursor: pointer;

        &:hover {
          use {
            fill: #409eff;
          }
        }
      }
    }

    .messagebox-content {
      //   padding: 40rpx 40rpx 20rpx;
      margin-top: 24rpx;
      color: #606266;
      font-size: 32rpx;
      display: flex;
      align-items: center;

      .messagebox-status {
        width: 48rpx;
        height: 48rpx;
        margin-right: 20rpx;
        flex-shrink: 0;

        &.is-success {
          color: #67c23a;
        }

        &.is-warning {
          color: #e6a23c;
        }

        &.is-info {
          color: #909399;
        }

        &.is-error {
          color: #f56c6c;
        }
        .icon {
          width: 48rpx;
          height: 48rpx;
        }
      }

      .messagebox-message {
        flex: 1;
        margin: 0;
        line-height: 1.5;
        word-break: break-word;
        font-size: 28rpx;

        .messagebox-input {
          padding-top: 30rpx;

          .messagebox-input-inner {
            display: block;
            width: 100%;
            padding: 16rpx 30rpx;
            font-size: inherit;
            line-height: 1.5;
            color: #606266;
            background-color: #fff;
            background-image: none;
            border: 2rpx solid #dcdfe6;
            border-radius: 8rpx;
            transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
            box-sizing: border-box;
            outline: none;

            &:focus {
              border-color: #409eff;
            }
          }

          .messagebox-errormessage {
            color: #f56c6c;
            font-size: 24rpx;
            min-height: 36rpx;
            margin-top: 4rpx;
          }
        }
      }
    }

    .messagebox-btns {
      padding-top: 24rpx;
      text-align: right;
      :deep(.nut-button) {
        border-radius: 8rpx;
        margin-left: 24rpx;
        line-height: initial;
        height: 64rpx;
        &.nut-button--default {
          border: 2rpx solid rgb(204, 204, 204) !important;
        }
        &.nut-button--primary {
          background: #409eff;
        }
      }
    }
  }
}

/* 动画效果 */
.messagebox-fade-enter-active {
  animation: messagebox-fade-in 0.3s;
}

.messagebox-fade-leave-active {
  animation: messagebox-fade-out 0.3s;
}

@keyframes messagebox-fade-in {
  0% {
    transform: translate3d(0, -40rpx, 0);
    opacity: 0;
  }
  100% {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
}

@keyframes messagebox-fade-out {
  0% {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
  100% {
    transform: translate3d(0, -40rpx, 0);
    opacity: 0;
  }
}
</style>