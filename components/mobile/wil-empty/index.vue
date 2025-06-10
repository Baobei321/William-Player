<template>
  <div class="wil-empty">
    <image src="@/static/no-data.png"></image>
    <span>{{ props.text }}</span>
  </div>
</template>

<script setup>
const props = defineProps({
  text: { type: String, default: "" },
});
</script>

<style lang="scss" scoped>
.wil-empty {
  font-size: 28rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  image {
    width: 400rpx;
    height: 400rpx;
  }
}
</style>
