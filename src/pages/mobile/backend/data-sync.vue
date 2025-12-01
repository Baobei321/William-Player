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
const port = ref("");
let timer = null;
let init = true
// #ifdef APP-PLUS
let TcpModule = uni.requireNativePlugin("TcpModule");
let lyzmlDLNA = uni.requireNativePlugin("LyzmlDLNAModule");
// #endif

const scanCode = () => {
  uni.scanCode({
    success: async (res) => {
      let result = JSON.parse(res.result);
      if (result.type == "dataSync") {
        let obj = {
          userInfo: {
            userKey: uni.getStorageSync(CONFIG.USER_KEY), userId: uni.getStorageSync(CONFIG.USER_ID),
            Authorization: uni.getStorageSync("Authorization"), refreshToken: uni.getStorageSync('refreshToken')
          },
          // localMovieTvData: uni.getStorageSync("localMovieTvData"),
          muluData: uni.getStorageSync('muluData') || {},
          sourceList: uni.getStorageSync("sourceList"),
          historyPlay: uni.getStorageSync("historyPlay"),
        };
        if (init) {
          uni.showToast({
            title: "开始连接",
            icon: 'none'
          })
          TcpModule.connectAsClient(result.port.split(':')[0], 1025, (res) => {
            uni.showToast({
              title: res,
              icon: 'none'
            })
            let result = JSON.parse(res)
            if (result.code == 500) { //本地局域网同步失败，走后端接口同步
              setShareData({ port: result.port.split(':')[1], data: obj }).then(() => {
                uni.showToast({
                  title: "同步成功",
                  icon: "none",
                });
              })
            } else { //本机局域网同步成功
              init = false
              TcpModule.send(JSON.stringify(obj), (res1) => {
                let res2 = JSON.parse(res1)
                if (res2.code == 500) {
                  uni.showToast({
                    title: '同步失败请重新扫描',
                    icon: 'none'
                  })
                } else {
                  uni.showToast({
                    title: "同步成功",
                    icon: "none",
                  });
                }
              })
            }
          })
        } else {
          TcpModule.send(JSON.stringify(obj), (res1) => {
            let res2 = JSON.parse(res1)
            if (res2.code == 500) {
              uni.showToast({
                title: '同步失败请重新扫描',
                icon: 'none'
              })
            } else {
              uni.showToast({
                title: "同步成功",
                icon: "none",
              });
            }
          })
        }
      } else if (result.type == 'sourceInput') { //手机扫码输入资源传到电视

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
    port.value = ipAddress + ':' + String(Math.floor(Math.random() * 90000) + 10000);
    // let obj = { type: "dataSync", port: port };
    let obj = { type: "dataSync", port: port.value };
    wilQrcodeRef.value.getQRcode(JSON.stringify(obj));
  })
  // #endif

  // #ifndef APP-PLUS
  port.value = ':' + String(Math.floor(Math.random() * 90000) + 10000);
  let obj = { type: "dataSync", port: port.value };
  wilQrcodeRef.value.getQRcode(JSON.stringify(obj));
  // #endif
};

//10s刷新一次同步状态
const refreshStatus = () => {
  timer = setInterval(async () => {
    await getShareData({ port: port.value.split(':')[1] })
      .then((res) => {
        if (res.data) {
          uni.setStorageSync("localMovieTvData", res.data.localMovieTvData);
          uni.setStorageSync("sourceList", res.data.sourceList);
          uni.setStorageSync("historyPlay", res.data.historyPlay);
          clearInterval(timer);
          timer = null;
          deleteShareData({ port: port.value.split(':')[1] });
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
refreshStatus();

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
      if (result?.code != 501) { //过滤掉发送完消息成功之后中止连接的501报错
        uni.setStorageSync('sourceList', result.sourceList)
        uni.setStorageSync('historyPlay', result.historyPlay)
        uni.setStorageSync('muluData', result.muluData)
        uni.setStorageSync('isreload', true)
        uni.switchTab({
          url: '/pages/mobile/video/index'
        })
      }
    }
  });
}

onMounted(() => {
  setQrcode();
  // #ifdef APP-PLUS
  startServer()
  // #endif
});
onUnload(() => {
  clearInterval(timer);
  timer = null;
  deleteShareData({ port: port.value.split(':')[1] });
  TcpModule ? TcpModule.closeAllConnections() : ''
  TcpModule = null
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

// @media (prefers-color-scheme: dark) {
//   .data-sync {
//     background: #1e1e20;

//     .scan-text {
//       color: #fff;
//     }
//   }
// }
</style>