<template>
  <div class="appreciate">
    <div class="appreciate-img">
      <image src="@/static/zanshang.jpg"></image>
    </div>
    <div class="appreciate-tip">
      开发维护不易，如果您觉得此App有用，不妨使用微信扫描上方二维码，支持本软件！App完全免费！
    </div>
  </div>
</template>

<script setup>
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
  justify-content: center;
  align-items: center;
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
  }
}
</style>
