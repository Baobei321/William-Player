<template>
    <div class="select-folder">
        <div class="select-folder-title">
            <nut-icon name="rect-left" :custom-color="props.arrowColor" @click="toBack"></nut-icon>
            <span>添加{{ props.title }}目录</span>
            <span class="title-right" @click="confirm">确认</span>
        </div>
        <wil-list :requestFn="getFileList" ref="load_list" idKey="name" :pageSize="60" :key="key"
            :responseAdapter="responseAdapter" @currentData="handleData" :refresher-enabled="false">
            <template #default="item">
                <nut-cell is-link :class="[item.$index == data.total - 1 ? 'last-cell' : '']" @click="clickCell(item)">
                    <template #title>
                        {{ item.name.length > 12 ? item.name.slice(0, 12) + '...' : item.name }}
                    </template>
                    <template #icon>
                        <div class="cell-icon">
                            <image :src="selectName == item.name ? checkActive : checkIcon"
                                @click.stop="chooseName(item)"></image>
                            <image :src="setImg(item)" />
                        </div>
                    </template>
                    <template #link>
                        <span v-if="item.type != '1'">{{ handleSize(item.size) }}</span>
                        <span v-else></span>
                    </template>
                </nut-cell>
            </template>
        </wil-list>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import wilList from "@/components/mobile/wil-list/index.vue";
import { get189Folder, getQuarkFolder, getWebDAVUrl, get189DownloadUrl, getQuarkVideoUrl } from "@/utils/common.js";
import Folder from "@/static/folder.png";
import videoPlayer from "@/static/video-player.png";
import photoIcon from "@/static/photo-icon.png";
import checkIcon from '@/static/check.png'
import checkActive from '@/static/check-active.png'
import { onBeforeMount } from 'vue';

const props = defineProps({
    selectType: { type: Object, default: {} },
    selectMedia: { type: Object, default: {} },
    result: { type: Object, default: {} },
    title: { type: String, default: '' }
})

const emits = defineEmits(['openSource', 'confirm'])

const muluData = ref(uni.getStorageSync('muluData') || {})
const isInit = ref(true)
const path = ref('')
const folderFileId = ref(null)
const data = ref({})
const key = ref('1')
const folderFileIdArr = ref([])
const selectName = ref('') //选中的文件夹的name

const mapping = {
    '电视剧': 'tv',
    '电影': 'movie'
}

const responseAdapter = (result) => {
    if (!result) {
        return {
            listData: [],
            listTotal: 0,
        };
    }
    return {
        listData: result.data.content || [],
        listTotal: +result.data.total,
    };
};
const handleData = (val) => {
    data.value = val;
};

const removeLastSegment = (dateStr) => {
    if (typeof dateStr !== 'string') return '';
    // 找到最后一个斜杠的位置
    const lastSlashIndex = dateStr.lastIndexOf('/');
    // 无斜杠或斜杠在末尾时返回原字符串
    if (lastSlashIndex === -1) return dateStr;
    // 截取最后一个斜杠前的内容
    return dateStr.substring(0, lastSlashIndex);
}

const chooseName = (item) => {
    selectName.value == item.name ? selectName.value = '' : selectName.value = item.name
    folderFileId.value = item.folderFileId
}

const toBack = () => {
    if (props.selectType.type == 'WebDAV') {
        if (path.value) {
            path.value = removeLastSegment(path.value)
            key.value === '1' ? key.value = '2' : key.value = '1'
        } else {
            emits('openSource')
        }
    } else { //如果是天翼或者夸克
        if (folderFileIdArr.value.length > 1) {
            path.value = removeLastSegment(path.value)
            folderFileIdArr.value.pop()
            folderFileId.value = folderFileIdArr.value[folderFileIdArr.value.length - 1]
            key.value === '1' ? key.value = '2' : key.value = '1'
        } else {
            emits('openSource')
        }
    }
}

