<template>
    <tv-page @keyCodeClick="keyCodeClick">
        <div class="code-input">
            <div class="code-input-left">
                <wilQrcode ref="wilQrcodeRef" :logo="appLogo"></wilQrcode>
            </div>
            <div class="code-input-right">
                <div class="code-input-right__tabs">
                    <div :class="['tabs-item', item.active ? 'tabs-active' : '', tabIndex === index ? 'tabs-select' : '']"
                        v-for="(item, index) in tabsList" :key="item.value" @click="changeTab(item, index)">{{ item.name
                        }}
                    </div>
                </div>
                <div class="code-input-right__form">
                    <tv-form labelPosition="top" :options="webdavFormOptions" v-model="state.webdavFormData"
                        :showButton="true" :buttonText="t('common.submit')" type="steps" v-if="activeTab === 'WebDAV'" ref="webdav_form"
                        @confirm="confirmSubmit" @triggerBoundary="triggerBoundary">
                    </tv-form>
                    <tv-form labelPosition="top" :options="embyFormOptions" v-model="state.embyFormData"
                        :showButton="true" :buttonText="t('common.submit')" type="steps" v-if="activeTab === 'Emby'" ref="emby_form"
                        @confirm="confirmSubmit" @triggerBoundary="triggerBoundary">
                    </tv-form>
                </div>
            </div>
        </div>
    </tv-page>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from "vue";
import { useI18n } from "vue-i18n";
import wilQrcode from "@/components/mobile/wil-qrcode/index.vue";
import appLogo from "@/static/app-logo1.png";
import tvPage from "@/components/tv/tv-page/index.vue";
import tvForm from '@/components/tv/tv-form/index.vue'
import { validateWebdav, validateEmby } from "@/utils/validate";
import { onLoad } from "@dcloudio/uni-app";

const { t } = useI18n()
const wilQrcodeRef = ref(null);
const webdav_form = ref(null)
const emby_form = ref(null)

const routerParams = ref({})

let port = "";
let timer = null;
let sub189Nvue = null;
let subQuarkNvue = null;

const tabIndex = ref(0)//默认选中的索引
const activeTab = ref('WebDAV')
const tabsList = computed(() => [
    { value: 'WebDAV', name: 'WebDAV', active: activeTab.value === 'WebDAV' },
    { value: 'Emby', name: 'Emby', active: activeTab.value === 'Emby' },
    { value: '天翼云盘', name: t('navbar.tianyiCloudDrive'), active: activeTab.value === '天翼云盘' },
    { value: '夸克网盘', name: t('navbar.quarkCloudDrive'), active: activeTab.value === '夸克网盘' }
])

const focusModel = ref('tabs')//当前键盘控制器在哪个组件上

