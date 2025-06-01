<template>
  <div class="category-list">
    <div class="category-list-wrap">
      <scroll-view :scroll-y="true" :scroll-with-animation="true" class="category-list-menu menu-scroll-view" :scroll-top="scrollTop" :scroll-into-view="itemId"
        :enhanced="true" :showScrollbar="false">
        <div v-for="(item, index) in list" :key="index" class="category-list-tab-item" :class="[current == index ? 'category-list-tab-item-active' : '']"
          @click.stop="switchMenu(item,index)">
          <!-- <span class="category-list-tab-item__line"></span> -->
          <span class="category-list-tab-item__name">{{ item[props.listProps.name] }}</span>
        </div>
      </scroll-view>
      <scroll-view :scroll-y="true" :scroll-with-animation="true" class="category-list-container" :enhanced="true" :showScrollbar="false">
        <div class="category-list-container-item">
          <!-- 三级分类的情况 -->
          <template v-if="rightData[props.listProps.children]?.some(v=>v[props.listProps.children]?.length)">
            <div class="category-list-container-title">
              <span class="category-list-container-title__line"></span>
              <span class="category-list-container-title__name">{{ rightData[props.listProps.name] }}</span>
              <span class="category-list-container-title__line"></span>
            </div>
            <template v-for="second in rightData[props.listProps.children]" :key="second[props.listProps.name]">
              <div class="category-list-container-item__title" v-if="second[props.listProps.children]?.length">
                <span>{{ second[props.listProps.name] }}</span>
              </div>
              <template v-if="second[props.listProps.children]?.length">
                <slot name="custom" :row="second" v-if="$slots.custom"></slot>
                <div class="category-list-container-item__content" v-else>
                  <div class="thumb-box" v-for="third in second[props.listProps.children]" :key="third[props.listProps.name]" @click="clickItem(third)">
                    <img :src="third[props.listProps.img]" class="thumb-box-img" mode="aspectFill">
                    <div class="thumb-box-name">{{ third[props.listProps.name] }}</div>
                  </div>
                </div>
              </template>
            </template>
          </template>
          <!-- 二级分类的情况 -->
          <template v-else>
            <div class="category-list-container-item__title">
              <span>{{ rightData[props.listProps.name] }}</span>
            </div>
            <slot name="custom" :row="rightData" v-if="$slots.custom"></slot>
            <div class="category-list-container-item__content" v-else>
              <div class="thumb-box" v-for="second in rightData[props.listProps.children]" :key="second[props.listProps.name]" @click="clickItem(second)">
                <img :src="second[props.listProps.img]" class="thumb-box-img" mode="aspectFill">
                <div class="thumb-box-name">{{ second[props.listProps.name] }}</div>
              </div>
            </div>
          </template>
        </div>
      </scroll-view>
    </div>
  </div>
</template>
  
  <script setup>
import { onMounted, ref, watchEffect, nextTick } from "vue";

const props = defineProps({
  list: { type: Array, default: [] },
  rightData: { type: Object, default: {} },
  listProps: { type: Object, default: {} },
});

const scrollTop = ref(0);
const current = ref(null);

const rightData = ref([]);
const itemId = ref("");

const stopSetActive = ref(false);

const leftHeight = ref({
  menuHeight: 0,
  menuItemHeight: 0,
});

const emits = defineEmits(["change", "clickItem"]);

// 获取一个目标元素的高度
const getElRect = async (elClass, dataVal) => {
  return new Promise((resolve, reject) => {
    const query = uni.createSelectorQuery();
    query
      .select("." + elClass)
      .fields(
        {
          size: true,
        },
        (res) => {
          if (!res) {
            setTimeout(() => {
              getElRect(elClass);
            }, 10);
            return;
          }
          leftHeight.value[dataVal] = res.height;
          resolve();
        }
      )
      .exec();
  });
};

// 设置左边菜单的滚动状态
const leftMenuStatus = async (index) => {
  if (!stopSetActive.value) {
    current.value = index;
    // 如果为0，意味着尚未初始化
    if (leftHeight.value.menuHeight == 0 || leftHeight.value.menuItemHeight == 0) {
      await getElRect("menu-scroll-view", "menuHeight");
      await getElRect("category-list-tab-item", "menuItemHeight");
    }
    // 将菜单活动item垂直居中
    scrollTop.value = index * leftHeight.value.menuItemHeight + leftHeight.value.menuItemHeight / 2 - leftHeight.value.menuHeight / 2;
  }
};