const getFileList = async (data) => {
    if (props.selectType.type == "WebDAV") {
        isInit.value ? isInit.value = false : '' //webdav需要请求接口，其他两个直接从那边传值过来
        return new Promise((resolve) => {
            uni.request({
                url: props.selectMedia.protocol + "://" + props.selectMedia.address + ":" + props.selectMedia.port + "/api/fs/list",
                data: JSON.stringify({ path: path.value ? path.value : '/', page: data.pageNum, per_page: data.pageSize, refresh: false }),
                method: "POST",
                header: { Authorization: props.selectMedia.token, "Content-Type": "application/json" },
                success: (res) => {
                    resolve(res.data);
                },
            });
        });
    } else if (props.selectType.type == "天翼云盘") {
        if (isInit.value) {//初始化用传过来的res
            isInit.value = false
            folderFileIdArr.value.push('-11')
            let result1 = JSON.parse(JSON.stringify(props.result))
            result1.fileListAO.fileList.forEach((v) => {
                v?.icon?.largeUrl ? (v.thumb = v.icon.largeUrl) : "";
                v.type = 0;
                v.folderFileId = v.id;
            });
            result1.fileListAO.folderList.forEach((v) => {
                v.type = 1;
                v.folderFileId = v.id;
            });
            return { data: { content: [...result1.fileListAO.folderList, ...result1.fileListAO.fileList], total: result1.fileListAO.count } };
        }
        let res = await get189Folder({ ...data, folderId: folderFileId.value }, props.selectMedia);
        res.fileListAO.fileList.forEach((v) => {
            v?.icon?.largeUrl ? (v.thumb = v.icon.largeUrl) : "";
            v.type = 0;
            v.folderFileId = v.id;
        });
        res.fileListAO.folderList.forEach((v) => {
            v.type = 1;
            v.folderFileId = v.id;
        });
        return { data: { content: [...res.fileListAO.folderList, ...res.fileListAO.fileList], total: res.fileListAO.count } };
    } else if (props.selectType.type == "夸克网盘") {
        if (isInit.value) {//初始化用传过来的res
            isInit.value = false
            folderFileIdArr.value.push('0')
            let result1 = JSON.parse(JSON.stringify(props.result))
            result1.data.list.forEach((v) => {
                v.file_type == 0 ? (v.type = 1) : (v.type = 0);
                v.name = v.file_name;
                v.big_thumbnail ? (v.thumb = v.big_thumbnail) : "";
                v.folderFileId = v.fid;
            });
            return { data: { content: result1.data.list, total: result1.metadata._total } };
        }
        let res = await getQuarkFolder({ ...data, fid: folderFileId.value }, props.selectMedia);
        res.data.list.forEach((v) => {
            v.file_type == 0 ? (v.type = 1) : (v.type = 0);
            v.name = v.file_name;
            v.big_thumbnail ? (v.thumb = v.big_thumbnail) : "";
            v.folderFileId = v.fid;
        });
        return { data: { content: res.data.list, total: res.metadata._total } };
    }
};
const clickCell = async (item) => {
    if (item.type == "1") {
        selectName.value = ''
        path.value = path.value + "/" + item.name
        if (props.selectType.type == "WebDAV") {
            key.value === '1' ? key.value = '2' : key.value = '1'
        } else if (props.selectType.type == "天翼云盘") {
            folderFileIdArr.value.push(item.folderFileId)
            folderFileId.value = item.folderFileId
            key.value === '1' ? key.value = '2' : key.value = '1'
        } else if (props.selectType.type == "夸克网盘") {
            folderFileIdArr.value.push(item.folderFileId)
            folderFileId.value = item.folderFileId
            key.value === '1' ? key.value = '2' : key.value = '1'
        }
    } else {
        uni.showToast({
            title: '请选择文件夹',
            icon: 'none'
        })
    }
};
const setImg = (item) => {
    if (item.type == "1") {
        return Folder;
    } else {
        let videoFormat = ["mp4", "mkv", "m2ts", "avi", "mov", "ts", "m3u8", "iso"];
        let imgFormat = ["jpg", "png", "jpeg", "raw", "webp", "gif"];
        if (videoFormat.some((i) => item.name.includes(i))) {
            return videoPlayer;
        } else if (imgFormat.some((i) => item.name.includes(i))) {
            return photoIcon;
        }
    }
};
``
//确认选择该路径
const confirm = () => {
    if (!selectName.value) {
        uni.showToast({
            title: "请选择目录",
            icon: "none"
        })
        return
    }
    if (props.selectType.type == 'WebDAV') {
        let exit = muluData.value[mapping[props.title]].find(v => v.type == props.selectType.type && v.name == props.selectMedia.name)
        //已存在就替换，不存在就新增
        exit ? exit.path = path.value + '/' + selectName.value || '/' : muluData.value[mapping[props.title]].push({ type: props.selectType.type, name: props.selectMedia.name, path: path.value + '/' + selectName.value || '/' })
    } else {
        let exit = muluData.value[mapping[props.title]].find(v => v.type == props.selectType.type && v.name == props.selectMedia.name)
        //已存在就替换，不存在就新增
        if (exit) {
            exit.path = path.value + '/' + selectName.value || '/'
            exit.folderFileId = folderFileId.value
        } else {
            let obj = { type: props.selectType.type, name: props.selectMedia.name, path: path.value + '/' + selectName.value || '/', folderFileId: folderFileId.value }
            muluData.value[mapping[props.title]].push(obj)
        }
    }
    console.log(muluData.value);
    emits('confirm', muluData.value)
    uni.setStorageSync('muluData', muluData.value)
}
onBeforeMount(() => {
    muluData.value = uni.getStorageSync('muluData') || {}
    muluData.value?.tv ? '' : muluData.value.tv = []
    muluData.value?.movie ? '' : muluData.value.movie = []
})
</script>

