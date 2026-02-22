<template>
  <div class="wil-empty">
    <image :src="imageMapping[props.type]"></image>
    <span>{{ props.text }}</span>
  </div>
</template>

<script setup>
import noData from '@/static/no-data.png'
import noWifi from '@/static/wifi.png'
const props = defineProps({
  text: { type: String, default: '' },
  type: { type: String, default: 'data' },
})

const imageMapping = {
  data: noData,
  car: 'https://szrcapi.mouldsdata.com/minio/tzgcs/2026/02/16/969326bb155d49c6acdd3ff619624831.png',
  comment: 'https://szrcapi.mouldsdata.com/minio/tzgcs/2026/02/16/4016874cd79149a5bfb3880e2637439c.png',
  coupon: 'https://szrcapi.mouldsdata.com/minio/tzgcs/2026/02/16/2eee878e50fa42b4b2497be026d69a9b.png',
  history: 'https://szrcapi.mouldsdata.com/minio/tzgcs/2026/02/16/459730bee7f44bc08a0120b5c726b1ac.png',
  list: 'https://szrcapi.mouldsdata.com/minio/tzgcs/2026/02/16/c9eb338576984175afb61ff3f65b1bee.png',
  message: 'https://szrcapi.mouldsdata.com/minio/tzgcs/2026/02/16/f7062dbdcd4648328e1701d5ba0fefef.png',
  order: 'https://szrcapi.mouldsdata.com/minio/tzgcs/2026/02/16/611f3eca20304a1dae76778b1f5dc553.png',
  page: 'https://szrcapi.mouldsdata.com/minio/tzgcs/2026/02/16/4b76ab4c3acf4bbea2311e288a02575d.png',
  permission: 'https://szrcapi.mouldsdata.com/minio/tzgcs/2026/02/16/edf7e5008bae4d6cb24c307ac5872e91.png',
  search: 'https://szrcapi.mouldsdata.com/minio/tzgcs/2026/02/16/d09fde259d8f4a1d9c261cb204d5851b.png',
  wifi: noWifi,
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
