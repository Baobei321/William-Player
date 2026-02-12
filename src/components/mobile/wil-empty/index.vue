<template>
  <div class="wil-empty">
    <image :src="imageMapping[props.type]"></image>
    <span>{{ props.text }}</span>
  </div>
</template>

<script setup>
import noData from '@/static/no-data.png'
const props = defineProps({
  text: { type: String, default: '' },
  type: { type: String, default: 'data' },
})

const imageMapping = {
  data: noData,
  car: 'https://ps.ssl.qhimg.com/t027251a15cc0e30e3e.jpg',
  comment: 'https://uview-plus.jiangruyi.com/uview/empty/comment.png',
  coupon: 'https://uview-plus.jiangruyi.com/uview/empty/coupon.png',
  history: 'https://uview-plus.jiangruyi.com/uview/empty/history.png',
  list: 'https://uview-plus.jiangruyi.com/uview/empty/list.png',
  message: 'https://uview-plus.jiangruyi.com/uview/empty/message.png',
  news: 'https://uview-plus.jiangruyi.com/uview/empty/news.png',
  order: 'https://uview-plus.jiangruyi.com/uview/empty/order.png',
  page: 'https://uview-plus.jiangruyi.com/uview/empty/page.png',
  permission: 'https://uview-plus.jiangruyi.com/uview/empty/permission.png',
  search: 'https://uview-plus.jiangruyi.com/uview/empty/search.png',
  wifi: 'https://uview-plus.jiangruyi.com/uview/empty/wifi.png',
}
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
