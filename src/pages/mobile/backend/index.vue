<template>
  <view class="backend">
    <web-view :src="url" style="width: 750rpx;flex: 1;"/>
  </view>
</template>

<script>
import { useThemeNavbar } from '@/hooks/useThemeNavbar'

export default {
  setup() {
    useThemeNavbar()
  },
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
    this.url = decodeURIComponent(options.url);
  }
}
</script>

<style lang="scss" scoped>
.backend {
  width: 100%;
  height: 100%;
}
</style>