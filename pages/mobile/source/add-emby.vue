<template>
    <div class="add-emby-form">
        <wil-navbar :title="title"></wil-navbar>
        <div class="add-emby-form__container">
            <wil-form v-model="state.formData" :options="options" ref="base_form">
                <template #protocol>
                    <nut-cell :title="protoColumns.find(i => i.value == state.formData.protocol)?.text" is-link
                        @click="openPopup"></nut-cell>
                </template>
            </wil-form>
            <nut-button custom-color="#ff6701" @click="confirmSubmit">确认{{ title == '添加Emby' ? '添加' : '修改'
            }}</nut-button>
            <!-- <loginPopup v-model:visible="showLoginPopup" @loginSuccess="loginSuccess"></loginPopup> -->
            <nut-popup v-model:visible="showProtocol" position="bottom" safe-area-inset-bottom round>
                <nut-picker v-model="protoValue" :columns="protoColumns" title="选择协议" @confirm="confirmPicker"
                    @cancel="showProtocol = false">
                </nut-picker>
            </nut-popup>
        </div>
    </div>
</template>

<script setup>
import { onBeforeMount, reactive, ref } from "vue";
import wilForm from "@/components/mobile/wil-form/index.vue";
import wilNavbar from "@/components/mobile/wil-navbar/index.vue";
import { onLoad } from "@dcloudio/uni-app";
import { loginEmby, getEmbyInfo } from "@/utils/emby";

const state = reactive({
    formData: {
        protocol: "https",
        address: 'my2.yangxiangxiang.top',
        port: 18099,
        Username: 'cwl',
        Pw: 'cwl@20252025'
    },
    oldData: {},
});

const base_form = ref(null);
// const showLoginPopup = ref(false)

const routerParams = ref({});

const title = ref("");

const options = ref([
    { label: "名称", prop: "name", type: "input", formItemProps: { placeholder: "选填（自动获取）", type: "text" } },
    { label: "协议", prop: "protocol", formItemProps: { placeholder: "请输入", type: "text" }, rule: [{ required: true, message: "请选择协议" }] },

    { label: "地址", prop: "address", type: "input", formItemProps: { placeholder: "例如:127.0.0.1", type: "text" }, rule: [{ required: true, message: "请输入地址" }] },
    { label: "端口", prop: "port", type: "input", formItemProps: { placeholder: "选填,例如:443", type: "number" }, rule: [{ required: true, message: "请输入端口" }] },
    {
        label: "用户名",
        prop: "Username",
        type: "input",
        formItemProps: { placeholder: "必填", type: "text" },
        rule: [{ required: true, message: "请输入用户名" }],
    },
    { label: "密码", prop: "Pw", type: "input", formItemProps: { placeholder: "选填", type: "password" } },
]);

const showProtocol = ref(false);
const protoValue = ref(["HTTP"]);
const protoColumns = ref([
    { text: "HTTP", value: "http" },
    { text: "HTTPS", value: "https" },
]);

//修改emby的时候，同步修改电视剧电影目录
const editMulu = () => {
    const muluData = uni.getStorageSync('muluData')
    let muluMovie = muluData.movie?.find(v => v.name == state.oldData.name)
    let muluTv = muluData.tv?.find(v => v.name == state.oldData.name)
    if (muluMovie) {
        muluMovie.name = state.formData.name
    }
    if (muluTv) {
        muluTv.name = state.formData.name
    }
    uni.setStorageSync('muluData', muluData)
}

