<template>
  <div :class="['appreciate', themeClass]">
    <div class="appreciate-img">
      <image src="@/static/zanshang.jpg"  />
    </div>
    <div class="appreciate-tip">
      {{ t('backend.appreciateDescription') }}
    </div>
    <div class="appreciate-title">
      <span>{{ t('backend.specialThanksDonation') }}</span>
      <span>{{ t('backend.donationMissingTip') }}</span>
    </div>
    <div class="appreciate-list">
      <div class="appreciate-list-item" v-for="item in appreciateList" :key="item.dictValue">
        {{ t('backend.donationAmount', { name: item.dictLabel, amount: item.cssClass }) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { getUntokenDicts,getDicts } from "@/network/apis";
import { useThemeNavbar } from '@/hooks/useThemeNavbar'
import { useThemeClass } from '@/hooks/useThemeClass'
import { useI18nNavbar } from '@/hooks/useI18nNavbar'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
useThemeNavbar()
useI18nNavbar('navbar.appreciate')
const themeClass = useThemeClass()
const appreciateList = ref([]);
const getAppreciateUser = async () => {
  let res = await getDicts("appreciate_user");
  appreciateList.value = res.data;
};
getAppreciateUser();
</script>

<style lang="scss" scoped>
page {
  width: 100%;
  height: 100%;
}
.appreciate {
  width: 100%;
  height: 100%;
  background: var(--app-bg);
  display: flex;
  flex-direction: column;
  // justify-content: center;
  align-items: center;
  padding-top: 50rpx;
  box-sizing: border-box;
  .appreciate-img {
    background: var(--app-bg-card);
    border-radius: 24rpx;
    width: 500rpx;
    height: 500rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    image {
      width: 450rpx;
      height: 450rpx;
    }
  }
  .appreciate-tip {
    margin-top: 60rpx;
    padding: 0 50rpx;
    text-align: center;
    font-weight: bold;
    color: var(--app-text-primary);
  }
  .appreciate-title {
    margin-top: 50rpx;
    align-self: flex-start;
    padding: 24rpx;
    border-bottom: 2rpx solid var(--app-border-strong);
    width: 100%;
    box-sizing: border-box;
    span:first-child {
      font-weight: bold;
      font-size: 34rpx;
      display: block;
    }
    span:last-child {
      font-size: 28rpx;
      display: block;
    }
  }
  .appreciate-list {
    align-self: flex-start;
    padding: 24rpx;
    flex: 1;
    overflow: auto;
    width: 100%;
    box-sizing: border-box;
    .appreciate-list-item {
      color: var(--app-text-primary);
    }
  }
}
// @media (prefers-color-scheme: dark) {
//   .appreciate {
//     background: #1e1e20;
//     .appreciate-img {
//       background: #1e1e20;
//     }
//     .appreciate-tip {
//       color: #fff;
//     }
//     .appreciate-title {
//       border-bottom: 2rpx solid var(--app-border-strong);
//       color: #fff;
//     }
//     .appreciate-list {
//       .appreciate-list-item {
//         color: #fff;
//       }
//     }
//   }
// }
</style>
