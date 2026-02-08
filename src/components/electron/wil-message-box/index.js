import { createApp, h, ref, nextTick } from 'vue'
import MessageBox from './index.vue'

// 存储MessageBox实例
let messageBoxInstance = null
let appInstance = null
let container = null

// 销毁MessageBox实例
const destroyMessageBox = () => {
  if (appInstance) {
    // 先卸载应用
    appInstance.unmount()
    appInstance = null
  }
  if (container && container.parentNode) {
    // 延迟移除DOM，确保动画完成
    setTimeout(() => {
      container.parentNode.removeChild(container)
      container = null
    }, 300) // 等待动画完成（假设动画是300ms）
  }
  messageBoxInstance = null
}

// 创建MessageBox实例
const createMessageBox = (options) => {
  return new Promise((resolve, reject) => {
    // 如果已存在实例，先销毁
    if (messageBoxInstance) {
      destroyMessageBox()
    }
    
    // 创建div容器
    container = document.createElement('div')
    document.body.appendChild(container)
    
    // 创建响应式数据
    const visible = ref(true)
    const inputValue = ref(options.inputValue || '')
    
    // 关闭处理函数
    const handleClose = (result, type = 'close') => {
      // 先隐藏组件
      visible.value = false
      
      // 等待动画完成后销毁
      setTimeout(() => {
        destroyMessageBox()
        if (type === 'confirm') {
          resolve(result)
        } else {
          reject(new Error(type === 'cancel' ? '用户取消' : '用户关闭'))
        }
      }, 300) // 等待动画时间
    }
    
    // 创建Vue应用
    appInstance = createApp({
      render() {
        return h(MessageBox, {
          visible: visible.value,
          title: options.title || '提示',
          message: options.message,
          type: options.type || '',
          showInput: options.showInput || false,
          inputType: options.inputType || 'text',
          inputPlaceholder: options.inputPlaceholder || '请输入',
          inputValue: inputValue.value,
          inputPattern: options.inputPattern,
          inputErrorMessage: options.inputErrorMessage || '输入内容不符合要求',
          showCancelButton: options.showCancelButton !== false,
          confirmButtonText: options.confirmButtonText || '确定',
          cancelButtonText: options.cancelButtonText || '取消',
          showClose: options.showClose !== false,
          width: options.width || '420px',
          overlayClickClose: options.overlayClickClose !== false,
          'onUpdate:visible': (val) => {
            visible.value = val
            if (!val) {
              handleClose(null, 'close')
            }
          },
          onConfirm: (value) => {
            handleClose(value || true, 'confirm')
          },
          onCancel: () => {
            handleClose(null, 'cancel')
          },
          onClose: () => {
            handleClose(null, 'close')
          }
        })
      }
    })
    
    // 挂载
    messageBoxInstance = appInstance.mount(container)
    
    // 返回销毁函数
    return () => {
      handleClose(null, 'close')
    }
  })
}

// 确认框
const confirm = (options) => {
  const config = typeof options === 'string' 
    ? { message: options, type: 'warning' }
    : { type: 'warning', ...options }
  
  return createMessageBox({
    ...config,
    showCancelButton: true,
    confirmButtonText: config.confirmButtonText || '确认',
    cancelButtonText: config.cancelButtonText || '取消'
  })
}

// 提示框
const alert = (options) => {
  const config = typeof options === 'string' 
    ? { message: options, type: 'info' }
    : { type: 'info', ...options }
  
  return createMessageBox({
    ...config,
    showCancelButton: false,
    confirmButtonText: config.confirmButtonText || '确定'
  })
}

// 输入框
const prompt = (options) => {
  const config = typeof options === 'string' 
    ? { message: options, type: 'info' }
    : { type: 'info', ...options }
  
  return createMessageBox({
    ...config,
    showCancelButton: true,
    showInput: true,
    confirmButtonText: config.confirmButtonText || '确认',
    cancelButtonText: config.cancelButtonText || '取消'
  })
}

// 成功提示
const success = (options) => {
  const config = typeof options === 'string' 
    ? { message: options }
    : options
  
  return createMessageBox({
    ...config,
    type: 'success',
    showCancelButton: false,
    confirmButtonText: config.confirmButtonText || '确定'
  })
}

// 错误提示
const error = (options) => {
  const config = typeof options === 'string' 
    ? { message: options }
    : options
  
  return createMessageBox({
    ...config,
    type: 'error',
    showCancelButton: false,
    confirmButtonText: config.confirmButtonText || '确定'
  })
}

// 警告提示
const warning = (options) => {
  const config = typeof options === 'string' 
    ? { message: options }
    : options
  
  return createMessageBox({
    ...config,
    type: 'warning',
    showCancelButton: false,
    confirmButtonText: config.confirmButtonText || '确定'
  })
}

// 信息提示
const info = (options) => {
  const config = typeof options === 'string' 
    ? { message: options }
    : options
  
  return createMessageBox({
    ...config,
    type: 'info',
    showCancelButton: false,
    confirmButtonText: config.confirmButtonText || '确定'
  })
}

// 自定义配置
const custom = (options) => {
  return createMessageBox(options)
}

// 创建Vue插件
const MessageBoxPlugin = {
  install(app) {
    const messageBox = {
      confirm,
      alert,
      prompt,
      success,
      error,
      warning,
      info,
      custom
    }
    
    // 挂载到全局属性
    app.config.globalProperties.$messageBox = messageBox
    
    // 同时提供独立的导入方式
    app.provide('messageBox', messageBox)
  }
}

// 导出插件和独立方法
export default MessageBoxPlugin
export const WilMessageBox = {
  confirm,
  alert,
  prompt,
  success,
  error,
  warning,
  info,
  custom
}