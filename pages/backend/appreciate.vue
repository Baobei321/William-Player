<template>
  <div class="appreciate">
    <div class="appreciate-img">
      <image src="@/static/zanshang.jpg"></image>
    </div>
    <div class="appreciate-tip">
      开发维护不易，如果您觉得此App有用，不妨使用微信扫描上方二维码，也可以在github上⭐一下，支持本软件！App完全免费！
    </div>
    <div class="appreciate-title">
      <span>❤特别感谢以下小伙伴的打赏！</span>
      <span>若有遗漏请在qq交流群联系我补充，qq群：477326591</span>
    </div>
    <div class="appreciate-list">
      <div class="appreciate-list-item" v-for="item in appreciateList" :key="item.dictValue">
        {{ `${item.dictLabel}（${item.cssClass}元）` }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { getUntokenDicts } from "@/network/apis";
const appreciateList = ref([]);
const getAppreciateUser = async () => {
  let res = await getUntokenDicts("appreciate_user");
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
  background: #f6f7f8;
  display: flex;
  flex-direction: column;
  // justify-content: center;
  align-items: center;
  padding-top: 50rpx;
  box-sizing: border-box;
  .appreciate-img {
    background: #fff;
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
    color: #000;
  }
  .appreciate-title {
    margin-top: 50rpx;
    align-self: flex-start;
    padding: 24rpx;
    border-bottom: 2rpx solid rgb(219, 219, 219);
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
      color: #000;
    }
  }
}
@media (prefers-color-scheme: dark) {
  .appreciate {
    background: #1e1e20;
    .appreciate-img {
      background: #1e1e20;
    }
    .appreciate-tip {
      color: #fff;
    }
    .appreciate-title {
      border-bottom: 2rpx solid rgb(219, 219, 219);
      color: #fff;
    }
    .appreciate-list {
      .appreciate-list-item {
        color: #fff;
      }
    }
  }
}
</style>
