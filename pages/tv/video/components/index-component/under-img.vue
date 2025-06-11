<template>
  <div class="under-img">
    <div class="under-img-background"></div>
    <image :class="['swiper-image-now',props.swipeIndex == index ? props.leave ? 'leave' : 'enter' : '']" :src="item" mode="aspectFill"
      :style="{zIndex: props.swipeIndex == index ? '2' : '1'}" v-for="(item,index) in props.imgArr" :key="item">
    </image>
  </div>
</template>

<script setup>
import { ref } from "vue";
const props = defineProps({
  imgArr: { type: Array, default: [] },
  swipeIndex: { type: Number, default: 0 },
  leave: { type: Boolean, default: false },
});
</script>

<style lang="scss" scoped>
@keyframes move0 {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-40rpx);
    opacity: 0;
  }
}
@keyframes move1 {
  from {
    transform: translateX(40rpx);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
.under-img {
  height: 70%;
  position: absolute;
  width: 100%;
  z-index: 1;
  .under-img-background {
    width: 100%;
    position: absolute;
    height: 100%;
    top: 0;
    z-index: 4;
    background: linear-gradient(to right, black 0%, rgba(0, 0, 0, 0.2) 100%);
  }
  .swiper-image-now {
    z-index: 1;
    width: 100%;
    position: absolute;
    height: 100%;
    top: 0;
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100% 100%;
    z-index: 1;
    opacity: 0;
    mask-image: linear-gradient(to bottom, #020201 80%, rgba(0, 0, 0, 0) 100%);
  }
  .leave {
    animation: move0 0.35s ease forwards;
  }
  .enter {
    animation: move1 0.35s ease forwards;
  }
}
</style>
