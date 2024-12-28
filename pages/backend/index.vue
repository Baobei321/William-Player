<template>
  <view class="backend">
    <web-view :src="url" />
  </view>
</template>

<script>
export default {
  data () {
    return {
      url: 'http://111.173.105.111:8080/manage'
    }
  },
}
</script>

<style lang="scss">
.backend {
  width: 100%;
  height: 100%;
}
</style>