<style lang="scss" scoped>
.select-folder {
    width: 100%;
    height: 100%;
    background: #f6f7f8;
    box-sizing: border-box;
    margin-top: 0;
    display: flex;
    flex-direction: column;

    .select-folder-title {
        width: 100%;
        padding-top: 24rpx;
        font-size: 34rpx;
        font-weight: bold;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;

        :deep(.nut-icon) {
            position: absolute;
            left: 24rpx;
        }

        .title-right {
            color: #2457fd;
            font-size: 32rpx;
            position: absolute;
            right: 24rpx;
        }
    }

    ::v-deep .load-list {
        flex: 1;
        padding: 0 24rpx;
        padding-top: 24rpx;
        box-sizing: border-box;
        overflow: hidden;

        .list-item {
            &:first-child {
                .nut-cell {
                    // border-radius: 24rpx 24rpx 0 0;
                    border-top-left-radius: 24rpx;
                    border-top-right-radius: 24rpx;
                }
            }

            .nut-cell {
                margin: 0;
                padding: 24rpx;
                background: #fff;
                align-items: center;
                box-shadow: none;
                border-radius: 0;

                &::after {
                    border-bottom: 2rpx solid #f5f6f7 !important;
                    /* position: absolute !important;
          box-sizing: border-box !important;
          content: " " !important;
          pointer-events: none !important;
          right: 32rpx !important;
          bottom: 0 !important;
          left: 32rpx !important;
          -webkit-transform: scaleY(0.5) !important;
          -ms-transform: scaleY(0.5) !important;
          transform: scaleY(0.5) !important; */
                }

                .nut-cell__icon {
                    margin-right: 16rpx;

                    .cell-icon {
                        display: flex;
                        align-items: center;

                        image {
                            width: 60rpx;
                            height: 60rpx;
                            object-fit: cover;

                            &:first-child {
                                width: 40rpx;
                                height: 40rpx;
                                margin-right: 20rpx;
                            }
                        }
                    }
                }

                .nut-cell__title {
                    justify-content: center;
                    font-size: 30rpx;
                    color: #353a45;
                    line-height: normal;

                    .base-cell__title {
                        display: flex;
                        align-items: center;

                        span:last-child {
                            padding-left: 24rpx;
                        }
                    }

                    // font-weight: bold;
                }
            }

            .last-cell {
                // border-radius: 0 0 24rpx 24rpx;
                border-bottom-right-radius: 24rpx;
                border-bottom-left-radius: 24rpx;

                &::after {
                    display: none;
                }
            }
        }

        .load-list__finished-text {
            margin-top: 24rpx;
        }
    }
}
</style>
