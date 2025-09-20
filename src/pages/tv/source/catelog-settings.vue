<template>
    <tv-page @keyCodeClick="keyCodeClick">
        <div class="catelog-settings">
            <div class="catelog-settings-menu">
                <source-list :title="`请选择${routerParams.title}目录`" type="menu" ref="source_list"
                    @getSelectType="getSelectType"></source-list>
            </div>
            <wil-list :requestFn="getFileList" :request-params="requestParams" ref="wil_list" :refresherEnabled="false"
                idKey="name" :pageSize="20" :scrollIntoView="scrollIntoView" :scroll-with-animation="true" :key="key"
                :showScrollBar="false" :responseAdapter="responseAdapter" @currentData="handleData">
                <template #default="item">
                    <div :class="['mulu-item', item.$index === tabIndex && iconIndex === -1 ? 'mulu-active' : '']"
                        @click="chooseNowMulu(item)">
                        <div class="mulu-item-left">
                            <div class="mulu-item-left__icon">
                                <image :src="selectType.img"></image>
                            </div>
                            <div class="mulu-item-left__name">{{ item.name }}</div>
                        </div>
                        <div :class="['mulu-item-right', item.$index === tabIndex && iconIndex === 0 ? 'mulu-right-active' : '']"
                            @click.stop="muluDown(item)">
                            <image src="@/static/arrow-black.png" v-if="item.$index === tabIndex && iconIndex === -1">
                            </image>
                            <image src="@/static/arrow-gray.png" v-else></image>
                        </div>
                    </div>
                </template>
            </wil-list>
        </div>
        <tv-modal ref="tv_modal" :title="modalMessage.title" :message="modalMessage.message" v-model:visible="showModal"
            @cancel="cancelModal" @confirm="confirmModal"></tv-modal>
    </tv-page>
</template>

<script setup>
import { reactive, ref, toRef } from 'vue';
import tvPage from '@/components/tv/tv-page/index'
import tvModal from '@/components/tv/tv-modal/index.vue'
import sourceList from '../video/components/index-component/source-list.vue';
import wilList from '@/components/mobile/wil-list/index.vue'
import { useSelectFolder } from '@/hooks/useSelectFolder';
import { onLoad } from "@dcloudio/uni-app";
import { loginUser, getFolder, getTvSeason, get189Folder, getQuarkFolder, getCutContent } from "@/utils/common";
import { debounce } from "@/utils/scrape";

const focusModel = ref('menu')
const source_list = ref(null)
const result = ref({})
const routerParams = ref({})
const requestParams = ref(null)
const wil_list = ref(null)
const selectType = ref({})
const selectMedia = ref({})

const tabIndex = ref(0)
const iconIndex = ref(-1)
const modalMessage = ref({})
const showModal = ref(false)
const tv_modal = ref(null)
const scrollIntoView= ref('')
let nowTime = 0

const emits = defineEmits(['openSource', 'confirm'])

const { data, key, path, folderFileId, folderFileIdArr, removeLastSegment, selectName, responseAdapter, handleData, handleSize, chooseName, toBack, getFileList, clickCell, setImg, confirm }
    = useSelectFolder({ selectType: selectType, selectMedia: selectMedia, result: result.value, title: toRef(() => routerParams.value.title), emits: emits })


//选择当前目录作为影片目录
const chooseNowMulu = (item) => {
    focusModel.value = 'modal'
    chooseName(item)
    modalMessage.value = {
        title: '是否确认选择此目录？',
        message: '选择该目录后将会根据此目录进行刮削。',
        confirmEvent: async () => {
            confirm()
        }
    }
    showModal.value = true
}

//目录下钻
const muluDown = (item) => {
    tabIndex.value = 0
    iconIndex.value = -1
    clickCell(item)
}

const keyCodeClick = (keyCode) => {
    if (focusModel.value === 'menu') {
        source_list.value.evtMove(keyCode)
    } else if (focusModel.value === 'list') {
        if (keyCode === "KeyUp") {
            if (tabIndex.value > 0) {
                tabIndex.value--;
            }
        } else if (keyCode === "KeyDown") {
            if (tabIndex.value < data.value.total - 1) {
                tabIndex.value++
            }
        } else if (keyCode === 'KeyLeft') {
            if (iconIndex.value === 0) {
                iconIndex.value = -1
            } else {
                if (selectType.value.type == 'WebDAV') {
                    if (path.value) {
                        path.value = removeLastSegment(path.value)
                        key.value === '1' ? key.value = '2' : key.value = '1'
                    } else {
                        tabIndex.value = 0
                        focusModel.value = 'menu'
                        requestParams.value = null
                        wil_list.value.reload()
                    }
                } else { //如果是天翼或者夸克
                    if (folderFileIdArr.value.length > 1) {
                        path.value = removeLastSegment(path.value)
                        folderFileIdArr.value.pop()
                        folderFileId.value = folderFileIdArr.value[folderFileIdArr.value.length - 1]
                        key.value === '1' ? key.value = '2' : key.value = '1'
                    } else {
                        tabIndex.value = 0
                        focusModel.value = 'menu'
                        requestParams.value = null
                        wil_list.value.reload()
                    }
                }

            }

        } else if (keyCode === 'KeyRight') {
            iconIndex.value = 0

        } else if (keyCode === 'KeyEnter') {
            if (iconIndex.value === -1) {//此时是选中当前目录作为影片目录
                chooseNowMulu(data.value.list[tabIndex.value])
            } else if (iconIndex.value === 0) {//此时是目录继续下钻
                muluDown(data.value.list[tabIndex.value])
            }
        }
        let time = Date.now();
        if (time - nowTime > 300) {
            if (tabIndex.value >= 6) {
                scrollIntoView.value = "name" + (tabIndex.value - 4);
            } else {
                scrollIntoView.value = "name1";
            }
        } else {
            setScrollIntoView();
        }
        nowTime = time;
    } else if (focusModel.value === 'modal') {
        tv_modal.value.evtMove(keyCode)
    }
}
const setScrollIntoView = debounce(() => {
    if (tabIndex.value >= 6) {
        scrollIntoView.value = "name" + (tabIndex.value - 4);
    } else {
        scrollIntoView.value = "name1";
    }
}, 300);

