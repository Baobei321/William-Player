import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'
import koKR from './ko-KR'
import jaJP from './ja-JP'

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

export default i18n
export { i18n }
