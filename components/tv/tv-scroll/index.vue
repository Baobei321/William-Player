<template>
  <scroll-view class="tv-scroll" :scroll-x="true" style="width: 100%" :enhanced="true" :showScrollbar="false" :scroll-with-animation="true"
    :scroll-into-view="props.scrollIntoView" v-bind="$attrs">
    <slot></slot>
  </scroll-view>
</template>

<script setup>
import { ref } from "vue";
const props = defineProps({
  scrollIntoView: { type: String, default: "" },
});
</script>

<style lang="scss" scoped>
</style>
