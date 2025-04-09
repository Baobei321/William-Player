<template>
  <div class="entry"></div>
</template>

<script setup>
import { onBeforeMount } from "vue";
import { loginByPhone, getWeUserByopenId } from "../../network/apis";
import { encrypt } from "../../utils/jsencrypt.js";
import * as CONFIG from "../../utils/config";

const getUserByopenId = async () => {
  let res = await getWeUserByopenId({ openId: uni.getStorageSync(CONFIG.OPEN_ID) });
  uni.setStorageSync(CONFIG.USER_ID, res.data.userId);
  uni.setStorageSync(CONFIG.USER_KEY, { roleKey: res.data.roleKey, avatar: res.data.avatar, ...res.data.wuser });
  uni.setStorageSync("Authorization", res.data.token);
  uni.setStorageSync("tmdbKey", res.data.wuser.tmdbKey);
  let settingData = uni.getStorageSync("settingData");
  if (settingData) {
    settingData.tmdbKey = res.data.wuser.tmdbKey;
    uni.setStorageSync("settingData", settingData);
  } else {
    uni.setStorageSync("settingData", { tmdbKey: res.data.wuser.tmdbKey, showProgress: true });
  }
};

onBeforeMount(async () => {
  if (uni.getStorageSync("Authorization")) {
    uni.reLaunch({
      url: "/pages/video/index",
    });
  } else {
    await loginByPhone({ phone: "19994658532", password: encrypt("123456789") })
      .then((res) => {
        uni.setStorageSync(CONFIG.OPEN_ID, res.openId);
        getUserByopenId();
        uni.reLaunch({
          url: "/pages/video/index",
        });
      })
      .catch((error) => {
        uni.reLaunch({
          url: "/pages/video/index",
        });
        let settingData = uni.getStorageSync("settingData");
        if (settingData) {
          settingData.tmdbKey = "9e0add7c02b66868ab0a368df820a335";
          uni.setStorageSync("settingData", settingData);
        } else {
          uni.setStorageSync("settingData", { tmdbKey: "9e0add7c02b66868ab0a368df820a335", showProgress: true });
        }
      });
    // uni.reLaunch({
    //   url: "/pages/mine/login",
    // });
  }
});
</script>

<style lang="scss" scoped>
</style>
