import { watch, ref } from 'vue';
import { useThemeStore } from '@/stores/theme';
import { onShow } from '@dcloudio/uni-app';

export function useThemeNavbar(options) {
  const themeStore = useThemeStore();
  const currentTheme = ref(themeStore.getResolvedTheme());
  const variant = options?.variant || 'default';

  const applyNavbar = () => {
    currentTheme.value = themeStore.getResolvedTheme();
    themeStore.applyNavigationBar(variant);
  };

  onShow(applyNavbar);

  watch(
    () => themeStore.resolvedTheme,
    applyNavbar,
    { immediate: true }
  );

  return { currentTheme };
}