const confirmSubmit = () => {
    base_form.value.confirmCommit().then(async (valid) => {
        if (valid) {
            let sourceList = uni.getStorageSync("sourceList");
            if (!sourceList.find((i) => i.type == "Emby")) {
                sourceList.push({ type: "Emby", list: [], img: "https://gimg3.baidu.com/search/src=https%3A%2F%2Ftiebapic.baidu.com%2Fforum%2Fw%253D120%253Bh%253D120%2Fsign%3D44147d7d4e82b2b7a79f3dc60196a3d2%2Fc9fcc3cec3fdfc03771506c1c33f8794a4c2265e.jpg%3Ftbpicau%3D2025-04-08-05_5fe90c457d4356ee146a73914e8a8871&refer=http%3A%2F%2Fwww.baidu.com&app=2021&size=w240&n=0&g=0n&q=75&fmt=auto?sec=1744045200&t=627b5377de1d3107a8a09cb4f65c9fdc" })
            }
            if (title.value == "添加Emby") {
                if (sourceList.find((i) => i.type == "Emby").list.find((i) => i.address == state.formData.address)) {
                    uni.showToast({
                        title: "存在重复的Emby地址，请修改",
                        icon: "none",
                    });
                    return;
                }
                if (sourceList.find((i) => i.type == "Emby").list.find((i) => i.name == state.formData.name)) {
                    uni.showToast({
                        title: "存在同名的Emby，请修改",
                        icon: "none",
                    });
                    return;
                }
                uni.showLoading({
                    title: '加载中'
                })
                await loginEmby(state.formData)
                    .then(async (res) => {
                        uni.hideLoading()
                        let isHaveData = !sourceList.every((item) => {
                            return !item.list.length;
                        });
                        let obj1 = {}
                        if (!isHaveData) {
                            obj1 = { ...state.formData, userId: res.User.Id, token: res.AccessToken, active: true }
                            let embyInfo = await getEmbyInfo(obj1)
                            obj1.name = embyInfo.ServerName
                            sourceList.find((i) => i.type == "Emby").list.push(obj1);
                            uni.setStorageSync("isreload", true);
                        } else {
                            obj1 = { ...state.formData, userId: res.User.Id, token: res.AccessToken }
                            let embyInfo = await getEmbyInfo(obj1)
                            obj1.name = embyInfo.ServerName
                            sourceList.find((i) => i.type == "Emby").list.push(obj1);
                        }
                        uni.setStorageSync("sourceList", sourceList);
                        uni.navigateBack({
                            delta: 2,
                        });
                    })
                    .catch(() => {
                        uni.hideLoading()
                        uni.showToast({
                            title: "权限校验失败，请检查",
                            icon: "none",
                        });
                    });
            } else if (title.value == "修改Emby") {
                if (sourceList.find((i) => i.type == "Emby").list.find((i) => i.address == state.formData.address) && state.oldData.address != state.formData.address) {
                    uni.showToast({
                        title: "存在重复的Emby地址，请修改",
                        icon: "none",
                    });
                    return;
                }
                if (sourceList.find((i) => i.type == "Emby").list.find((i) => i.name == state.formData.name) && state.oldData.name != state.formData.name) {
                    uni.showToast({
                        title: "存在同名的Emby，请修改",
                        icon: "none",
                    });
                    return;
                }
                uni.showLoading({
                    title: '加载中'
                })
                await loginEmby(state.formData)
                    .then((res) => {
                        uni.hideLoading()
                        let historyArr = uni.getStorageSync("historyPlay") || [];
                        historyArr = historyArr.filter((v) => v.sourceType != "Emby" || v.sourceName != state.oldData.name);
                        uni.setStorageSync("historyPlay", historyArr);
                        state.formData.token = res.AccessToken;
                        state.formData.userId = res.User.Id;
                        let obj = sourceList.find((i) => i.type == "Emby").list.find((i) => i.address == routerParams.value.address);
                        Object.keys(state.formData).forEach((v) => {
                            obj[v] = state.formData[v];
                        });
                        editMulu()
                        uni.setStorageSync("sourceList", sourceList);
                        if (routerParams.value.isActive == "1") {
                            uni.setStorageSync("isreload", true);
                            uni.navigateBack({
                                delta: 2,
                            });
                            return;
                        }
                        uni.navigateBack();
                    })
                    .catch(() => {
                        uni.hideLoading()
                        uni.showToast({
                            title: "权限校验失败，请检查",
                            icon: "none",
                        });
                    });
            }
        }
    });
};

const openPopup = () => {
    showProtocol.value = true;
};
const confirmPicker = ({ selectedValue, selectedOptions }) => {
    console.log(selectedOptions);
    state.formData.protocol = selectedValue[0];
    showProtocol.value = false;
};

onLoad((options) => {
    routerParams.value = options;
    title.value = decodeURIComponent(routerParams.value.title);
    if (title.value == "修改Emby") {
        let sourceList = uni.getStorageSync("sourceList");
        state.formData = sourceList.find((i) => i.type == "Emby").list.find((i) => i.address == routerParams.value.address);
        state.formData.protocol ? "" : (state.formData.protocol = "http");
        state.oldData = JSON.parse(JSON.stringify(state.formData));
    }
});
</script>

<style lang="scss" scoped>
page {
    width: 100%;
    height: 100%;
}

.add-emby-form {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    background: linear-gradient(180deg, #ffd3b1 0%, #fff5ec 30%, #f6f7f8 70%);
    background-size: 100% 100%;
    box-sizing: border-box;

    &__container {
        padding: 0 24rpx;
        padding-top: 24rpx;
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: auto;

        ::v-deep .base-form {
            .nut-form {
                .nut-cell-group {
                    &__wrap {
                        .nut-form-item {
                            &__body {
                                justify-content: center;

                                &__slots {
                                    .nut-cell {
                                        margin: 0;
                                        padding: 0;
                                        height: 100%;
                                        box-shadow: none;
                                        color: #353a45;

                                        .nut-cell__title {
                                            font-size: 28rpx;
                                        }
                                    }
                                }
                            }

                            &:last-child {
                                padding-bottom: 0;
                            }
                        }
                    }
                }
            }
        }
    }

    ::v-deep .nut-button {
        margin-top: 80rpx;
    }
}

@media (prefers-color-scheme: dark) {
    .add-emby-form {
        background: #1e1e20;

        &__container {
            ::v-deep .base-form {
                background-color: #2f2f2f;

                .nut-form {
                    .nut-cell-group {
                        &__wrap {
                            background-color: #2f2f2f;

                            .nut-form-item {
                                background-color: #2f2f2f;

                                .nut-form-item__label {
                                    color: #fff;
                                }

                                &__body {
                                    &__slots {
                                        .nut-cell {
                                            background-color: #2f2f2f;
                                            color: #fff;

                                            .nut-cell__title {
                                                font-size: 28rpx;
                                            }
                                        }
                                    }
                                }

                                &::after {
                                    border-color: rgb(73, 73, 73);
                                }
                            }
                        }
                    }
                }
            }
        }

        ::v-deep .nut-button {
            margin-top: 80rpx;
        }
    }
}
</style>