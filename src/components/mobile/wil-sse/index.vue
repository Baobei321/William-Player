<template>
  <view class="wil-sse" ref="sseContainer">
    <!-- renderjs需要一个DOM元素来挂载 -->
    <view
      ref="renderTarget"
      :change:connections="renderScript.onConnectionsChange"
      :connections="connectionsMap"
      :change:connectTrigger="renderScript.onConnectTrigger"
      :connectTrigger="connectTrigger"
      :change:disconnectTrigger="renderScript.onDisconnectTrigger"
      :disconnectTrigger="disconnectTrigger"
      style="display: none"
    ></view>
  </view>
</template>

<script>
export default {
  name: 'WilSse',
  props: {
    // 调试日志开关
    debug: {
      type: Boolean,
      default: false,
    },
    // 重连配置
    reconnectAttempts: {
      type: Number,
      default: 5,
    },
    reconnectInterval: {
      type: Number,
      default: 3000,
    },
    responseAdapter: { type: Function }, //接口适配器，将后端返回的数据格式处理成组件需要的数据格式
  },
  data() {
    return {
      // 连接池 { connectionId: connectionData }
      connections: new Map(),
      // 用于renderjs的扁平化数据
      connectionsMap: {},
      // 触发器
      connectTrigger: 0,
      disconnectTrigger: 0,
    }
  },
  methods: {
    /**
     * 创建新SSE连接
     * @param {Object} config 连接配置
     * @param {string} config.connectionId 连接唯一ID
     * @param {string} config.url SSE服务器URL
     * @param {Object} config.headers 请求头
     * @param {string} config.method HTTP方法
     * @param {Object|string} config.body 请求体
     * @returns {boolean} 是否成功
     */
    createConnection(config) {
      const { connectionId, url, headers = {}, method = 'POST', body = null } = config
      console.log(body, 'boyd111')

      if (!connectionId) {
        console.error('connectionId 不能为空')
        return false
      }
      // const connectItem = this.connections.get(connectionId)
      // if (connectItem && (connectItem.status === 'connecting' || connectItem.status === 'connected')) {
      //   console.log('关闭商业给')

      //   //相当于当前会话已经请求后端，但是又发了一次请求，那么中止掉上一次请求，开启新的请求
      //   this.updateConnectionsMap()
      // }

      // if (this.connections.has(connectionId)) {
      //   console.log(`连接 ${connectionId} 已存在，将自动关闭后重新创建`)
      //   this.closeConnection(connectionId)
      // }

      if (!url) {
        console.error('URL不能为空')
        return false
      }

      const connection = {
        id: connectionId,
        url,
        headers,
        method,
        body,
        status: 'initialized',
        reconnectCount: 0,
        lastReconnectTime: null,
        autoReconnect: config.autoReconnect !== false, // 默认开启重连
        autoConnect: config.autoConnect !== false, // 默认自动连接
      }
      this.connections.set(connectionId, connection)
      console.log(`创建连接 ${connectionId}`, connection)
      this.$emit('connectionCreated', { connectionId, config })
      // 自动连接
      if (connection.autoConnect) {
        this.connect(connectionId)
      }
      // this.updateConnectionsMap()
      return true
    },

    /**
     * 连接到指定ID的SSE服务器
     * @param {string} connectionId 连接ID
     * @returns {boolean} 是否成功
     */
    connect(connectionId) {
      const connection = this.connections.get(connectionId)
      if (!connection) {
        console.error(`连接 ${connectionId} 不存在`)
        return false
      }

      if (connection.status === 'connecting' || connection.status === 'connected') {
        console.log(`连接 ${connectionId} 已在连接中`)
        return false
      }

      connection.status = 'connecting'
      connection.error = null
      this.updateConnectionsMap()

      console.log(`开始连接 ${connectionId}`, connection.url)
      this.connectTrigger = Date.now() // 触发renderjs

      this.$emit('connecting', { connectionId, url: connection.url })
      return true
    },

    /**
     * 关闭指定连接
     * @param {string} connectionId 连接ID
     * @returns {boolean} 是否成功
     */
    closeConnection(connectionId) {
      const connection = this.connections.get(connectionId)
      if (!connection) {
        console.error(`连接 ${connectionId} 不存在`)
        return false
      }

      connection.status = 'disconnecting'
      this.updateConnectionsMap()
      console.log(`关闭连接 ${connectionId}`)
      this.disconnectTrigger = Date.now() // 触发renderjs关闭

      this.$emit('connectionClosing', { connectionId })
      return true
    },

    /**
     * 删除连接（完全移除）
     * @param {string} connectionId 连接ID
     */
    deleteConnection(connectionId) {
      this.closeConnection(connectionId)

      // 延迟删除，确保renderjs已关闭
      setTimeout(() => {
        if (this.connections.delete(connectionId)) {
          this.updateConnectionsMap()
          console.log(`删除连接 ${connectionId}`)
          this.$emit('connectionDeleted', { connectionId })
        }
      }, 100)
    },

    /**
     * 获取所有连接状态
     * @returns {Array} 连接状态列表
     */
    getAllConnections() {
      return Array.from(this.connections.values()).map(conn => ({
        id: conn.id,
        url: conn.url,
        status: conn.status,
        connected: conn.status === 'connected',
        connecting: conn.status === 'connecting',
        reconnectCount: conn.reconnectCount,
        lastReconnectTime: conn.lastReconnectTime,
      }))
    },

    /**
     * 获取连接状态
     * @param {string} connectionId 连接ID
     * @returns {Object|null} 连接状态
     */
    getConnectionStatus(connectionId) {
      const conn = this.connections.get(connectionId)
      if (!conn) return null

      return {
        id: conn.id,
        status: conn.status,
        url: conn.url,
        connected: conn.status === 'connected',
        connecting: conn.status === 'connecting',
        reconnectCount: conn.reconnectCount,
        lastReconnectTime: conn.lastReconnectTime,
      }
    },

    /**
     * 批量创建连接
     * @param {Array} connectionConfigs 连接配置数组
     */
    createConnections(connectionConfigs) {
      return connectionConfigs.map(config => ({
        success: this.createConnection(config),
        connectionId: config.connectionId,
      }))
    },

    /**
     * 关闭所有连接
     */
    closeAllConnections() {
      Array.from(this.connections.keys()).forEach(connectionId => {
        this.closeConnection(connectionId)
      })
    },

    /**
     * 删除所有连接
     */
    deleteAllConnections() {
      Array.from(this.connections.keys()).forEach(connectionId => {
        this.deleteConnection(connectionId)
      })
    },

    /**
     * 更新连接配置
     * @param {string} connectionId 连接ID
     * @param {Object} config 新配置
     */
    updateConnection(connectionId, config) {
      const connection = this.connections.get(connectionId)
      if (!connection) {
        console.error(`连接 ${connectionId} 不存在`)
        return false
      }

      Object.assign(connection, config)
      this.updateConnectionsMap()

      console.log(`更新连接 ${connectionId}`, config)
      this.$emit('connectionUpdated', { connectionId, config })

      return true
    },

    /**
     * 内部方法：更新renderjs需要的扁平化数据
     */
    updateConnectionsMap() {
      const map = {}
      this.connections.forEach((conn, id) => {
        map[id] = JSON.parse(JSON.stringify(conn))
      })
      this.connectionsMap = map
    },

    /**
     * 内部方法：处理连接成功（由renderjs调用）
     */
    handleConnected(connectionId) {
      const connection = this.connections.get(connectionId)
      if (!connection) return

      connection.status = 'connected'
      connection.reconnectCount = 0
      connection.lastReconnectTime = null
      // this.updateConnectionsMap()

      console.log(`连接 ${connectionId} 成功`)
      this.$emit('connected', {
        connectionId,
        url: connection.url,
      })
    },

    /**
     * 内部方法：处理连接错误（由renderjs调用）
     */
    handleError(connectionId, error) {
      const connection = this.connections.get(connectionId)
      if (!connection) return

      connection.status = 'error'
      connection.error = error
      connection.lastReconnectTime = Date.now()
      this.updateConnectionsMap()

      console.error(`连接 ${connectionId} 错误`, error)
      this.$emit('error', {
        connectionId,
        error,
        url: connection.url,
      })

      // 自动重连逻辑
      if (connection.autoReconnect && connection.reconnectCount < this.reconnectAttempts) {
        connection.reconnectCount++
        const delay = Math.min(this.reconnectInterval * Math.pow(1.5, connection.reconnectCount - 1), 30000)

        console.log(`连接 ${connectionId} 将在 ${delay}ms 后重连 (${connection.reconnectCount}/${this.reconnectAttempts})`)

        setTimeout(() => {
          if (connection.status === 'error') {
            this.connect(connectionId)
          }
        }, delay)
      } else {
        console.log(`连接 ${connectionId} 已达到最大重连次数`)
        this.$emit('maxReconnectReached', {
          connectionId,
          reconnectCount: connection.reconnectCount,
        })
      }
    },

    /**
     * 内部方法：处理断开连接（由renderjs调用）
     */
    handleDisconnected(connectionId) {
      const connection = this.connections.get(connectionId)
      if (!connection) return

      connection.status = 'disconnected'
      // this.updateConnectionsMap()

      console.log(`连接 ${connectionId} 已断开`)
      this.$emit('disconnected', { connectionId })
    },

    /**
     * 内部方法：处理接收到的消息（由renderjs调用）
     */
    handleMessage(event) {
      const connection = this.connections.get(event.connectionId)
      if (!connection) return

      console.log(`连接 ${event.connectionId} 收到消息`, event)
      let obj = this.responseAdapter(event)
      console.log(
        {
          connectionId: event.connectionId,
          // data: data.data,
          // type: data.type || 'message',
          timestamp: Date.now(),
          ...obj,
        },
        '你好'
      )

      // 发送带连接ID的事件
      this.$emit('message', {
        connectionId: event.connectionId,
        // data: data.data,
        // type: data.type || 'message',
        timestamp: Date.now(),
        ...obj,
      })

      // // 也通过全局事件分发
      // uni.$emit('sseMessage', {
      //   connectionId: event.connectionId,
      //   data: event.data,
      //   type: event.type || 'message',
      //   timestamp: Date.now(),
      //   url: connection.url,
      // })

      // // 单独的连接事件
      // uni.$emit(`sseMessage:${event.connectionId}`, event.data)
    },
  },

  beforeDestroy() {
    this.closeAllConnections()
  },
}
</script>

