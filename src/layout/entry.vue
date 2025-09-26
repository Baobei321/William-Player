<template>
  <router-view />
</template>

<script setup>
import { loginByPhone, getWeUserByopenId } from "@/network/apis";
import { encrypt } from "@/utils/jsencrypt.js";
import * as CONFIG from "@/utils/config";
import { getUserByopenId } from "@/pages/mobile/mine/common.js";
import { onBeforeMount } from "vue";
onBeforeMount(async () => {
  if (!uni.getStorageSync("Authorization")) {
    uni.setStorageSync("userPassword", { phone: "19994658532", password: "123456789" });
    await loginByPhone({ phone: "19994658532", password: encrypt("123456789") })
      .then((res) => {
        uni.setStorageSync(CONFIG.OPEN_ID, res.openId);
        getUserByopenId();
      })
      .catch((error) => {
        let settingData = uni.getStorageSync("settingData");
        if (settingData) {
          settingData.tmdbKey = "9e0add7c02b66868ab0a368df820a335";
          uni.setStorageSync("settingData", settingData);
        } else {
          uni.setStorageSync("settingData", { tmdbKey: res.data.wuser.tmdbKey, showProgress: true, playercodec: "exoplayer", showRecommend: true });
        }
      });
  }
})

</script>

<style lang="scss" scoped>
page {
  width: 100%;
  height: 100%;
}
</style>