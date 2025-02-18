<template>
  <view class="backend">
    <web-view :src="url" style="width: 750rpx;flex: 1;"/>
  </view>
</template>

<script>
export default {
  data() {
    return {
      url: '',

    }
  },
  methods: {
	  getCookies(event){
		  uni.setStorageSync('webviewCookie',event.detail.cookies);
	  }
  },
  onLoad(options) {
    this.url = options.url
  }
}
</script>

<style lang="scss">
.backend {
  width: 100%;
  height: 100%;
}
</style>