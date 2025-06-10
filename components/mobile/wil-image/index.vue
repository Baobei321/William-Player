<template>
  <image class="wil-image" v-bind="$attrs" :src="resolveAsset(props.src)" :style="{backgroundColor:background}" @load="loadSuccess"></image>
</template>

<script setup>
import { ref } from "vue";
const props = defineProps({
  backgroundColor: { type: String, default: "transparent" },
  src: { type: String, default: "" },
});
const background = ref("transparent");
background.value = props.backgroundColor;
const loadSuccess = () => {
  background.value = "transparent";
};
const resolveAsset = (path) => {
  if (path.startsWith("@/")) {
    return new URL(path.replace("@/", "/"), import.meta.url).href;
  } else {
    return path;
  }
};
</script>

<style lang="scss" scoped>
.wil-image {
  overflow: hidden;
}
</style>
