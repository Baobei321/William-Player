<template>
  <div class="no-permission">
    <wil-empty type="permission" text="暂无权限，请联系管理员"></wil-empty>
  </div>
</template>

<script setup>
import wilEmpty from '@/components/mobile/wil-empty/index.vue'
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
