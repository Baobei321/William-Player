import Modal from './index.vue';
import { createApp } from 'vue';
function showModal({ title, confirmText, cancelColor, confirmColor, cancelText, content, cancel, confirm }) {
    const modalInstance = createApp(Modal, {
        title: title || '温馨提示',
        content: content || '是否退出登录',
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
    document.body.appendChild(parentNode);
    modalInstance.mount(parentNode);
}

export default showModal;
