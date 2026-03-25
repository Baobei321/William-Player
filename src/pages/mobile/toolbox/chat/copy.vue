<template>
  <div class="ai-chat">
    <view class="chat-box">
      <t-chat-list id="chatList" @scroll="e => onScroll(e, { tagId: 'chatList' })">
        <block v-for="(item, index) in chatList" :key="item.chatId">
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
        </block>

        <template #footer>
          <t-chat-sender
            v-model:value="inputValue"
            :loading="sendLoading"
            :disabled="disabledInput"
            :auto-rise-with-keyboard="true"
            :render-presets="renderPresets"
            placeholder="请输入您的问题..."
            @send="onSend"
            @stop="onStop"
            @focus="onFocus"
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
      @message="sendMessage"
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

let uniqueId = 0
const wil_sse = ref(null)
const chatList = ref([])
const inputValue = ref('')
const sendLoading = ref(false) //发送按钮是否在加载中
const disabledInput = ref(false) //是否禁用输入框
const connectionConfigs = ref({
  connectionId: 'chat1',
  url: 'https://apis.iflow.cn/v1/chat/completions',
  headers: {
    Authorization: 'Bearer sk-22a1f4b6c537d3f1aa5a2f29297e2fbc',
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

const responseAdapter = chunk => {}
const sendMessage = () => {
  if (!wil_sse.value) return
  // 创建用户消息对象
  const userMessage = {
    role: 'user',
    chatId: getUniqueKey(),
    content: [
      {
        type: 'text',
        data: value.trim(),
      },
    ],
  }
  // 将用户消息插入到chatList的开头（因为reverse为true，所以用unshift）
  chatList.value = [userMessage, ...chatList.value]
  connectionConfigs.value.body = {
    model: 'tstars2.0',
    messages: [{ role: 'user', content: '写一个快速排序算法的 Python 实现' }],
    temperature: 0.7,
    max_tokens: 1000,
    stream: true,
  }
  wil_sse.value.createConnection(connectionConfigs.value)
}
const getUniqueKey = () => {
  uniqueId += 1
  return `key-${uniqueId}`
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
    .t-chat__list {
      padding: 0 0 0 32rpx;
      box-sizing: border-box;
    }

    .t-chat-message {
      padding: 0 32rpx;
    }
  }
}
</style>
