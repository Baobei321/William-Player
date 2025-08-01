<template>
    <div class="catelog-mulu">
        <div class="catelog-mulu-item" v-for="item in listData" :key="item.name"
            @click="(event) => clickItem(event, item)">
            <div class="item-top">
                <image :src="routerParams.title == '电视剧' ? xspBlack : dyBlack"></image>
                <span>{{ routerParams.title }}</span>
            </div>
            <div class="item-bottom">
                <image :src="mapping[item.type]"></image>
                <div class="item-bottom-right">
                    <div class="right-name">{{ item.name }}</div>
                    <div class="right-path">{{ item.path }}</div>
                </div>
            </div>
        </div>
        <div class="catelog-mulu-add catelog-mulu-item" @click="toSelectSource">
            <div class="catelog-mulu-add__icon">
                <nut-icon name="uploader" custom-color="#94939a"></nut-icon>
            </div>
        </div>
        <nut-popup v-model:visible="showBottom" position="bottom" round @closed="showModel = 'source'">
            <select-source @openFolder="openFolder" v-if="showModel === 'source'"></select-source>
            <select-folder v-if="showModel === 'folder'" :selectType="selectType" :selectMedia="selectMedia"
                :result="res" :title="routerParams.title" @openSource="openSource" @confirm="confirm"></select-folder>
        </nut-popup>
        <Popover v-model:visible="showPopover" :options="popoverOptions" :position="position"></Popover>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from "@dcloudio/uni-app";
import selectSource from './components/select-source.vue';
import selectFolder from './components/select-folder.vue';
import xspBlack from '@/static/xsp-black.png'
import dyBlack from '@/static/dy-black.png'
import webdavFileIcon from "@/static/webdav-fileIcon.png";
import Popover from './components/popover.vue';
import tongbuIcon from '@/static/tongbu-icon.png'
import editIcon from '@/static/edit_icon.png'
import deleteIcon from '@/static/delete-icon.png'


const muluData = ref(uni.getStorageSync('muluData') || {})
const listData = ref([])
const showBottom = ref(false)
const showModel = ref('source')
const selectType = ref({})
const selectMedia = ref({})
const res = ref({})
const routerParams = ref({})

const showPopover = ref(false)
const selectItem = ref({})
const position = ref({})
const mapping1 = {
    '电视剧': 'tv',
    '电影': 'movie'
}

const handleGx = () => {

}

// const handleEdit = () => {}

const handleDelete = () => {
    listData.value = listData.value.filter(item => item.name != selectItem.value.name)
    muluData.value[mapping1[routerParams.value.title]] = listData.value
    uni.setStorageSync('muluData', muluData.value)
}

const popoverOptions = ref([
    { icon: tongbuIcon, label: '刮削', color: '#1B1B1B', func: handleGx },
    // { icon: editIcon, label: '修改', color: '#1B1B1B', func: handleEdit },
    { icon: deleteIcon, label: '删除', color: '#FE4344', func: handleDelete }
])

const mapping = {
    'WebDAV': webdavFileIcon,
    '天翼云盘': 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/8c/87/69/8c8769f2-6bfa-19b2-53a4-9e10a555deb3/AppIcon-0-0-1x_U007emarketing-0-7-0-0-sRGB-85-220.png/350x350.png',
    '夸克网盘': 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/60/6f/e5/606fe5ab-3bfb-c5e4-5bed-08c9b2b5188f/AppIcon-0-0-1x_U007emarketing-0-7-0-0-85-220.png/350x350.png?'
}

const clickItem = (event, item) => {
    selectItem.value = item
    showPopover.value = true
    position.value.clientX = event.clientX || event.touches[0].clientX
    position.value.clientY = event.clientY || event.touches[0].clientY
}

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

const confirm = (data) => {
    showBottom.value = false
    showModel.value = 'source'
    muluData.value = data
    listData.value = muluData.value[mapping1[routerParams.value.title]]
}

onLoad((options) => {
    muluData.value = uni.getStorageSync('muluData') || {}
    muluData.value?.tv ? '' : muluData.value.tv = []
    muluData.value?.movie ? '' : muluData.value.movie = []
    routerParams.value = options
    listData.value = muluData.value[mapping1[routerParams.value.title]]
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
    justify-content: space-between;
    // align-items: flex-start;
    align-content: flex-start;
    padding: 24rpx;
    width: 100%;
    height: 100%;

    .catelog-mulu-item {
        flex: 0 0 calc(50% - 12rpx);
        background: #f9f8ff;
        border-radius: 16rpx;
        height: 250rpx;
        display: flex;
        flex-direction: column;
        margin-top: 24rpx;

        .item-top {
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 0 0 150rpx;
            background: #eae9f0;
            border-radius: 16rpx 16rpx 0 0;

            image {
                width: 70rpx;
                height: 70rpx;
            }

            span {
                font-size: 40rpx;
                font-weight: bold;
                padding-left: 20rpx;
            }
        }

        .item-bottom {
            display: flex;
            align-items: center;
            flex: 1;
            padding-left: 24rpx;
            padding-right: 12rpx;

            image {
                flex: 0 0 70rpx;
                width: 70rpx;
                height: 70rpx;
                border-radius: 16rpx;
            }

            .item-bottom-right {
                flex: 1;
                margin-left: 24rpx;

                .right-name {
                    font-size: 28rpx;
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .right-path {
                    font-size: 24rpx;
                    margin-top: 8rpx;
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }
        }

        &:first-child {
            margin-top: 0;
        }

        &:nth-child(2) {
            margin-top: 0;
        }
    }

    .catelog-mulu-add {
        align-items: center;
        justify-content: center;

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
