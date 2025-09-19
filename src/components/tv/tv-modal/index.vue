<template>
    <div :class="['tv-modal', isShowing ? 'tv-modal-in' : 'tv-modal-out']" v-if="props.visible">
        <div class="tv-modal-container">
            <div class="tv-modal-container__title">{{ props.title }}</div>
            <div class="tv-modal-container__message">{{ props.message }}</div>
            <div class="tv-modal-container__button">
                <div :class="['button-cancel', tabIndex === 0 ? 'button-active' : '']" @click="cancel">{{
                    props.cancelText }}
                </div>
                <div :class="['button-confirm', tabIndex === 1 ? 'button-active' : '']" @click="confirm">{{
                    props.confirmText
                    }}</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    visible: { type: Boolean, default: false },
    title: { type: String, default: '' },
    message: { type: String, default: '' },
    cancelText: { type: String, default: '取消' },
    confirmText: { type: String, default: '确认' },
})

const emits = defineEmits(['update:visible', 'cancel', 'closed', 'confirm'])

const isShowing = ref(false);
const tabIndex = ref(0)

const showModal = () => {
    isShowing.value = true;
};

const hideModal = () => {
    isShowing.value = false;
    setTimeout(() => {
        emits('update:visible', false);
        emits('closed');
    }, 300);
};

const cancel = () => {
    emits('cancel')
    hideModal()
}

const confirm = () => {
    hideModal()
    emits('confirm')
}

const evtMove = (keyCode) => {
    if (keyCode === 'KeyLeft') {
        if (tabIndex.value > 0) {
            tabIndex.value--
        }
    } else if (keyCode === 'KeyRight') {
        if (tabIndex.value === 0) {
            tabIndex.value++
        }
    } else if (keyCode === 'KeyEnter') {
        if (tabIndex.value === 0) {
            cancel()
        } else if (tabIndex.value === 1) {
            confirm()
        }
    }
}

watch(
    () => props.visible,
    (val) => {
        if (val) {
            showModal()
        } else {
            hideModal()
        }
    }, { immediate: true }
)

defineExpose({
    evtMove
})
</script>

<style lang="scss" scoped>
@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes fadeOut {
    from {
        opacity: 1;
    }

    to {
        opacity: 0;
    }
}

.tv-modal {
    width: 100%;
    height: 100%;
    position: absolute;
    background: url('@/static/bg-stripe.png') center repeat;
    left: 0;
    top: 0;
    z-index: 9999;


    &-container {
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg,
                #000000 0%,
                #000000 10%,
                transparent 50%,
                #000000 90%,
                #000000 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        &__title {
            font-size: 68rpx;
            color: #fff;
            font-weight: bold;
        }

        &__message {
            font-size: 46rpx;
            font-weight: bold;
            margin-top: 24rpx;
            color: #d2d1d1;
        }

        &__button {
            margin-top: 24rpx;
            display: flex;
            align-items: center;

            .button-cancel {
                padding: 12rpx 46rpx;
                border: 4rpx solid transparent;
                border-radius: 30rpx;
                color: #315ffd;
                cursor: pointer;
            }

            .button-confirm {
                background: #fff;
                color: #000;
                padding: 12rpx 46rpx;
                border-radius: 30rpx;
                margin-left: 24rpx;
                border: 4rpx solid transparent;
                cursor: pointer;
            }

            .button-active {
                border: 4rpx solid #315ffd;
            }
        }
    }
}

.tv-modal-in {
    animation: fadeIn 0.3s ease-in-out forwards;
}

.tv-modal-out {
    animation: fadeOut 0.3s ease-in-out forwards;
}
</style>
