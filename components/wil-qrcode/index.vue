<template>
  <view class="wil-qrcode">
    <canvas id="qrcode" canvas-id='myCanvas' style="height: 300px;width: 300px;opacity: 0;"></canvas>
    <image :src="qrcodeSrc"></image>
  </view>
</template>

<script setup>
import { onMounted, getCurrentInstance, ref } from "vue";
import QRCode from "./qrcode.js";

const instance = getCurrentInstance();
const props = defineProps({
  logo: { type: String, default: "" },
});

const qrcodeSrc = ref("");

function getQRcode(text = "https://www.baidu.com/") {
  QRCode({
    canvasId: "myCanvas", // canvas-id
    text: text, // 生成内容
    size: 300, // 二维码大小
    image: props.logo, // 二维码图标
    imageSize: 50, // 二维码图标大小
    correctLevel: 1, // 容错级别
    padding: 10, // 内边距
    fileType: "jpg", // 导出文件类型
    usingComponents: false,
    context: this,
    cbResult: function (res) {
      // 生成二维码的回调
      qrcodeSrc.value = res;
    },
  });
}
// 向父组件暴漏方法，进行弹出层的打开关闭
defineExpose({
  getQRcode,
});
</script>

<style lang="scss" scoped>
.wil-qrcode {
  width: 400rpx;
  height: 400rpx;
  position: relative;
  overflow: hidden;
  image {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
  }
}
</style>