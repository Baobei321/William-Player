<template>
    <nut-uploader ref="uploadRef" :url="uploadSetting.url" :headers="uploadSetting.header" :multiple="props.multiple"
        :maximum="props.limitNum" :maximize="1024 * 1000 * props.limitSize" v-model:file-list="currentFileList"
        :list-type="props.listType" :size-type="['original']" @success="uploadeSuccess" @delete="deleteFile"
        @oversize="onOversize" :disabled="props.disabled">
        <template #default v-if="$slots.default">
            <slot name="default"></slot>
        </template>
    </nut-uploader>
</template>

<script setup>
import { watch, ref, reactive } from 'vue';
import * as CONFIG from '@/utils/config.js'

const emit = defineEmits(['update:modelValue', 'success', 'delete']);
const props = defineProps({
    listType: {
        type: String,
        default: 'picture'
    },
    modelValue: {
        type: Array,
        default: []
    },
    limitNum: {
        type: Number,
        default: 1
    },
    limitSize: {
        type: Number,
        default: 4 // 4m
    },
    multiple: {
        type: Boolean,
        default: false
    },
    slotsStatus: {
        type: Boolean,
        default: false
    },
    pressImage: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    uploadSetting: {
        type: Object,
        default: {
            url: CONFIG.BASE_URL + '/file/upload',
            header: {
                Authorization: 'Bearer ' + uni.getStorageSync('Authorization')
            }
        }
    }
});

const fileList = ref([]);
const currentFileList = ref([]);
const uploadRef = ref(null);

const uploadSetting = ref({
    url: CONFIG.BASE_URL + '/file/upload',
    header: {
        Authorization: 'Bearer ' + uni.getStorageSync('Authorization')
    }
})

const clearUpload = () => {
    uploadRef.value.clearUploadQueue();
};

const uploadeSuccess = e => {
    const { code, data } = JSON.parse(e.data.data);
    if (code == 0 || code == 200) {
        if (props.multiple) {
            fileList.value.push(data.url);
        } else {
            fileList.value = [data.url];
        }
        emit('update:modelValue', fileList.value);
        emit('success', e)
    }
};

const onOversize = e => {
    uni.showToast({ title: `图片超过${props.limitSize}M`, icon: 'error' });
};
const deleteFile = e => {
    fileList.value.splice(e.index, 1);
    emit('update:modelValue', fileList.value);
    emit('delete', e)
};

const beforeUpload = async file => {
    if (!props.pressImage) return file;
}
watch(
    () => props.modelValue,
    val => {
        currentFileList.value = val.length
            ? val.map(item => {
                return {
                    name: item,
                    url: item,
                    status: 'success',
                    type: 'image'
                };
            })
            : [];

        fileList.value = currentFileList.value.map(item => item.url);
    },
    { immediate: true, deep: true }
);

watch(
    () => props.uploadSetting,
    val => {
        uploadSetting.value = val
    }, { immediate: true, deep: true }
)

defineExpose({
    clearUpload
});
</script>

<style lang="scss">
.uploader-box {
    .nut-uploader {
        align-items: center;
        justify-content: center;
    }

    .nut-uploader__slot {
        margin: 0 auto;
    }
}
</style>
