import { watch, ref } from 'vue';
import { useThemeStore } from '@/stores/theme';
import { useLocaleStore } from '@/stores/locale';
import { onShow } from '@dcloudio/uni-app';

export function useThemeTabbar(options) {
  const themeStore = useThemeStore();
  const localeStore = useLocaleStore();
  const currentTheme = ref(themeStore.getResolvedTheme());
  const options1 = options || { customNav: false };

  const applyTabbar = () => {
    const theme = themeStore.getResolvedTheme();
    currentTheme.value = theme;

    if (theme === 'dark') {
      if (options1.customNav) {
        uni.setNavigationBarColor({
          frontColor: '#ffffff',
          backgroundColor: 'transparent',
        });
      }

      uni.setTabBarStyle({
        backgroundColor: '#1e1e20',
        borderStyle: 'black',
      });
    } else {
      if (options1.customNav) {
        uni.setNavigationBarColor({
          frontColor: '#000000',
          backgroundColor: 'transparent',
        });
      }

      uni.setTabBarStyle({
        backgroundColor: '#ffffff',
        borderStyle: 'white',
      });
    }

    if (localeStore.tabBarTextDirty) {
      localeStore.applyTabBarText();
    }
  };

  onShow(applyTabbar);

  watch(
    () => themeStore.resolvedTheme,
    applyTabbar,
    { immediate: true }
  );

  return { currentTheme };
}