<script module="renderScript" lang="renderjs">
// renderjs部分，管理多个连接
let fetchEventSource = null

async function loadFetchEventSource() {
  if (fetchEventSource) return fetchEventSource
  try {
    if (typeof window !== 'undefined' && window.fetchEventSource) {
      fetchEventSource = window.fetchEventSource
      return fetchEventSource
    }
    const module = await import('@/utils/fetchEventSource/index.js')
    fetchEventSource = module.fetchEventSource
    console.log('RenderJS: fetch-event-source 加载成功')
    return fetchEventSource
  } catch (error) {
    console.error('RenderJS: 加载 fetch-event-source 失败', error)
    return null
  }
}

export default {
  data() {
    return {
      // 连接池 { connectionId: { controller, config } }
      connectionsRender: new Map(),
      debugMode: false
    }
  },
  methods: {
    // 连接配置变化
    onConnectionsChange(newValue, oldValue, ownerInstance, instance) {
      console.log('连接配置变化', newValue,oldValue)
      // 对比新旧连接配置，更新连接池
      this.updateConnections(newValue, oldValue, ownerInstance)
    },

    // 连接触发器
    onConnectTrigger(newValue, oldValue, ownerInstance, instance) {
      if (newValue && newValue !== oldValue) {
        console.log('收到连接触发器', newValue)
        // 这里不直接触发连接，连接由updateConnections处理
      }
    },

    // 断开连接触发器
    async onDisconnectTrigger(newValue, oldValue, ownerInstance, instance) {
      if (newValue && newValue !== oldValue) {
        console.log('收到断开连接触发器', newValue)
        // 这里不直接触发断开，断开由updateConnections处理
      }
    },

    // 更新连接池
    async updateConnections(connectionsMap,oldValue, ownerInstance) {
      const newConnections = new Map(Object.entries(JSON.parse(JSON.stringify(connectionsMap)) || {}))
      const currentIds = Array.from(this.connectionsRender.keys())
      const newIds = Array.from(newConnections.keys())

      // 找出需要删除的连接
      for (const id of currentIds) {
        if (!newConnections.has(id)) {
          await this.stopConnection(id, ownerInstance)
        }
      }

      // 找出需要启动/更新的连接
      for (const [id, config] of newConnections) {

        const currentConn = this.connectionsRender.get(id)
        console.log(config.status,currentConn?.status,'staut');

          // 新连接
          if (config.status === 'connecting'||config.status==='connected') {
            await this.startConnection(id, config, ownerInstance)
          }
      }
    },

    // 启动单个连接
    async startConnection(connectionId, config, ownerInstance) {
      console.log(`启动连接 ${connectionId}`, config)
      // 如果已存在，先停止
      let connectItem = this.connectionsRender.get(connectionId)
      console.log(this.connectionsRender.get(connectionId)?.status,'das1');
      if (connectItem&&(connectItem.status==='connecting'||connectItem.status==='connected')) {
        await this.stopConnection(connectionId, ownerInstance)
      }

      const abortController = new AbortController()
      const connection = {
        controller: abortController,
        config: { ...config },
        status: 'connecting'
      }

      this.connectionsRender.set(connectionId, connection)
      console.log(this.connectionsRender.has(connectionId),'das2');


      try {
        const fes = await loadFetchEventSource()
        if (fes) {
          await this.connectWithFetchEventSource(connectionId, config, abortController, ownerInstance)
        } else {
          this.connectWithEventSource(connectionId, config, ownerInstance)
        }
      } catch (error) {
        console.error(`连接 ${connectionId} 启动失败`, error)
        ownerInstance.callMethod('handleError', connectionId, {
          message: error.message || '连接启动失败',
          timestamp: Date.now()
        })
      }
    },

    // 停止单个连接
    async stopConnection(connectionId, ownerInstance) {
      const connection = this.connectionsRender.get(connectionId)
      if (!connection) return

      console.log(`停止连接 ${connectionId}`)
      console.log('停止连接');

      if (connection.controller) {
        connection.controller.abort()
      }

      if (connection.eventSource) {
        connection.eventSource.close()
      }

      // this.connectionsRender.delete(connectionId)
      ownerInstance.callMethod('handleDisconnected', connectionId)
    },

    // 使用fetch-event-source连接
    async connectWithFetchEventSource(connectionId, config, abortController, ownerInstance) {
      const headers = {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        ...config.headers
      }

      const fetchOptions = {
        method: config.method || 'GET',
        headers: headers,
        signal: abortController.signal,
      }

      if (config.method === 'POST' && config.body) {
        if (typeof config.body === 'string') {
          fetchOptions.body = config.body
        } else {
          fetchOptions.body = JSON.stringify(config.body)
          if (!headers['Content-Type']) {
            headers['Content-Type'] = 'application/json'
          }
        }
      }

      const fes = await loadFetchEventSource()
      if (!fes) {
        throw new Error('fetch-event-source 加载失败')
      }

      await fes(config.url, {
        ...fetchOptions,
        openWhenHidden: true,
        onopen: async (response) => {
          if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
            const conn = this.connectionsRender.get(connectionId)
            if (conn) conn.status = 'connected'
            ownerInstance.callMethod('handleConnected', connectionId)
            return
          } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            throw new Error(`客户端错误: ${response.status}`)
          } else {
            throw new Error(`服务器错误: ${response.status}`)
          }
        },

        onmessage: (event) => {
          console.log(event,'event');

          try {
            const data = JSON.parse(event.data)
            event.data = data
            ownerInstance.callMethod('handleMessage', {connectionId,...event})
          } catch (e) {
            ownerInstance.callMethod('handleMessage', {connectionId,...event})
          }
        },

        onerror: (error) => {
          if (error.name === 'AbortError') {
            ownerInstance.callMethod('handleDisconnected', connectionId)
            return
          }
          ownerInstance.callMethod('handleError', connectionId, {
            message: error.message || '连接错误',
            timestamp: Date.now()
          })
        },

        onclose: () => {
          this.connectionsRender.get(connectionId).status = 'disconnected'
          ownerInstance.callMethod('handleDisconnected', connectionId)
        }
      })
    },

    // 使用原生EventSource连接
    connectWithEventSource(connectionId, config, ownerInstance) {
      let urlWithToken = config.url
      if (config.headers?.Authorization) {
        const token = config.headers.Authorization.replace('Bearer ', '')
        const separator = urlWithToken.includes('?') ? '&' : '?'
        urlWithToken += `${separator}token=${encodeURIComponent(token)}`
      }

      const eventSource = new EventSource(urlWithToken)
      const connection = this.connectionsRender.get(connectionId)
      if (connection) {
        connection.eventSource = eventSource
      }

      eventSource.onopen = () => {
        const conn = this.connectionsRender.get(connectionId)
        if (conn) conn.status = 'connected'
        ownerInstance.callMethod('handleConnected', connectionId)
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          event.data = data
          ownerInstance.callMethod('handleMessage', {connectionId,...event})
        } catch (e) {
          ownerInstance.callMethod('handleMessage', {connectionId,...event})
        }
      }

      eventSource.onerror = (event) => {
        let errorMessage = 'EventSource 连接错误'
        if (event.target.readyState === EventSource.CLOSED) {
          errorMessage = '连接已关闭'
        } else if (event.target.readyState === EventSource.CONNECTING) {
          errorMessage = '正在重连'
        }

        ownerInstance.callMethod('handleError', connectionId, {
          message: errorMessage,
          readyState: event.target.readyState,
          timestamp: Date.now()
        })
      }
    }
  }
}
</script>

<style scoped>
.wil-sse {
  display: block;
  width: 0;
  height: 0;
  overflow: hidden;
}
</style>
