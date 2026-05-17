<template>
  <div class="share-dialog">
    <nut-dialog :title="t('video.viewCopiedShareLink')" :ok-text="t('video.immediatelyView')" v-bind="$attrs" @ok="confirmLook" />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const props = defineProps({
  shareUrl: { type: String, default: "" },
});
const confirmLook = () => {
  uni.navigateTo({
    url: `/pages/mobile/backend/index?url=${props.shareUrl}`,
  });
};
</script>

<style lang="scss" scoped>
.share-dialog {
  ::v-deep .nut-popup--center {
    .nut-dialog {
      .nut-dialog__header {
        height: 80rpx;
        line-height: 80rpx;
      }
      .nut-dialog__content {
        margin: 0;
      }
      .nut-dialog__footer {
        .nut-button {
          height: 80rpx;
        }
        .nut-dialog__footer-cancel {
          border: 2rpx solid #ff6701 !important;
          color: #ff6701;
        }
        .nut-dialog__footer-ok {
          border: 2rpx solid #ff6701 !important;
          background: #ff6701;
          color: #fff;
        }
      }
    }
  }
}
</style>
