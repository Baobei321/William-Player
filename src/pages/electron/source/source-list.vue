<template>
    <div class="source-list">
        <div class="source-list-title" @click="back">
            <div class="source-list-title__left">
                <img src="@/static/rect-leftblack.png">
                <span>资源库</span>
            </div>
            <div class="source-list-title__right" @click="openDialog">
                <img src="@/static/jia-black.png">
            </div>
        </div>
        <div class="source-list-container" v-if="show">
            <div class="source-list-item" v-for="item in sourceList" :key="item.type">
                <template v-if="item.list.length">
                    <div class="source-list-item__title">{{ item.type }}</div>
                    <div class="source-list-item__list">
                        <div :class="['list-item', item.list.length == 1 ? 'list-one' : '', vitem.active ? 'list-active' : '']"
                            v-for="vitem in item.list" :key="vitem.name" @click="handleSelect(item, vitem)">
                            <div class="list-item-img">
                                <image :src="item.img"></image>
                            </div>
                            <div class="list-item-name" :class="[vitem.active ? 'list-item-activeName' : '']">{{
                                vitem.name }}
                            </div>
                            <div class="list-item-button">
                                <img src="@/static/bianji-black.png">
                                <img src="@/static/xsp-black.png">
                                <img src="@/static/dy-black.png">
                                <img src="@/static/delete-icon.png">
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </div>
        <div class="source-list-empty" v-else>
            <image src="@/static/no-data.png" class="source-list-empty__img"></image>
            <span class="source-list-empty__tip">添加完资源之后，请为此资源添加电影、电视剧目录！！！</span>
            <nut-button custom-color="#090909" @click="openDialog">
                <template #icon>
                    <nut-icon name="uploader" custom-color="#fff" size="12"></nut-icon>
                </template>
                <span>添加新资源</span>
            </nut-button>
        </div>
        <nut-dialog v-model:visible="showDialog">
            <template #header>
                <div class="header-left" @click="back">
                    <img src="@/static/rect-leftblack.png" v-if="showType !== 'fileSource'">
                    <span> {{ dialogTitle }}</span>
                </div>
                <div class="header-right" @click="cancel">
                    <img src="@/static/close-black.png">
                </div>
            </template>
            <template #default>
                <div class="dialog-content">
                    <transition :name="transitionName">
                        <file-source v-if="showType === 'fileSource'" @click-item="changeFileSource"></file-source>
                        <wil-form :options="options1" v-model="state.formData" v-else ref="wil_form"></wil-form>
                    </transition>
                </div>
            </template>
            <template #footer>
                <div class="footer-button">
                    <nut-button type="default" @click="cancel">取消</nut-button>
                    <nut-button type="info" @click="confirm">确认</nut-button>
                </div>
            </template>
        </nut-dialog>
    </div>
</template>

<script setup>
import { nextTick, reactive, ref } from 'vue';
import wilForm from '@/components/mobile/wil-form/index.vue'
import fileSource from './components/file-source.vue';
import { validateWebdav } from "@/utils/validate";
import { useRoute } from 'vue-router';

const route = useRoute()
const sourceList = ref([])
const show = ref(false)

