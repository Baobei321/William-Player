<template>
    <div class="media-list">
        <div class="media-list-item" v-for="item in state.folderFileList" :key="item.id">
            <img src="@/static/media-folder.png">
            <span>{{ item.name }}</span>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';

const state = reactive({
    folderFileList: [],
})

const initData = () => {
    let sourceList = uni.getStorageSync('sourceList')
    state.folderFileList = []
    sourceList.forEach(item => {
        item.list.forEach(v => {
            state.folderFileList.push({ type: item.type, id: v.name, ...v })
        })
    })
    console.log(state.folderFileList, 'state.folderFilelist');

}
initData()

</script>

<style lang="scss" scoped>
page {
    width: 100%;
    height: 100%;
}

.media-list {
    width: 100%;
    height: 100%;
    display: flex;
    // align-items: flex-start;
    flex-wrap: wrap;
    padding: 24rpx;

    .media-list-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;

        img {
            width: 160rpx;
            height: 160rpx;
        }

        span {
            font-size: 28rpx;
            color: #000;
        }
    }
}
</style>
