<template>
    <div class="data-sync">
        <wilQrcode ref="wilQrcodeRef" :logo="appLogo"></wilQrcode>
        <div class="scan-tip">请点击下方按钮，扫描其他设备的二维码进行数据同步</div>
        <image src="../../static/scan-button.png" class="scan-button" @click="scanCode"></image>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import wilQrcode from "../../components/wil-qrcode/index.vue";
import appLogo from "../../static/app-logo1.png"
import { setShareData, getShareData } from '../../network/apis'
import * as CONFIG from '../../utils/config';

const wilQrcodeRef = ref(null)
onMounted(async () => {
    let userId = uni.getStorageSync(CONFIG.USER_ID)
    let qrObj = { type: 'dataSync', userId }
    qrObj = JSON.stringify(qrObj)
    // 调用
    wilQrcodeRef.value.getQRcode(qrObj);

    let webdavInfo = uni.getStorageSync("webdavInfo");
    let tmdbKey = uni.getStorageSync("tmdbKey");
    let localMovieTvData = uni.getStorageSync("localMovieTvData");
    let obj = { webdavInfo, tmdbKey, localMovieTvData };
    obj = JSON.stringify(obj)
    await setShareData({ shareData: obj })
})

const scanCode = () => {
    uni.scanCode({
        success: async (res) => {
            let result = JSON.parse(res.result);
            if(result.type=='dataSync'){
                let res1 = await getShareData({ userId: result.userId })
                let data = JSON.parse(res1.data);

                uni.setStorageSync("webdavInfo",data.webdavInfo);
                uni.setStorageSync("tmdbKey",data.tmdbKey);
                uni.setStorageSync("localMovieTvData",data.localMovieTvData);
                
                uni.showToast({
                    title:'同步成功',
                    icon:'none'
                })
            }else{
                uni.showToast({
                    title:'扫描此二维码无效',
                    icon:'none'
                })
            }
        },
    })
}
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