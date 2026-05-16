import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

export function useThemeClass() {
  const themeStore = useThemeStore()

  return computed(() => ({
    dark: themeStore.getResolvedTheme() === 'dark',
  }))
}