const handleSelect = async (item, vitem) => {
    uni.showLoading({
        title: '加载中',
    });
    if (item.type == "WebDAV") {
        await loginUser(vitem)
            .then((res) => {
                uni.hideLoading();
                vitem.token = res.data.token;
                result.value = {}
                requestParams.value = {}
                wil_list.value.reload()
            })
            .catch((error) => {
                uni.hideLoading();
                uni.showToast({
                    title: "请先开启Alist",
                    icon: "none",
                });
            });
    } else if (item.type == "天翼云盘") {
        await get189Folder({ folderId: "-11" }, { JSESSIONID: vitem.JSESSIONID, COOKIE_LOGIN_USER: vitem.COOKIE_LOGIN_USER })
            .then((res) => {
                uni.hideLoading();
                if (res.res_code == 0) {
                    result.value = res
                } else {
                    uni.showToast({
                        title: "请重新登录天翼云盘",
                        icon: "none",
                    });
                }
            })
            .catch((error) => {
                uni.hideLoading();
                uni.showToast({
                    title: "请重新登录天翼云盘",
                    icon: "none",
                });
            });
    } else if (item.type == "夸克网盘") {
        await getQuarkFolder({ fid: "0" }, vitem)
            .then((res) => {
                uni.hideLoading();
                if (res.status == 200) {
                    result.value = res
                } else {
                    uni.showToast({
                        title: "请重新登录夸克网盘",
                        icon: "none",
                    });
                }
            })
            .catch((error) => {
                uni.hideLoading();
                uni.showToast({
                    title: "请重新登录夸克网盘",
                    icon: "none",
                });
            });
    }
};

//modal点击取消按钮
const cancelModal = () => {
    focusModel.value = 'list'
}
//modal点击确定按钮
const confirmModal = () => {
    modalMessage.value.confirmEvent()
    if (modalMessage.value.title === '是否确认选择此目录？') {
        focusModel.value = 'list'
    }
}

//从子组件获取到selectType,selectMedia，然后请求获取资源的目录列表
const getSelectType = (item, vitem) => {
    focusModel.value = 'list'
    selectType.value = item
    selectMedia.value = vitem
    handleSelect(selectType.value, selectMedia.value)
}

onLoad((options) => {
    routerParams.value = options
})

</script>

<style lang="scss" scoped>
page {
    width: 100%;
    height: 100%;
}

.catelog-settings {
    width: 100%;
    height: 100%;
    display: flex;

    .catelog-settings-menu {
        flex: 0 0 35%;
    }

    :deep(.load-list) {
        padding: 24rpx;
        box-sizing: border-box;

        .uni-scroll-view {
            .uni-scroll-view-content {
                .list-item {
                    .mulu-item {
                        width: 100%;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 20rpx 24rpx;
                        border-radius: 16rpx;
                        cursor: pointer;

                        .mulu-item-left {
                            display: flex;
                            align-items: center;

                            .mulu-item-left__icon {
                                image {
                                    width: 80rpx;
                                    height: 80rpx;
                                    border-radius: 50%;
                                    display: block;
                                }
                            }

                            .mulu-item-left__name {
                                margin-left: 24rpx;
                                color: #c5c6d0;
                                font-weight: bold;
                                font-size: 34rpx;
                            }
                        }

                        .mulu-item-right {
                            width: 66rpx;
                            height: 66rpx;
                            padding: 6rpx;
                            border-radius: 50%;
                            border: 4rpx solid transparent;

                            image {
                                width: 46rpx;
                                height: 46rpx;
                                display: block;
                            }
                        }

                        .mulu-right-active {
                            border: 4rpx solid #e5e6ec;
                        }
                    }

                    .mulu-active {
                        background: #e5e6ec;

                        .mulu-item-left {
                            .mulu-item-left__name {
                                color: #000015;
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>