const showDialog = ref(false)
const dialogTitle = ref('添加新文件源')
const showType = ref('fileSource')
const transitionName = ref('slide-left')
const wil_form = ref(null)
const routerParams = ref({})
const state = reactive({
    formData: {
        protocol: "http",
    },
    oldData: {},
    history: ['fileSource']
})
const options1 = [
    { label: "名称", prop: "name", type: "input", formItemProps: { placeholder: "请输入", type: "text" }, rule: [{ required: true, message: "请输入名称" }] },
    {
        label: "协议", prop: "protocol", type: 'radio', formItemProps: { placeholder: "请输入", type: "text" }, rule: [{ required: true, message: "请选择协议" }], columns: [
            { label: 'HTTP', value: 'http' },
            { label: 'HTTPS', value: 'https' }
        ]
    },

    { label: "地址", prop: "address", type: "input", formItemProps: { placeholder: "例如:127.0.0.1", type: "text" }, rule: [{ required: true, message: "请输入地址" }] },
    { label: "端口", prop: "port", type: "input", formItemProps: { placeholder: "选填,例如:5244", type: "number" }, rule: [{ required: true, message: "请输入端口" }] },
    {
        label: "用户名",
        prop: "username",
        type: "input",
        formItemProps: { placeholder: "alist用户名,例如:admin", type: "text" },
        rule: [{ required: true, message: "请输入用户名" }],
    },
    { label: "密码", prop: "password", type: "input", formItemProps: { placeholder: "alist密码", type: "password" }, rule: [{ required: true, message: "请输入密码" }] },
]

const openDialog = () => {
    showDialog.value = true
    dialogTitle.value = '添加新文件源'
    showType.value = 'fileSource'
    transitionName.value = 'slide-left'
}

const changeFileSource = (item) => {
    transitionName.value = 'slide-left'
    showType.value = item.name
    dialogTitle.value = '添加' + item.name
    state.history.push(item.name)
}

const back = () => {
    transitionName.value = 'slide-right'
    if (showType.value !== 'fileSource') {
        state.history.pop()
    }
    setTimeout(() => {
        showType.value = state.history[state.history.length - 1]
    }, 0);
}

const cancel = () => {
    showDialog.value = false
    dialogTitle.value = '添加新文件源'
    showType.value = 'fileSource'
    transitionName.value = 'slide-left'
}

const confirm = () => {
    if (showType.value === 'WebDAV') {
        wil_form.value.confirmCommit().then(async (valid) => {
            if (valid) {
                validateWebdav(dialogTitle.value, state.formData, routerParams.value, false) //校验，抽成一个方法了
                showDialog.value = false
            }
        });
    }
}

//如果是修改的话，需要初始化
const initRouterParams = () => {
    routerParams.value = route.query
    routerParams.value.title ? dialogTitle.value = decodeURIComponent(routerParams.value.title) : '';
    if (dialogTitle.value == "修改WebDAV") {
        let sourceList = uni.getStorageSync("sourceList");
        state.formData = sourceList.find((i) => i.type == "WebDAV").list.find((i) => i.address == routerParams.value.address);
        state.formData.protocol ? "" : state.formData.protocol = "http";
        state.oldData = JSON.parse(JSON.stringify(state.formData));
    }
}
const judegeShow = () => {
    sourceList.value = uni.getStorageSync("sourceList");
    show.value = !sourceList.value.every((item) => {
        return !item.list.length;
    });
};
initRouterParams()
judegeShow()
</script>

<style lang="scss" scoped>
page {
    width: 100%;
    height: 100%;
}

