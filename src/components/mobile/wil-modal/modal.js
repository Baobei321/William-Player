import Modal from './index.vue';
import { createApp } from 'vue';
import { useThemeStore } from '@/stores/theme';
import { i18n } from '@/i18n/index.js';

function showModal({ title, confirmText, cancelColor, confirmColor, cancelText, content, cancel, confirm }) {
    const modalInstance = createApp(Modal, {
        title: title || i18n.global.t('modal.warmTip'),
        content: content || i18n.global.t('modal.defaultLogoutContent'),
        cancelText: cancelText,
        confirmText: confirmText,
        cancelColor: cancelColor,
        confirmColor: confirmColor,
        cancel: (ee) => {
            unmount();
            cancel && cancel();
        },
        confirm: (data) => {
            unmount();
            confirm && confirm(data);
        },
    })

    const unmount = () => {
        modalInstance.unmount();
        document.body.removeChild(parentNode);
    };
    const parentNode = document.createElement('div');
    const themeStore = useThemeStore();
    if (themeStore.getResolvedTheme() === 'dark') {
        parentNode.classList.add('dark');
    }
    document.body.appendChild(parentNode);
    modalInstance.mount(parentNode);
}

export default showModal;
