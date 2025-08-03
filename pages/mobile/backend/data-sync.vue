<template>
  <div class="data-sync">
    <wilQrcode ref="wilQrcodeRef" :logo="appLogo"></wilQrcode>
    <div class="scan-text">每隔10秒刷新一次同步状态</div>
    <div class="scan-tip">请点击下方按钮，扫描其他设备的二维码将数据同步到被扫描的设备</div>
    <image src="@/static/scan-button.png" class="scan-button" @click="scanCode"></image>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import wilQrcode from "@/components/mobile/wil-qrcode/index.vue";
import appLogo from "@/static/app-logo1.png";
import { setShareData, deleteShareData, getShareData } from "@/network/apis";
import { onUnload } from "@dcloudio/uni-app";
import * as CONFIG from '@/utils/config'

const wilQrcodeRef = ref(null);
let port = "";
let timer = null;
let init = true
// #ifdef APP-PLUS
const TcpModule = uni.requireNativePlugin("TcpModule");
const lyzmlDLNA = uni.requireNativePlugin("LyzmlDLNAModule");
// #endif

const scanCode = () => {
  uni.scanCode({
    success: async (res) => {
      let result = JSON.parse(res.result);
      if (result.type == "dataSync") {
        let obj = {
          userInfo: { userKey: uni.getStorageSync(CONFIG.USER_KEY), userId: uni.getStorageSync(CONFIG.USER_ID), userPassword: uni.getStorageSync('userPassword'), Authorization: uni.getStorageSync("Authorization") },
          localMovieTvData: uni.getStorageSync("localMovieTvData"),
          sourceList: uni.getStorageSync("sourceList"),
          historyPlay: uni.getStorageSync("historyPlay"),
        };
        // await setShareData({ port: result.port, data: obj });
        if (init) {
          TcpModule.connectAsClient(result.port, 1025, (res) => {
            init = false
            TcpModule.send(JSON.stringify(obj), (res) => {
            })
          })
        } else {
          TcpModule.send(JSON.stringify(obj), (res) => {
          })
        }

        // uni.showToast({
        //   title: "同步成功",
        //   icon: "none",
        // });
      } else {
        uni.showToast({
          title: "扫描此二维码无效",
          icon: "none",
        });
      }
    },
  });
};

const setQrcode = () => {
  let ipAddress = ''
  // #ifdef APP-PLUS
  lyzmlDLNA.getIpAddress(val => {
    ipAddress = val
  })
  // #endif
  port = String(Math.floor(Math.random() * 90000) + 10000);
  // let obj = { type: "dataSync", port: port };
  let obj = { type: "dataSync", port: ipAddress };
  wilQrcodeRef.value.getQRcode(JSON.stringify(obj));
};

//10s刷新一次同步状态
const refreshStatus = () => {
  timer = setInterval(async () => {
    await getShareData({ port: port })
      .then((res) => {
        if (res.data) {
          uni.setStorageSync("localMovieTvData", res.data.localMovieTvData);
          uni.setStorageSync("sourceList", res.data.sourceList);
          uni.setStorageSync("historyPlay", res.data.historyPlay);
          clearInterval(timer);
          timer = null;
          deleteShareData({ port: port });
          uni.showToast({
            title: "同步成功",
            icon: "none",
          });
          setTimeout(() => {
            uni.switchTab({
              url: "/pages/mobile/video/index",
            });
          }, 1500);
        }
      })
      .catch((error) => {
        clearInterval(timer);
        timer = null;
      });
  }, 10000);
};
// refreshStatus();

//作为服务端开启服务
const startServer = () => {
  TcpModule.startServer(1025, (res) => { //接收别的设备发过来的数据
    let result = JSON.parse(res)
    if (result.code == 500) {
      uni.showToast({
        title: '出错了',
        icon: 'none',
      })
    }
  });
}

onMounted(() => {
  console.log(JSON.stringify({ code: "500", msg: "出错了" }));

  setQrcode();
  // #ifdef APP-PLUS
  startServer()
  // #endif
});
onUnload(() => {
  clearInterval(timer);
  timer = null;
  deleteShareData({ port: port });
  TcpModule.closeAllConnections()
});
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

  .scan-text {
    font-size: 32rpx;
    color: #000;
  }

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

@media (prefers-color-scheme: dark) {
  .data-sync {
    background: #1e1e20;

    .scan-text {
      color: #fff;
    }
  }
}
</style>