<template>
  <div class="operation-guide">
    <div class="operation-guide-title">投屏步骤</div>
    <div class="guide-first">
      <div class="guide-first-title">步骤一：打开智能电视或电视盒子，保持智能电视、电视盒子、手机连接同一WiFi。</div>
      <image src="https://www.iqiyipic.com/common/fix/h5-throwScreen/help-1.png" class="guide-first-img" mode="widthFix"></image>
    </div>
    <div class="guide-second">
      <div class="guide-second-title">步骤二：点击视频播放器上的“投屏”按钮后，在菜单中选择搜索到的投屏设备。</div>
      <image src="https://www.iqiyipic.com/common/fix/h5-throwScreen/help-2.png" class="guide-second-img" mode="widthFix"></image>
    </div>
    <div class="operation-guide-title">投屏相关问题</div>
    <div class="guide-question">为什么投屏失败？</div>
    <div class="guide-answer">
      <div class="guide-answer-item" v-for="(item,index) in answerArr1" :key="item">
        <span style="color:#ff6701;font-weight: bold;">{{ index+1 }}.</span>
        <span style="color: rgba(255,255,255,.7);">{{ item }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const answerArr1 = ["手机与智能电视或电视盒子没有连接同一个WiFi，或者手机可能连接了移动网络。", "智能电视或电视盒子机型本身不支持DLNA投屏协议。"];
</script>

<style lang="scss" scoped>
page {
  width: 100%;
  height: 100%;
}
.operation-guide {
  width: 100%;
  height: 100%;
  background-color: rgba(28, 28, 28, 0.96);
  //   background-color: #fff;
  padding: 24rpx;
  box-sizing: border-box;
  overflow: auto;
  .operation-guide-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #fff;
  }
  .guide-first {
    .guide-first-title {
      font-size: 32rpx;
      color: rgba(255, 255, 255, 0.7);
    }
    .guide-first-img {
      margin-top: 24rpx;
      width: 100%;
    }
  }
  .guide-second {
    .guide-second-title {
      font-size: 32rpx;
      color: rgba(255, 255, 255, 0.7);
    }
    .guide-second-img {
      margin-top: 24rpx;
      width: 100%;
    }
  }
  .guide-question {
    font-size: 32rpx;
    color: rgba(255, 255, 255, 0.7);
    padding-top: 24rpx;
    box-sizing: border-box;
  }
  .guide-answer {
    .guide-answer-item {
      padding-top: 14rpx;
    }
  }
}
</style>
