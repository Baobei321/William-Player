<template>
  <nut-cell-group class="base-cell">
    <nut-cell v-for="item in props.options" :key="item[props.defaultProps.title]" :is-link="item[props.defaultProps.isLink] || true" v-bind="item"
      @click="clickItem(item)">
      <template #title>
        <slot v-if="$slots.title" name="title" v-bind="item"></slot>
        <template v-else>
          {{ item[props.defaultProps.title] }}
        </template>
      </template>
      <template #icon>
        <image :src="item[props.defaultProps.leftIcon]" v-if="item[props.defaultProps.leftIcon]" />
      </template>
      <template #link>
        <image :src="theme=='light' ? icIntoBlack : icIntoWhite" class="right-icon" />
      </template>
    </nut-cell>
  </nut-cell-group>
</template>

<script setup>
import icIntoBlack from "@/static/ic-intoblack.png";
import icIntoWhite from "@/static/ic-intowhite.png";
import { toStringfy, toParse } from "@/pages/mobile/mine/common";
import { onUnload } from "@dcloudio/uni-app";
import { ref } from "vue";

const props = defineProps({
  options: { type: Array, default: [] },
  defaultProps: {
    type: Object,
    default: {
      title: "title",
      isLink: "isLink",
      leftIcon: "leftIcon",
      path: "path",
      query: "query",
    },
  },
});

const theme = ref(uni.getSystemInfoSync().theme);

const emits = defineEmits(["clickItem"]);

const clickItem = (item) => {
  if (item[props.defaultProps.path]) {
    // if (uni.getStorageSync('Authorization')) { //还在登录状态
    //   uni.navigateTo({
    //     url: item[props.defaultProps.path] + '?' + toStringfy(item[props.defaultProps.query])
    //   })
    // } else { //退出登录状态
    //   emits('toLogin', item)
    // }

    //不需要判断token是否存在，是直接跳转页面
    uni.navigateTo({
      url: toStringfy(item[props.defaultProps.query]) ? item[props.defaultProps.path] + "?" + toStringfy(item[props.defaultProps.query]) : item[props.defaultProps.path],
    });
  } else {
    emits("clickItem", item);
  }
};

const changeTheme = () => {
  theme.value = uni.getSystemInfoSync().theme;
};
uni.onThemeChange(changeTheme);
onUnload(() => {
  uni.offThemeChange(changeTheme);
});
</script>

<style lang="scss" scoped>
.base-cell {
  ::v-deep .nut-cell-group__wrap {
    border-radius: 24rpx;

    .nut-cell {
      padding: 24rpx;
      background: #fff;
      border-radius: 24rpx;
      align-items: center;
      box-shadow: none;
      margin: 0;

      &::after {
        border-bottom: 2rpx solid #f5f6f7;
      }

      .nut-cell__icon {
        margin-right: 16rpx;

        image {
          width: 60rpx;
          height: 60rpx;
        }
      }

      .nut-cell__title {
        justify-content: center;
        font-size: 30rpx;
        color: #353a45;
        line-height: normal;

        .base-cell__title {
          display: flex;
          align-items: center;

          span:last-child {
            padding-left: 24rpx;
          }
        }

        // font-weight: bold;
      }

      .right-icon {
        width: 36rpx;
        height: 36rpx;
      }
    }
  }
}
@media (prefers-color-scheme: dark) {
  .base-cell {
    ::v-deep .nut-cell-group__wrap {
      background-color: #2f2f2f;
      box-shadow: var(--nut-cell-box-shadow, 0 1px 7px 0 #000);
      .nut-cell {
        background-color: #2f2f2f;
        &::after {
          border-bottom: 2rpx solid rgb(73, 73, 73);
        }
        .nut-cell__title {
          color: #fff;
        }
      }
    }
  }
}
</style>
