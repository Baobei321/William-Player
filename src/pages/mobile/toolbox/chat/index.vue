<template>
  <div class="ai-chat">
    <view class="chat-box">
      <t-chat-list id="chatList">
        <t-chat-message
          :chat-id="item.chatId"
          :avatar="item.avatar || ''"
          :name="item.name || ''"
          :datetime="item.datetime || ''"
          :content="item.content"
          :role="item.role"
          :placement="item.role === 'user' ? 'right' : 'left'"
          :status="item.status || ''"
          @message-longpress="showPopover"
          v-for="(item, index) in chatList"
          :key="item.chatId"
        >
          <template #actionbar>
            <t-chat-actionbar
              v-if="index !== chatList.length - 1 && item.status === 'complete' && item.role === 'assistant'"
              :ref="`actionbar-${item.chatId}`"
              :chat-id="`actionbar-${item.chatId}`"
              :comment="item.comment"
              @actions="handleAction"
            />
          </template>
        </t-chat-message>
        <!-- <div @click="sendMessage">点击发送</div> -->
        <template #footer>
          <t-chat-sender
            v-model:value="inputValue"
            :loading="sendLoading"
            :disabled="disabledInput"
            :auto-rise-with-keyboard="true"
            :render-presets="renderPresets"
            placeholder="请输入您的问题..."
            @send="sendMessage"
          />
        </template>
      </t-chat-list>
      <!-- 长按弹出操作栏 -->
      <t-chat-actionbar ref="popoverActionbar" class="popover-actionbar" placement="longpress" :action-bar="['quote', 'copy', 'share']" @actions="handlePopoverAction" />
      <!-- 内置虚拟列表优化性能仅在data属性中使用 -->
      <!-- <TChatList id="chatList" bindscroll="onScroll" data="{{chatList}}"></TChatList> -->
    </view>
    <t-toast ref="t-toast" />
    <!-- 通过renderjs用于接收sse的消息 -->
    <wil-sse
      ref="wil_sse"
      :responseAdapter="responseAdapter"
      @connecting="handleConnecting"
      @connected="handleConnected"
      @message="handleMessage"
      @error="handleError"
      @disconnected="handleDisconnected"
      @connectionCreated="handleConnectionCreated"
      @connectionDeleted="handleConnectionDeleted"
    />
  </div>
</template>

<script setup>
import TChatMessage from '@tdesign/uniapp-chat/chat-message/chat-message.vue'
import TChatList from '@tdesign/uniapp-chat/chat-list/chat-list.vue'
import TChatSender from '@tdesign/uniapp-chat/chat-sender/chat-sender.vue'
import TChatActionbar from '@tdesign/uniapp-chat/chat-actionbar/chat-actionbar.vue'
import TToast from '@tdesign/uniapp/toast/toast.vue'
import Toast from '@tdesign/uniapp/toast/index'
import wilSse from '@/components/mobile/wil-sse/index.vue'
import { ref } from 'vue'

let uniqueId = 0
const wil_sse = ref(null)
const chatList = ref([])
const inputValue = ref('')
const sendLoading = ref(false) //发送按钮是否在加载中
const disabledInput = ref(false) //是否禁用输入框
const connectionConfigs = ref({
  connectionId: 'chat1',
  // url: 'https://apis.iflow.cn/v1/chat/completions',
  url: 'http://10.55.133.230:4040/ruoyi/diary/stream',
  headers: {
    Authorization: uni.getStorageSync('Authorization'),
    'Content-Type': 'application/json',
  },
  method: 'POST',
  autoConnect: true,
  autoReconnect: true,
  body: {},
})

const renderPresets = [
  {
    name: 'send',
    type: 'icon',
  },
]

const responseAdapter = event => {
  if (event) {
    return {
      id: event.data.id,
      content: event.data?.choices?.[0]?.delta?.content || '',
      type: event.data.type || 'markdown',
    }
  } else {
    return {}
  }
}
const sendMessage = () => {
  if (!wil_sse.value) return
  // 创建用户消息对象
  const userMessage = {
    role: 'user',
    chatId: getUniqueKey(),
    content: [
      {
        type: 'text',
        data: inputValue.value.trim(),
      },
    ],
  }
  const aiMessage = {
    role: 'assistant',
    chatId: getUniqueKey(),
    comment: '',
    content: [
      {
        type: 'markdown',
        data: '',
      },
    ],
    avatar: 'https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/samantha/logo-icon-white-bg.png',
    status: 'pending',
  }
  // 将用户消息插入到chatList的开头（因为reverse为true，所以用unshift）
  chatList.value = [aiMessage, userMessage, ...chatList.value]
  connectionConfigs.value.body = {
    content: inputValue.value.trim(),
  }
  console.log(connectionConfigs.value, 'boyd11')

  inputValue.value = ''
  sendLoading.value = true //此时ai正在输出中，所以按钮加载中
  wil_sse.value.createConnection(connectionConfigs.value)
}
const getUniqueKey = () => {
  uniqueId += 1
  console.log(`key-${uniqueId}`)

  return `key-${uniqueId}`
}

const handleMessage = message => {
  chatList.value[0].status = 'streaming'
  // if (!sendLoading.value) return
  chatList.value[0].content[0].data += message.content
  console.log('发过来')
}

//关闭连接，也就是ai回答完成
const handleDisconnected = () => {
  console.log('发过来关闭')

  sendLoading.value = false
}
</script>
<style lang="scss" scoped>
page {
  width: 100%;
  height: 100%;
}
.ai-chat {
  width: 100%;
  height: 100%;
  .chat-box {
    padding-top: 32rpx;
    box-sizing: border-box;
    height: 100%;
    :deep(.t-chat-list) {
      box-sizing: border-box;
      .t-chat-message {
        padding: 0 32rpx;
        .t-chat-content {
          // width: 100%;
          max-width: 100%;
        }
      }
    }
  }
}
</style>
