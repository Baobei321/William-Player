import { watch, ref } from 'vue';
import { useThemeStore } from '@/stores/theme'; // 替换为你的 Pinia Store 路径
import { onShow } from "@dcloudio/uni-app";

/**
 * 监听主题变化并自动设置 TabBar 样式
 * @param {Object} options 配置项（可选）
 */
export function useThemeNavbar() {
    const themeStore = useThemeStore();

    const currentTheme = ref(themeStore.theme);
    onShow(() => {
        currentTheme.value = themeStore.getThemeUi();
        if (currentTheme.value === "dark") {
            uni.setNavigationBarColor({
                frontColor: "#ffffff",
                backgroundColor: "#1e1e20",
            });
        } else if (currentTheme.value === "light") {
            uni.setNavigationBarColor({
                frontColor: "#000000",
                backgroundColor: "#ffffff",
            });
        }
    })
    watch(
        () => themeStore.theme,
        (val) => {
            currentTheme.value = themeStore.getThemeUi();
            if (currentTheme.value === "dark") {
                uni.setNavigationBarColor({
                    frontColor: "#ffffff",
                    backgroundColor: "#1e1e20",
                });
            } else if (currentTheme.value === "light") {
                uni.setNavigationBarColor({
                    frontColor: "#000000",
                    backgroundColor: "#ffffff",
                });
            }
        }, { immediate: true }
    );

    return { currentTheme };
}