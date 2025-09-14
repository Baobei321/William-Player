<template>
    <tv-page @keyCodeClick="keyCodeClick">
        <div class="catelog-settings">
            <div class="catelog-settings-menu">
                <source-list title="请选择一个资源" type="menu" ref="source_list" @getSelectType="getSelectType"></source-list>
            </div>
            <wil-list :requestFn="getFileList" :request-params="requestParams" ref="wil_list" :refresherEnabled="false"
                idKey="name" :pageSize="20" :scrollIntoView="scrollIntoView" :scroll-with-animation="true"
                :showScrollBar="false" :responseAdapter="responseAdapter" @currentData="handleData">
            </wil-list>
        </div>
    </tv-page>
</template>

<script setup>
import { ref } from 'vue';
import tvPage from '@/components/tv/tv-page/index'
import sourceList from '../video/components/index-component/source-list.vue';
import wilList from '@/components/mobile/wil-list/index.vue'
import { useSelectFolder } from '@/hooks/useSelectFolder';

const focusModel = ref('menu')
const source_list = ref(null)
const result = ref({})
let selectType = {}
let selectMedia = {}

const emits = defineEmits(['openSource', 'confirm'])

const { data, key, selectName, responseAdapter, handleData, handleSize, chooseName, toBack, getFileList, clickCell, setImg, confirm }
    = useSelectFolder({ selectType: selectType, selectMedia: selectMedia, result: result.value, title: , emits: emits })


const keyCodeClick = (keyCode) => {
    if (focusModel.value === 'menu') {
        source_list.value.evtMove(keyCode)
    }
}

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

//从子组件获取到selectType,selectMedia，然后请求获取资源的目录列表
const getSelectType = (item, vitem) => {
    selectType = item
    selectMedia = vitem
    handleSelect(selectType, selectMedia)
}

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
        flex: 0 0 32%;
    }
}
</style>
