<template>
  <div class="tmdb-key">
    <div class="tmdb-key-title">请输入要修改的tmdbKey</div>
    <nut-input v-model="settingData.tmdbKey" placeholder="请输入tmdbKey" @blur="inputTmdb"></nut-input>
    <div class="tmdb-key-title">播放设置</div>
    <wil-form :options="settings1" :show-button="true" ref="base_form" v-model="formData" :showButton="false">
      <template #showProgress>
        <nut-switch v-model="settingData.showProgress" active-color="#ff6701" @change="(val)=>changeSwitch(val,'进度条')" />
      </template>
      <!-- <template #playercodec>
        <nut-radio-group v-model="settingData.playercodec" direction="horizontal" @change="(val)=>changeSwitch(val,'解码器')">
          <nut-radio label="exoplayer">ExoPlayer</nut-radio>
          <nut-radio label="ijkplayer">IjkPlayer</nut-radio>
        </nut-radio-group>
      </template> -->
    </wil-form>
    <div class="tmdb-key-title">显示设置</div>
    <wil-form :options="settings2" :show-button="true" ref="base_form" v-model="formData" :showButton="false">
      <template #showRecommend>
        <nut-switch v-model="settingData.showRecommend" active-color="#ff6701" @change="(val)=>changeSwitch(val,'推荐')" />
      </template>
    </wil-form>
    <!-- <nut-button custom-color="#090909" @click="confirmSet">确认设置</nut-button> -->
  </div>
</template>

<script setup>
import { ref, onBeforeMount } from "vue";
import { setTmdbKey } from "../../network/apis";
import wilForm from "@/components/wil-form/index.vue";
const settingData = ref({
  tmdbKey: "",
  showProgress: true,
  playercodec: "exoplayer",
  showRecommend: true,
});
const settings1 = ref([
  { label: "是否显示底部进度条", prop: "showProgress" },
  // { label: "视频解码器", prop: "playercodec" },
]);
const settings2 = ref([{ label: "是否显示首页影视推荐", prop: "showRecommend" }]);

const confirmSet = async () => {
  uni.setStorageSync("settingData", settingData.value);
  // await setTmdbKey({ tmdbKey: tmdbKey.value })
  uni.showToast({
    title: "设置成功",
    icon: "none",
  });
};

const inputTmdb = () => {
  uni.setStorageSync("settingData", settingData.value);
};

const changeSwitch = (val, type) => {
  if (type == "进度条") {
    settingData.value.showProgress = val;
  } else if (type == "推荐") {
    settingData.value.showRecommend = val;
  } else if (type == "解码器") {
    settingData.value.playercodec = val;
  }
  uni.setStorageSync("settingData", settingData.value);
};

onBeforeMount(() => {
  let settingData1 = uni.getStorageSync("settingData");
  if (settingData1) {
    settingData.value = settingData1;
  }
});
</script>

<style lang="scss" scoped>
page {
  width: 100%;
  height: 100%;
}
.tmdb-key {
  background: #f6f7f8;
  width: 100%;
  height: 100%;
  padding: 36rpx 24rpx 0 24rpx;
  box-sizing: border-box;
  .tmdb-key-title {
    font-size: 36rpx;
    color: #000;
    font-weight: bold;
    margin-top: 24rpx;
  }
  ::v-deep .nut-input {
    padding-left: 20rpx;
    margin-top: 30rpx;
  }
  ::v-deep .nut-button {
    width: 100%;
    margin-top: 30rpx;
    height: 80rpx;
    border-radius: 16rpx;
  }
  ::v-deep .base-form {
    background: transparent;
    .base-form-content {
      .nut-form {
        .nut-cell-group__wrap {
          margin-bottom: 0;
          background: transparent;
          .nut-form-item {
            background: transparent;
            .nut-form-item__label {
              font-size: 32rpx;
            }
            .nut-form-item__body {
              align-items: flex-end;
              .nut-form-item__body__slots {
                .nut-radio-group{
                  .nut-radio {
                    .nut-icon-check-checked{
                      color: #ff6701;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
