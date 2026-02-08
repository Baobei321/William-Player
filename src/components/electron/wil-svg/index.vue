<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :xlink:href="iconName" :fill="color" />
  </svg>
</template>

<script>
import { defineComponent, computed } from 'vue'
export default defineComponent({
  props: {
    iconClass: {
      type: String,
      required: true,
    },
    className: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    return {
      iconName: computed(() => `#icon-${props.iconClass}`),
      svgClass: computed(() => {
        if (props.className) {
          return `wil-svg svg-icon ${props.className}`
        }
        return 'wil-svg svg-icon'
      }),
    }
  },
})
</script>

<style lang="scss" scoped>
.sub-el-icon,
.nav-icon {
  display: inline-block;
  font-size: 15px;
  margin-right: 12px;
  position: relative;
}

.svg-icon {
  width: 32rpx;
  height: 32rpx;
  position: relative;
  fill: currentColor;
  vertical-align: -2px;
}
</style>
