<template>
    <tv-page @keyCodeClick="keyCodeClick">
        <div class="code-input">
            <div class="code-input-left">
                <wilQrcode ref="wilQrcodeRef" :logo="appLogo"></wilQrcode>
            </div>
            <div class="code-input-right">
                <div class="code-input-right__tabs">
                    <div :class="['tabs-item', tabIndex === index ? 'tabs-active' : '']" v-for="(item, index) in tabsList"
                        :key="item">{{ item }}</div>
                </div>
                <div class="code-input-right__form">
                    <tv-form labelPosition="top" :options="state.formOptions" v-model="state.formData" type="steps">
                    </tv-form>
                </div>
            </div>
        </div>
    </tv-page>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import wilQrcode from "@/components/mobile/wil-qrcode/index.vue";
import appLogo from "@/static/app-logo1.png";
import tvPage from "@/components/tv/tv-page/index.vue";
import tvForm from '@/components/tv/tv-form/index.vue'

const wilQrcodeRef = ref(null);
let port = "";
let timer = null;
const tabIndex = ref(0)//默认选中的索引
const tabsList = ['WebDAV', 'Emby', '天翼云盘', '夸克网盘']
const focusModel = ref('tabs')

const state = reactive({
    formData: {},
    formOptions: [
        { label: "名称", prop: "name", type: "input", formItemProps: { placeholder: "请输入", type: "text" }, rule: [{ required: true, message: "请输入名称" }] },
        {
            label: "协议", prop: "protocol", type: 'radio', formItemProps: { placeholder: "请选择", type: "text" }, rule: [{ required: true, message: "请选择协议" }], columns: [
                { label: "HTTP", value: "http" },
                { label: "HTTPS", value: "https" },
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
})


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
                title: '出错了',
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

const keyCodeClick = (keyCode) => {
    if (focusModel.value === 'tabs') { //在上面tabs中切换的时候
        if (keyCode === "KeyDown") { //往下就是到下面的输入form，如果是天翼和夸克，就不能往下

        } else if (keyCode === "KeyLeft") {
            if (tabIndex.value > 0) {
                tabIndex.value--
            } else {
                emits('backLeft')
            }
        } else if (keyCode === 'KeyRight') {
            if (tabIndex.value < tabsList.length - 1) {
                tabIndex.value++
            }
        }
    }
};

onMounted(() => {
    setQrcode();
    // #ifdef APP-PLUS
    startServer()
    // #endif
});
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

    .code-input-left {
        background: url('https://bpic.51yuansu.com/pic3/cover/04/05/12/6590ba8633222_800.jpg?x-oss-process=image/sharpen,100') center repeat;
        flex: 0 0 1000rpx;
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
            .tabs-active{
                background: #e5e6ec;
                color: #000;
            }
        }

        .code-input-right__form {
            padding: 0 150rpx;
        }
    }
}
</style>
