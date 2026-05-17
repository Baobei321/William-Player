import { watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'

export function useI18nNavbar(titleKey) {
  const { t, locale } = useI18n()

  const setTitle = () => {
    if (!titleKey) return
    uni.setNavigationBarTitle({ title: t(titleKey) })
  }

  onShow(setTitle)
  watch(locale, setTitle)
}