.source-list {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .source-list-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        padding: 24rpx;

        .source-list-title__left {
            display: flex;
            align-items: center;

            img {
                width: 40rpx;
                height: 40rpx;
            }

            span {
                margin-left: 12rpx;
                font-weight: bold;
            }
        }

        .source-list-title__right {
            img {
                display: block;
                width: 40rpx;
                height: 40rpx;
            }
        }

    }

    .source-list-container {
        flex: 1;
        overflow: auto;
        padding: 0 24rpx;

        .source-list-item {
            padding-bottom: 16rpx;

            .source-list-item__title {
                font-size: 28rpx;
                color: #6d6d6d;
                padding: 16rpx 0;
            }

            .source-list-item__list {
                background: #fff;
                border-radius: 14rpx;

                .list-item {
                    background: #fff;
                    padding: 6rpx 24rpx;
                    display: flex;
                    align-items: center;
                    position: relative;
                    border: 2prx solid transparent;
                    cursor: pointer;

                    &::before {
                        position: absolute;
                        content: "";
                        height: 2rpx;
                        background: rgb(241, 241, 241);
                        width: 100%;
                        left: 0;
                        top: 0;
                    }

                    &:active {
                        background: rgb(241, 241, 241);
                    }

                    &:first-child {
                        border-radius: 14rpx;

                        &::before {
                            display: none;
                        }
                    }

                    &:last-child {
                        border-radius: 14rpx;
                    }

                    .list-item-img {
                        width: 100rpx;
                        height: 100rpx;
                        background: url("@/static/source-file.png") center no-repeat;
                        background-size: 100% 100%;
                        // display: flex;
                        // align-items: center;
                        // justify-content: center;
                        position: relative;

                        image {
                            width: 40rpx;
                            height: 40rpx;
                            border-radius: 50%;
                            position: absolute;
                            left: 50%;
                            top: 40%;
                            transform: translate(-50%, 0);
                        }
                    }

                    .list-item-name {
                        padding-left: 10rpx;
                        font-size: 32rpx;
                        color: #000;
                    }

                    .list-item-activeName {
                        color: #ff6701;
                    }

                    .list-item-button {
                        position: absolute;
                        right: 24rpx;
                        top: 50%;
                        transform: translateY(-50%);
                        display: flex;
                        align-items: center;
                        img{
                            width: 40rpx;
                            height: 40rpx;
                        }
                    }
                }

                .list-one {
                    border-radius: 14rpx !important;
                    border: 2rpx solid transparent !important;
                }

                .list-active {
                    border: 2rpx solid #ff6701 !important;
                }
            }
        }
    }

    .source-list-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;

        .source-list-empty__img {
            width: 400rpx;
            height: 400rpx;
        }

        .source-list-empty__tip {
            text-align: center;
            padding: 0 50rpx;
            padding-bottom: 24rpx;
            color: #000;
        }

        ::v-deep .nut-button {
            border-radius: 12rpx;
        }
    }

    :deep(.nut-popup) {
        overflow: hidden;

        .nut-dialog {
            width: 1000rpx;
            padding: 24rpx 30rpx;

            .nut-dialog__header {
                text-align: left;
                font-weight: bold;
                font-size: 32rpx;
                padding: 16rpx 16rpx 0 16rpx;
                display: flex;
                justify-content: space-between;
                align-items: center;

                .header-left {
                    display: flex;
                    align-items: center;
                    cursor: pointer;

                    img {
                        width: 40rpx;
                        height: 40rpx;
                    }

                    span {
                        padding-left: 10rpx;
                    }
                }

                .header-right {
                    img {
                        cursor: pointer;
                        width: 25rpx;
                        height: 25rpx;
                        display: block;
                    }
                }
            }

            .nut-dialog__content {
                max-height: none;
                flex: 0 0 800rpx;

                .dialog-content {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    overflow: hidden;
                }

                .slide-left-leave-active,
                .slide-left-enter-active {
                    transition: all 0.3s;

                    &.base-form {
                        position: absolute;
                    }
                }

                .slide-left-enter-from {
                    opacity: 1;
                    transform: translateX(100%);
                }

                .slide-left-leave-to {
                    opacity: 1;
                    transform: translateX(-100%);
                }

                .slide-right-leave-active,
                .slide-right-enter-active {
                    transition: all 0.3s;

                    &.base-form {
                        position: absolute;
                    }
                }

                .slide-right-enter-from {
                    opacity: 1;
                    transform: translateX(-100%);
                }

                .slide-right-leave-to {
                    opacity: 1;
                    transform: translateX(100%);
                }
            }

            .nut-dialog__footer {
                .footer-button {
                    width: 100%;
                    display: flex;
                    justify-content: flex-end;

                    .nut-button--default {
                        border: 2rpx solid rgb(204, 204, 204) !important;
                    }

                    .nut-button--info {
                        margin-left: 24rpx;
                    }
                }
            }
        }
    }

}
</style>
