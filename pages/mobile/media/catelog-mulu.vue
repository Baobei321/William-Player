<template>
    <div class="catelog-mulu">
        <div class="catelog-mulu-item" v-for="item in muluList" :key="item.name">

        </div>
        <div class="catelog-mulu-add" @click="toSelectSource">
            <div class="catelog-mulu-add__icon">
                <nut-icon name="uploader" custom-color="#94939a"></nut-icon>
            </div>
        </div>
        <nut-popup v-model:visible="showBottom" position="bottom" round @closed="showModel = 'source'">
            <select-source @openFolder="openFolder" v-if="showModel === 'source'"></select-source>
            <select-folder v-if="showModel === 'folder'" :selectType="selectType" :selectMedia="selectMedia"
                :result="res" :title="routerParams.title" @openSource="openSource"></select-folder>
        </nut-popup>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from "@dcloudio/uni-app";
import selectSource from './components/select-source.vue';
import selectFolder from './components/select-folder.vue';

const muluList = ref(uni.getStorageSync('muluList') || [])
const showBottom = ref(false)
const showModel = ref('source')
const selectType = ref({})
const selectMedia = ref({})
const res = ref({})
const routerParams = ref({})

const toSelectSource = () => {
    showBottom.value = true
}

//打开selectFolder
const openFolder = (selectType1, selectMedia1, res1) => {
    selectType.value = selectType1
    selectMedia.value = selectMedia1
    res.value = res1
    showModel.value = 'folder'
}

const openSource = () => {
    showModel.value = 'source'
}

onLoad((options) => {
    routerParams.value = options
    setTimeout(() => {
        uni.setNavigationBarTitle({
            title: options.title + '目录设置',
        });
    }, 40);
});
</script>

<style lang="scss" scoped>
page {
    width: 100%;
    height: 100%;
}

.catelog-mulu {
    display: flex;
    flex-wrap: wrap;
    padding: 24rpx;
    width: 100%;
    height: 100%;

    .catelog-mulu-item {}

    .catelog-mulu-add {
        flex: 0 0 calc(50% - 12rpx);
        background: #f9f8ff;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 16rpx;
        height: 250rpx;

        &:active {
            background: #ebe9f0;
        }

        .catelog-mulu-add__icon {
            border-radius: 50%;
            background: #dedde4;
            width: 70rpx;
            height: 70rpx;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }

    :deep(.nut-popup) {
        height: 50%;
        overflow: hidden;
    }
}
</style>
