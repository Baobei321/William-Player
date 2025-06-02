// stores/theme.js
import { defineStore } from 'pinia';

export const useThemeStore = defineStore('theme', {
    state: () => {
        return {
            theme: '',
        };
    },
    // 也可以这样定义
    // state: () => ({ count: 0 })
    actions: {
        setThemeUi(val) {
            this.theme = val;
            uni.setStorageSync('theme', val);
        },
        getThemeUi() {
            if (!this.theme) {
                this.theme = uni.getStorageSync('theme') || 'light'
            }
            return this.theme
        },
    },
});
