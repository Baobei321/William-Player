<template>
  <div class="wil-empty">
    <image src="@/static/no-data.png" v-if="props.type === 'data'"></image>
    <image src="@/static/no-wifi.png" v-else-if="props.type === 'wifi'"></image>
    <image src="https://oss-dev.quectel.com/group1/2026/02/05/285dbe9fc33f432383f23548c4488ed8.png" v-else-if="props.type === 'permission'"></image>
    <span>{{ props.text }}</span>
  </div>
</template>

<script setup>
const props = defineProps({
  text: { type: String, default: '' },
  type: { type: String, default: 'data' },
})
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
  span {
    color: #9b9b9b;
  }
}
</style>
