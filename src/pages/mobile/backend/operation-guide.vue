<template>
  <div class="operation-guide">
    <div class="operation-guide-title">{{ t('backend.screencastSteps') }}</div>
    <div class="guide-first">
      <div class="guide-first-title">{{ t('backend.screencastStepOne') }}</div>
      <image src="https://www.iqiyipic.com/common/fix/h5-throwScreen/help-1.png" class="guide-first-img" mode="widthFix"  />
    </div>
    <div class="guide-second">
      <div class="guide-second-title">{{ t('backend.screencastStepTwo') }}</div>
      <image src="https://www.iqiyipic.com/common/fix/h5-throwScreen/help-2.png" class="guide-second-img" mode="widthFix"  />
    </div>
    <div class="operation-guide-title">{{ t('backend.screencastQuestions') }}</div>
    <div class="guide-question">{{ t('backend.whyScreencastFailed') }}</div>
    <div class="guide-answer">
      <div class="guide-answer-item" v-for="(item,index) in answerArr1" :key="item">
        <span style="color:#ff6701;font-weight: bold;">{{ index+1 }}.</span>
        <span style="color: rgba(255,255,255,.7);">{{ item }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeNavbar } from '@/hooks/useThemeNavbar'
import { useI18nNavbar } from '@/hooks/useI18nNavbar'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
useThemeNavbar()
useI18nNavbar('navbar.operationGuide')
const answerArr1 = computed(() => [t('backend.screencastFailReasonNetwork'), t('backend.screencastFailReasonDlna')]);
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
