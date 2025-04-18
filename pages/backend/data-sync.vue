<template>
  <div class="data-sync">
    <wilQrcode ref="wilQrcodeRef" :logo="appLogo"></wilQrcode>
    <div class="scan-tip">请点击下方按钮，扫描其他设备的二维码将数据同步到被扫描的设备</div>
    <image src="@/static/scan-button.png" class="scan-button" @click="scanCode"></image>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import wilQrcode from "@/components/wil-qrcode/index.vue";
import appLogo from "@/static/app-logo1.png";
import { onUnload } from "@dcloudio/uni-app";

const wilQrcodeRef = ref(null);
const udpClient = ref(null);

const onSocketMsg = (resData) => {
  // resData 的数据结构：{ host, port, data, hex }
  console.log("接收到消息: " + resData);
  let data = JSON.parse(resData.data);
  uni.setStorageSync("localMovieTvData", data.localMovieTvData);
  uni.setStorageSync("sourceList", data.sourceList);
};

const onSocketError = (errMsg) => {
  console.error("socket 异常：" + errMsg);
};

const scanCode = () => {
  uni.scanCode({
    success: async (res) => {
      let result = JSON.parse(res.result);
      if (result.type == "dataSync") {
        // udpClient.value.send({
        //   host: result.ipAddress,
        //   port: result.port,
        //   data: JSON.stringify({ localMovieTvData: uni.getStorageSync("localMovieTvData") || {}, sourceList: uni.getStorageSync("sourceList") || [] }),
        //   useHex: true, // 使用 hexString ，默认为 false
        // });
        uni.showToast({
          title: "同步成功",
          icon: "none",
        });
      } else {
        uni.showToast({
          title: "扫描此二维码无效",
          icon: "none",
        });
      }
    },
  });
};

// onMounted(async () => {
//   let ipAddress = "";
//   // #ifdef APP-PLUS
//   udpClient.value = uni.requireNativePlugin("udp-client");
//   udpClient.value.setByteSize(65507);
//   udpClient.value.init(10005, onSocketMsg, onSocketError);
//   let lyzmlDLNA = uni.requireNativePlugin("LyzmlDLNAModule");
//   lyzmlDLNA.getIpAddress((res) => {
//     ipAddress = res;
//     let qrObj = { type: "dataSync", ipAddress: ipAddress, port: 10005 };
//     qrObj = JSON.stringify(qrObj);
//     // 调用生成二维码
//     wilQrcodeRef.value.getQRcode(qrObj);
//   });
//   // #endif
// });

// onUnload(() => {
//   udpClient.value.release();
// });
</script>

<style lang="scss" scoped>
page {
  width: 100%;
  height: 100%;
}

.data-sync {
  width: 100%;
  height: 100%;
  background: #f6f7f8;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
  box-sizing: border-box;

  .scan-tip {
    margin-top: 100rpx;
    padding: 0 100rpx;
    text-align: center;
    color: #ff6701;
    font-size: 32rpx;
  }

  .scan-button {
    width: 100rpx;
    height: 100rpx;
    margin-top: 20rpx;
  }
}
</style>