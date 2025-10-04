<template>
    <div class="media-list">
        <div class="media-list-title" @click="back">
            <img src="@/static/rect-leftblack.png">
            <span>媒体库列表</span>
        </div>
        <div class="media-list-breadcrumb">
            <div class="media-list-breadcrumb__item">
                <span @click="changeBreadcrumb(0)" class="item-name">媒体库</span>
                <span v-if="state.historyPath.length" class="item-icon">/</span>
            </div>
            <div class="media-list-breadcrumb__item" v-for="(item, index) in state.historyPath" :key="item.path">
                <span @click="changeBreadcrumb(index + 1)" class="item-name">{{ item.name }}</span>
                <span v-if="index !== state.historyPath.length - 1" class="item-icon">/</span>
            </div>
        </div>
        <div class="media-list-container">
            <wil-list :requestFn="getFileList" ref="load_list" idKey="name" :pageSize="50"
                :responseAdapter="responseAdapter" :refresher-enabled="false" type="normal"
                listContainerClass="media-item-container">
                <template #default="item">
                    <div class="media-list-item" @click="clickMedia(item)">
                        <img :src="setFolderImg(item)">
                        <div>{{ item.name }}</div>
                    </div>
                </template>
            </wil-list>

        </div>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import wilList from '@/components/mobile/wil-list/index.vue'
import { loginUser, get189Folder, getQuarkFolder, getWebDAVUrl, get189DownloadUrl, getQuarkVideoUrl } from "@/utils/common.js";
import mediaFolder from '@/static/media-folder.png'
import { useRouter } from 'vue-router';

const router = useRouter()
const title = ref('媒体库列表');
const load_list = ref(null)

const state = reactive({
    folderFileList: [],
    historyPath: [],
    selectMedia: {},
})

const back = () => {
    router.go(-1)
}

const initData = () => {
    let sourceList = uni.getStorageSync('sourceList')
    state.folderFileList = []
    sourceList.forEach(item => {
        item.list.forEach(v => {
            if (item.type !== 'Emby') {
                state.folderFileList.push({ type: item.type, id: v.name, ...v })
            }
        })
    })

}

//点击面包屑切换路径
const changeBreadcrumb = (index) => {
    if (index !== 0) {
        state.historyPath = state.historyPath.slice(0, index)
    } else {
        state.selectMedia = {}
        state.historyPath = []
    }
    load_list.value.reload()
}

//点击文件夹或者文件
const clickMedia = async (item) => {
    const typeArr = ['WebDAV', 'Emby', '天翼云盘', '夸克网盘']
    typeArr.includes(item.type) ? state.selectMedia = item : ''
    if (item.type === 'WebDAV') {
        let res = await loginUser(state.selectMedia)
        state.selectMedia.token = res.data.token
    }

    if (state.selectMedia.type === 'WebDAV') {
        let path = ''
        state.historyPath.forEach((v, vindex) => {
            if (vindex !== 0) {
                path += '/' + v.name
            }
        })
        state.historyPath.push({ name: item.name, path: state.historyPath.length >= 1 ? path + '/' + item.name : '' }) //将当前点击的文件夹加入历史路径
        load_list.value.reload()
    } else if (state.selectMedia.type === '天翼云盘') {
        if (state.selectMedia.name) {
            let path = ''
            state.historyPath.forEach((v, vindex) => {
                if (vindex !== 0) {
                    path += '/' + v.name
                }
            })
            state.historyPath.push({
                name: item.name,
                folderFileId: state.historyPath.length >= 1 ? item.folderFileId : '-11',
                path: state.historyPath.length >= 1 ? path + '/' + item.name : ''
            }) //将当前点击的文件夹加入历史路径
            load_list.value.reload()
        }
    }
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
const getFileList = async (data) => {
    if (state.selectMedia.type == "WebDAV") {
        let path = "";
        path = state.historyPath[state.historyPath.length - 1]?.path
        return new Promise((resolve) => {
            uni.request({
                url: state.selectMedia.protocol + "://" + state.selectMedia.address + ":" + state.selectMedia.port + "/api/fs/list",
                data: JSON.stringify({ path: "/" + path, page: data.pageNum, per_page: data.pageSize, refresh: false }),
                method: "POST",
                header: { Authorization: state.selectMedia.token, "Content-Type": "application/json" },
                success: (res) => {
                    resolve(res.data);
                },
            });
        });
    } else if (state.selectMedia.type == "天翼云盘") {
        let res = await get189Folder({ ...data, folderId: state.historyPath[state.historyPath.length - 1]?.folderFileId }, state.selectMedia);
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
    } else if (state.selectMedia.type == "夸克网盘") {
        let res = await getQuarkFolder({ ...data, fid: state.historyPath[state.historyPath.length - 1]?.folderFileId }, state.selectMedia);
        res.data.list.forEach((v) => {
            v.file_type == 0 ? (v.type = 1) : (v.type = 0);
            v.name = v.file_name;
            v.big_thumbnail ? (v.thumb = v.big_thumbnail) : "";
            v.folderFileId = v.fid;
        });
        return { data: { content: res.data.list, total: res.metadata._total } };
    } else { //初始化展示的时候
        let sourceList = uni.getStorageSync('sourceList')
        state.folderFileList = []
        sourceList.forEach(item => {
            item.list.forEach(v => {
                if (item.type !== 'Emby') {
                    state.folderFileList.push({ type: item.type, id: v.name, ...v })
                }
            })
        })
        return { data: { content: state.folderFileList, total: state.folderFileList.length } }
    }
};

//设置文件照片
const setFolderImg = (item) => {
    if (item.thumb) {
        return item.thumb
    } else {
        return mediaFolder
    }
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
    flex-direction: column;
    padding: 0;

    .media-list-title {
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 24rpx;

        img {
            width: 40rpx;
            height: 40rpx;
        }

        span {
            margin-left: 12rpx;
            font-weight: bold;
        }
    }

    .media-list-breadcrumb {
        display: flex;
        padding: 0 0 0 36rpx;

        .media-list-breadcrumb__item {
            font-weight: bold;
            font-size: 32rpx;

            .item-name {
                cursor: pointer;

                &:hover {
                    color: #fa851e;
                }
            }

            .item-icon {
                padding: 0 12rpx;
            }
        }
    }

    .media-list-container {
        display: flex;
        align-items: flex-start;
        flex-wrap: wrap;
        flex: 1;
        padding: 24rpx;

        :deep(.load-list) {
            .uni-scroll-view-content {

                .media-item-container {
                    display: flex;
                    align-items: flex-start;
                    flex-wrap: wrap;
                    align-content: flex-start;
                    width: 100%;
                    height: 100%;
                    gap: 24rpx;

                    .list-item {
                        flex: 0 0 250rpx;
                        overflow: hidden;
                        padding: 20rpx 0;

                        &:hover {
                            background: #f0f0f0;
                            border-radius: 16rpx;
                        }

                        .media-list-item {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            cursor: pointer;
                            width: 100%;

                            img {
                                width: 160rpx;
                                height: 160rpx;
                                object-fit: cover;
                            }

                            div {
                                font-size: 28rpx;
                                color: #000;
                                width: 100%;
                                white-space: nowrap;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                text-align: center;
                            }

                        }
                    }
                }
            }
        }


    }
}
</style>
