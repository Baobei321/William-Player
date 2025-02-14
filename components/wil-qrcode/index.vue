<template>
    <view class="wil-qrcode">
        <canvas id="qrcode" canvas-id='qrcode' style="height: 100%;width: 100%;"></canvas>
    </view>
</template>

<script setup>
import { onMounted, getCurrentInstance, ref } from 'vue';
import QRCode from './qrcode.js'
const instance = getCurrentInstance();

const props = defineProps({
    logo: { type: String, default: '' },
})

const qrcodeSrc = ref('')

function getQRcode(text = "https://www.baidu.com/") {
    QRCode({
        canvasId: "qrcode", // canvas-id
        text: text, // 生成内容
        size: 200, // 二维码大小
        image: props.logo, // 二维码图标
        imageSize: 50, // 二维码图标大小
        correctLevel: 1, // 容错级别
        padding: 10, // 内边距
        fileType: "jpg", // 导出文件类型
        usingComponents: true,
        context: instance.ctx,
        cbResult: function (res) { // 生成二维码的回调
            console.log("查看临时路径", res)
            qrcodeSrc.value = res
            // #ifdef MP-WEIXIN
            wx.showShareImageMenu({
                path: res
            })
            // #endif
        },
    })
}
// 向父组件暴漏方法，进行弹出层的打开关闭
defineExpose({
    getQRcode,
})
</script>

<style lang="scss" scoped>
.wil-qrcode {
    width: 400rpx;
    height: 400rpx;
}
</style>