// 点击左边的栏目切换
const switchMenu = async (item, index) => {
  stopSetActive.value = true;
  if (index == current.value) return;
  // uni.vibrateShort({ type: 'medium' })
  // scrollRightTop.value = oldScrollTop.value;
  current.value = index;
  rightData.value = item;
  emits("change", item);
  nextTick(() => {
    leftMenuStatus(index);
    // setTimeout(() => {
    //   stopSetActive.value = false
    //   leftMenuStatus(index);
    // }, 300);
  });
};

//点击具体item
const clickItem = (item) => {
  emits("clickItem", item);
};

watchEffect(() => {
  rightData.value = JSON.parse(JSON.stringify(props.rightData));
});

onMounted(() => {
  // getMenuItemTop()
  nextTick(() => {
    switchMenu(props.list[0], 0);
  });
  getElRect("menu-scroll-view", "menuHeight");
  getElRect("category-list-tab-item", "menuItemHeight");
});
</script>
  
  <style lang="scss" scoped>
.category-list {
  /* #ifdef H5 */
  /* #endif */
  display: flex;
  flex-direction: column;
  // height: 100vh;
  height: 100%;
  .category-list-wrap {
    flex: 1;
    display: flex;
    overflow: hidden;
    .category-list-menu {
      width: 228rpx;
      height: 100%;
      background: rgba(246, 247, 248, 1);
      .category-list-tab-item {
        height: 110rpx;
        background: rgba(246, 247, 248, 1);
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28rpx;
        color: #353a45;
        position: relative;

        // &__line{
        //     position: absolute;
        //     border-left: 3px solid #19543b;
        //     height: 55px;
        //     left: 0;
        //     top: 0;
        //     display: none;
        // }
      }
      .category-list-tab-item-active {
        // position: relative;
        font-size: 28rpx;
        color: #ff6701;
        font-weight: 500;
        background: #fff;
        border-left: 6rpx solid #ff6701;
        // .category-list-tab-item__line{
        //     display: block;
        // }
        &::before {
          display: block;
        }
      }
    }
    .category-list-container {
      background-color: rgb(250, 250, 250);
      flex: 1;
      &-item {
        // margin-bottom: 15px;
        background-color: #fff;
        padding: 16rpx;
        border-radius: 8rpx;
        box-sizing: border-box;
        .category-list-container-title {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20rpx 0;
          &__line {
            width: 100rpx;
            height: 2rpx;
            background: rgb(231, 231, 231);
          }
          &__name {
            font-size: 28rpx;
            color: #353a45;
            padding: 0 20rpx;
          }
        }
        &:last-child {
          min-height: 100%;
        }
        &__title {
          font-size: 28rpx;
          color: #353a45;
          font-weight: bold;
        }
        &__content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          padding-bottom: 40rpx;
          .thumb-box {
            flex: 0 0 calc(50% - 12rpx);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            margin-top: 24rpx;
            img {
              width: 100%;
              height: 180rpx;
              border-radius: 8rpx;
              object-fit: cover;
            }
            &-name {
              font-size: 26rpx;
              color: #353a45;
              padding-top: 8rpx;
            }
          }
        }
      }
    }
  }
}

.thumb-box {
  width: 33.333333%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-top: 20rpx;
}

@media (prefers-color-scheme: dark) {
  .category-list {
    .category-list-wrap {
      .category-list-menu {
        background: #2f2f2f;
        .category-list-tab-item {
          background: #2f2f2f;
          color: #fff;
        }
        .category-list-tab-item-active {
          color: #ff6701;
          background: #1d1d1d;
          border-left: 6rpx solid #ff6701;
        }
      }
      .category-list-container {
        background-color: #1e1e20;
        &-item {
          background-color: #1e1e20;
          .category-list-container-title {
            &__line {
              background: rgb(73, 73, 73);
            }
            &__name {
              color: #fff;
            }
          }
          &__title {
            color: #fff;
          }
          &__content {
            .thumb-box {
              &-name {
                color: #fff;
              }
            }
          }
        }
      }
    }
  }
}
</style>