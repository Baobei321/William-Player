<template>
  <div class="search">
    <wil-title title="搜索"></wil-title>
    <div class="search-container">
      <div class="search-container-input">
        <input v-model="searchValue" placeholder="搜索" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import wilTitle from '@/components/electron/wil-title/index.vue'
import { ref } from 'vue'
const searchValue = ref('')
</script>

<style lang="scss" scoped>
.search {
  .search-container {
  }
}
</style>
