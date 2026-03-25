var __rest = (this && this.__rest) || function(s, e) {
  var t = {}
  for (const p in s) {
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) { t[p] = s[p] }
  }
  if (s != null && typeof Object.getOwnPropertySymbols === 'function') {
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) { t[p[i]] = s[p[i]] }
    }
  }
  return t
}
// 存储错误到 sessionStorage
function saveErrorToSessionStorage(key, data) {
  try {
    if (typeof sessionStorage === 'undefined') return
    sessionStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error('SessionStorage save failed:', e)
  }
}
import { getBytes, getLines, getMessages } from './parse'
export const EventStreamContentType = 'text/event-stream'
const DefaultRetryInterval = 1000
const LastEventId = 'last-event-id'
export function fetchEventSource(input, _a) {
  var { signal: inputSignal, headers: inputHeaders, onopen: inputOnOpen, onmessage, onclose, onerror, openWhenHidden, fetch: inputFetch } = _a; var rest = __rest(_a, ['signal', 'headers', 'onopen', 'onmessage', 'onclose', 'onerror', 'openWhenHidden', 'fetch'])
  return new Promise((resolve, reject) => {
    const headers = Object.assign({}, inputHeaders)
    if (!headers.accept) {
      headers.accept = EventStreamContentType
    }
    let curRequestController
    function onVisibilityChange() {
      curRequestController.abort()
      if (!document.hidden) {
        create()
      }
    }
    if (!openWhenHidden) {
      document.addEventListener('visibilitychange', onVisibilityChange)
    }
    let retryInterval = DefaultRetryInterval
    const retryTimer = 0
    function dispose() {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.clearTimeout(retryTimer)
      curRequestController.abort()
    }
    inputSignal === null || inputSignal === void 0 ? void 0 : inputSignal.addEventListener('abort', () => {
      dispose()
      resolve()
    })
    const fetch = inputFetch !== null && inputFetch !== void 0 ? inputFetch : window.fetch
    const onopen = inputOnOpen !== null && inputOnOpen !== void 0 ? inputOnOpen : defaultOnOpen
    async function create() {
      console.log('create')
      var _a
      curRequestController = new AbortController()
      try {
        const response = await fetch(input, Object.assign(Object.assign({}, rest), { headers, signal: curRequestController.signal }))
        await onopen(response)
        await getBytes(response.body, getLines(getMessages(id => {
          if (id) {
            headers[LastEventId] = id
          } else {
            delete headers[LastEventId]
          }
        }, retry => {
          retryInterval = retry
        }, onmessage)))
        onclose === null || onclose === void 0 ? void 0 : onclose()
        dispose()
        resolve()
      } catch (err) {
        console.log(err, 'err')
        dispose()
        reject({
          msg: 'Request Error'
        })
        const errorKey = `error_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
        // 将错误信息存储到 localStorage
        const errorData = {
          message: err.message,
          stack: err.stack, // 错误堆栈
          component: 'fetch.js', // 组件名
          timestamp: new Date().toISOString()
        }
        // 调用封装的存储方法（见第二步）
        saveErrorToSessionStorage(errorKey, errorData)
        // if (!curRequestController.signal.aborted) {
        //   try {
        //     const interval = (_a = onerror === null || onerror === void 0 ? void 0 : onerror(err)) !== null && _a !== void 0 ? _a : retryInterval
        //     window.clearTimeout(retryTimer)
        //     retryTimer = window.setTimeout(create, interval)
        //   } catch (innerErr) {
        //     dispose()
        //     reject(innerErr)
        //   }
        // }
      }
    }
    create()
  })
}
function defaultOnOpen(response) {
  const contentType = response.headers.get('content-type')
  if (!(contentType === null || contentType === void 0 ? void 0 : contentType.startsWith(EventStreamContentType))) {
    throw new Error(`Expected content-type to be ${EventStreamContentType}, Actual: ${contentType}`)
  }
}
// # sourceMappingURL=fetch.js.map