const state = reactive({
    //webdav的表单配置
    webdavFormData: { protocol: 'http' },
    webdavOldData:{},
    //emby的表单配置
    embyFormData: { protocol: 'http' },
    embyOldData:{}
})
const protocolOptions = [
    { label: 'HTTP', value: 'http' },
    { label: 'HTTPS', value: 'https' },
]
const webdavFormOptions = computed(() => [
    { label: t('source.name'), prop: 'name', type: 'input', formItemProps: { placeholder: t('common.input'), type: 'text' }, rule: [{ required: true, message: t('source.pleaseInputName') }] },
    {
        label: t('source.protocol'), prop: 'protocol', type: 'radio', formItemProps: { placeholder: t('common.select'), type: 'text' }, rule: [{ required: true, message: t('source.pleaseSelectProtocol') }], columns: protocolOptions,
    },
    { label: t('source.address'), prop: 'address', type: 'input', formItemProps: { placeholder: t('source.exampleLocalhost'), type: 'text' }, rule: [{ required: true, message: t('source.pleaseInputAddress') }] },
    { label: t('source.port'), prop: 'port', type: 'input', formItemProps: { placeholder: t('source.requiredPortExample5244'), type: 'number' }, rule: [{ required: true, message: t('source.pleaseInputPort') }] },
    {
        label: t('source.username'),
        prop: 'username',
        type: 'input',
        formItemProps: { placeholder: t('source.alistUsernamePlaceholder'), type: 'text' },
        rule: [{ required: true, message: t('source.pleaseInputUsername') }],
    },
    { label: t('source.password'), prop: 'password', type: 'input', formItemProps: { placeholder: t('source.alistPasswordPlaceholder'), type: 'password' }, rule: [{ required: true, message: t('source.pleaseInputPassword') }] },
])
const embyFormOptions = computed(() => [
    {
        label: t('source.protocol'), prop: 'protocol', type: 'radio', formItemProps: { placeholder: t('common.select'), type: 'text' }, rule: [{ required: true, message: t('source.pleaseSelectProtocol') }], columns: protocolOptions,
    },
    { label: t('source.address'), prop: 'address', type: 'input', formItemProps: { placeholder: t('source.exampleLocalhost'), type: 'text' }, rule: [{ required: true, message: t('source.pleaseInputAddress') }] },
    { label: t('source.port'), prop: 'port', type: 'input', formItemProps: { placeholder: t('source.requiredPortExample443'), type: 'number' }, rule: [{ required: true, message: t('source.pleaseInputPort') }] },
    {
        label: t('source.username'),
        prop: 'username',
        type: 'input',
        formItemProps: { placeholder: t('source.embyUsernamePlaceholder'), type: 'text' },
        rule: [{ required: true, message: t('source.pleaseInputUsername') }],
    },
    { label: t('source.password'), prop: 'password', type: 'input', formItemProps: { placeholder: t('source.embyPasswordPlaceholder'), type: 'password' }, rule: [{ required: true, message: t('source.pleaseInputPassword') }] },
])


// #ifdef APP-PLUS
let ipAddress = ''
let TcpModule = uni.requireNativePlugin("TcpModule");
const lyzmlDLNA = uni.requireNativePlugin("LyzmlDLNAModule");
// #endif
const setQrcode = (sourceType) => {
    // #ifdef APP-PLUS
    if (ipAddress) {
        port = ipAddress + ':' + String(Math.floor(Math.random() * 90000) + 10000);
        let obj = { type: "sourceInput", sourceType, port: port };
        wilQrcodeRef.value.getQRcode(JSON.stringify(obj));
    } else {
        lyzmlDLNA.getIpAddress(val => {
            ipAddress = val
            port = ipAddress + ':' + String(Math.floor(Math.random() * 90000) + 10000);
            let obj = { type: "sourceInput", sourceType, port: port };
            wilQrcodeRef.value.getQRcode(JSON.stringify(obj));
        })
    }
    // #endif

    // #ifndef APP-PLUS
    port = ':' + String(Math.floor(Math.random() * 90000) + 10000);
    let obj = { type: "sourceInput", port: port };
    wilQrcodeRef.value.getQRcode(JSON.stringify(obj));
    // #endif

};

//作为服务端开启服务
const startServer = () => {
    TcpModule.startServer(1025, (res) => { //接收别的设备发过来的数据
        let result = JSON.parse(res)
        if (result.code == 500) {
            uni.showToast({
                title: t('common.errorOccurred'),
                icon: 'none',
            })
        } else {
            uni.setStorageSync('sourceList', result)
            uni.setStorageSync('historyPlay', result.historyPlay)
            uni.setStorageSync('isreload', true)
            uni.switchTab({
                url: '/pages/mobile/video/index'
            })
        }
    });
}

//点击选择tab
const changeTab = (item, index) => {
    if (item.value === activeTab.value) return
    activeTab.value = item.value
    tabIndex.value = index
    if (activeTab.value === '天翼云盘') {
        open189Webview()
    } else if (activeTab.value === '夸克网盘') {
        openQuarkWebview()
    } else {
    }
}

