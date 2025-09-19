import { watch, ref } from 'vue';
import { useThemeStore } from '@/stores/theme'; // 替换为你的 Pinia Store 路径
import { onShow } from "@dcloudio/uni-app";


export function useThemeTabbar(options) {
    const themeStore = useThemeStore();
    const currentTheme = ref("");
    let options1 = options || { customNav: false }
    onShow(() => {
        if (currentTheme.value === "dark") {
            if (options1.customNav) {
                uni.setNavigationBarColor({
                    frontColor: "#ffffff",
                    backgroundColor: "transparent",
                });
            }
            uni.setTabBarStyle({
                backgroundColor: "#1e1e20", // TabBar 背景色
                borderStyle: "black",
            });
        } else {
            if (options1.customNav) {
                uni.setNavigationBarColor({
                    frontColor: "#000000",
                    backgroundColor: "transparent",
                });
            }
            uni.setTabBarStyle({
                backgroundColor: "#ffffff", // TabBar 背景色
                borderStyle: "white",
            });
        }
    })
    watch(
        () => themeStore.theme,
        (val) => {
            currentTheme.value = themeStore.getThemeUi();
        },
        { immediate: true }
    );

    return { currentTheme };
}