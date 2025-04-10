<template>
  <div class="wil-swiper">
    <nut-swiper @change="changeItem" v-bind="$attrs" ref="nut_swiper">
      <nut-swiper-item v-for="item in props.options" :key="item.img">
        <slot name="item" v-bind="item" v-if="$slots.item"></slot>
        <image :src="item.img" style="width:100%" :mode="props.imgMode" v-if="!$slots.item&&item.img" />
      </nut-swiper-item>
    </nut-swiper>
    <template v-if="isAllUnder">
      <template v-for="(bgc, index) in props.options" :key="bgc.underImg">
        <image :class="['swiper-image-now',swipeIndex == index ? leave ? 'leave' : 'enter' : '']" :src="bgc.underImg" :mode="props.imgMode"
          :style="{zIndex: swipeIndex == index ? '2' : '1'}">
        </image>
      </template>
    </template>
  </div>
</template>
  
  <script setup>
import { computed, onMounted, ref, nextTick, onBeforeMount } from "vue";

const emits = defineEmits(["change"]);

const props = defineProps({
  options: {
    type: Array,
    default: [],
  },
  imgMode: { type: String, default: "scaleToFill" },
});

const swipeIndex = ref(0);
const nut_swiper = ref(null);

const leave = ref(false);

//轮播结束后触发
const changeItem = (index) => {
  leave.value = true;
  setTimeout(() => {
    swipeIndex.value = index;
    leave.value = false;
  }, 350);
  emits("change", index);
};

//计算是否有没传底图的，如果所有都没传底图，那么不渲染底图的元素
const isAllUnder = computed(() => {
  return props.options.some((item) => {
    return item.underImg;
  });
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
.wil-swiper {
  width: 100%;
  position: relative;
  height: 100%;
  .nut-swiper {
    z-index: 3;
    height: 100%;
    .nut-swiper-inner {
      height: 100% !important;
      .nut-swiper-item {
        image {
          display: block;
          box-sizing: border-box;
          width: 100%;
          height: 100%;
        }
      }
    }
  }
  .swiper-image-now {
    width: 100%;
    position: absolute;
    height: 100%;
    top: 0;
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100% 100%;
    z-index: 1;
    opacity: 0;
  }
  .leave {
    animation: move0 0.35s ease forwards;
  }
  .enter {
    animation: move1 0.35s ease forwards;
  }
}

.out-side {
  &-enter-active {
    transition: all 0.7s ease;
    // animation: opo-in 1s;
  }

  &-leave-active {
    transition: all 0.7s ease;
    // animation: opo-out 1s;
  }

  &-enter-from {
    opacity: 0;
    transform: translateX(40rpx);
  }

  &-leave-to {
    opacity: 0;
    transform: translateX(-40rpx);
  }

  &-enter-to {
    opacity: 1;
  }

  &-leave-from {
    opacity: 1;
  }
}
</style>