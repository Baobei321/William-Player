import { computed } from 'vue';
import { useThemeStore } from '@/stores/theme';

// JS 层面的主题感知计算属性，用于 custom-color 等无法使用 CSS 变量的场景
export function useThemeColors() {
  const themeStore = useThemeStore();
  const isDark = computed(() => themeStore.resolvedTheme === 'dark');

  return {
    isDark,
    // 主操作按钮颜色（浅色下深色按钮，深色下白色按钮）
    primaryBtnColor: computed(() => (isDark.value ? '#ffffff' : '#090909')),
    primaryBtnTextColor: computed(() => (isDark.value ? '#090909' : '#ffffff')),
    textSecondaryColor: computed(() => (isDark.value ? '#e0e0e0' : '#353a45')),
    textPlaceholderColor: computed(() => (isDark.value ? '#707070' : '#bbbbbb')),
    successColor: computed(() => '#00c286'),
    dangerColor: computed(() => '#fe4344'),
    // 图标颜色（浅色下黑色，深色下白色）
    iconColor: computed(() => (isDark.value ? '#ffffff' : '#000000')),
    // 弱化的图标颜色
    iconColorMuted: computed(() => (isDark.value ? '#ffffff' : '#bbbbbb')),
  };
}
