<template>
  <div class="no-permission">
  <wil-empty type="permission" :text="t('common.notPermission')"></wil-empty>
  </div>
</template>

<script setup>
import wilEmpty from '@/components/mobile/wil-empty/index.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style lang="scss" scoped>
page {
  width: 100%;
  height: 100%;
}
.no-permission {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
