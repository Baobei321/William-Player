import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'
import koKR from './ko-KR'
import jaJP from './ja-JP'
import { interpolateTemplate } from './utils'

const i18n = createI18n({
  legacy: false,
  locale: 'zh-Hans',
  fallbackLocale: 'zh-Hans',
  messages: {
    'zh-Hans': zhCN,
    en: enUS,
    ko: koKR,
    ja: jaJP,
  },
})

// 扩展 t 函数，支持对象参数插值（解决 App 端不支持命名参数插值的问题）
const originalT = i18n.global.t
i18n.global.t = function (key, values) {
  const result = originalT(key)
  if (values && typeof values === 'object' && !Array.isArray(values)) {
    return interpolateTemplate(result, values)
  }
  return result
}

export default i18n
export { i18n }