const keyCodeClick = (keyCode) => {
    if (focusModel.value === 'tabs') { //在上面tabs中切换的时候
        if (keyCode === "KeyDown") { //往下就是到下面的输入form，如果是天翼和夸克，就不能往下
            if (activeTab.value === 'WebDAV' || activeTab.value === 'Emby') {
                focusModel.value = 'form'
                tabIndex.value = tabsList.value.findIndex(v => v.value === activeTab.value)
                activeTab.value === 'WebDAV' ? webdav_form.value.evtMove(keyCode) : emby_form.value.evtMove(keyCode)
            }
        } else if (keyCode === "KeyLeft") {
            if (tabIndex.value > 0) {
                tabIndex.value--
            } else {
                emits('backLeft')
            }
        } else if (keyCode === 'KeyRight') {
            if (tabIndex.value < tabsList.value.length - 1) {
                tabIndex.value++
            }
        } else if (keyCode === 'KeyEnter') {
            changeTab(tabsList.value[tabIndex.value], tabIndex.value)
        }
    } else if (focusModel.value === 'form') {//遥控器在表单中切换的时候
        if (activeTab.value === 'WebDAV') {
            webdav_form.value.evtMove(keyCode)
        } else if (activeTab.value === 'Emby') {
            emby_form.value.evtMove(keyCode)
        }
    }
};

//表单提交
const confirmSubmit = () => {
    if (activeTab.value === 'WebDAV') {
        webdav_form.value.submitForm(valid => {
            if (valid) {
                validateWebdav(!routerParams.value.type, state.webdavFormData,state.webdavOldData, {})
            }
        })
    } else if (activeTab.value === 'Emby') {
        emby_form.value.submitForm(valid => {
            if (valid) {
                validateEmby(!routerParams.value.type, state.embyFormData,state.embyOldData, {})
            }
        })
    }
}

//表单触发边界
const triggerBoundary = (direction) => {
    if (direction === 'up') {
        focusModel.value = 'tabs'
    }
}

//打开天翼云盘的webview
const open189Webview = () => {
    uni.navigateTo({
        url:`/pages/mobile/backend/cloud189-webview?platform=TV&url=${encodeURIComponent('https://cloud.189.cn')}`
    })
}

//打开夸克网盘的webview
const openQuarkWebview = () => {
     uni.navigateTo({
        url:`/pages/mobile/backend/quark-webview?platform=TV&url=${encodeURIComponent('https://pan.quark.cn')}`
    })  
}

onMounted(() => {
    setQrcode();
    // #ifdef APP-PLUS
    startServer()
    // #endif

});

onLoad((options) => {
    routerParams.value = options
})
</script>

<style lang="scss" scoped>
page {
    width: 100%;
    height: 100%;
}

.code-input {
    width: 100%;
    height: 100%;
    display: flex;
    background: #000;

    .code-input-left {
        background: url('@/static/bg-wheat.jpg') center repeat;
        flex: 0 0 32%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        .wil-qrcode {
            width: 600rpx;
            height: 600rpx;
        }
    }

    .code-input-right {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;

        .code-input-right__tabs {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 200rpx;
            margin-top: 24rpx;

            .tabs-item {
                padding: 12rpx 46rpx;
                border-radius: 30rpx;
                // background: #fff;
                border: 4rpx solid transparent;
                color: #a0c3f6;
                margin-left: 24rpx;

                &:first-child {
                    margin-left: 0;
                }
            }

            .tabs-active {
                background: #e5e6ec;
                color: #000;
            }

            .tabs-select {
                border: 4rpx solid #e5e6ec;
            }
        }

        .code-input-right__form {
            flex: 1;
            overflow: hidden;
            padding: 0 150rpx 50rpx 150rpx;
            margin-top: 40rpx;
        }
    }
}
</style>
