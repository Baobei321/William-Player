<template>
  <div class="category-list">
    <div class="category-list-wrap">
      <scroll-view :scroll-y="true" :scroll-with-animation="true" class="category-list-menu menu-scroll-view" :scroll-top="scrollTop" :scroll-into-view="itemId"
        :enhanced="true" :showScrollbar="false">
        <div v-for="(item, index) in list" :key="index" class="category-list-tab-item" :class="[current == index ? 'category-list-tab-item-active' : '']"
          @click.stop="swichMenu(index)">
          <!-- <span class="category-list-tab-item__line"></span> -->
          <span class="category-list-tab-item__name">{{ item[props.listProps.name] }}</span>
        </div>
      </scroll-view>
      <scroll-view :scrollTop="scrollRightTop" :scroll-y="scrollRightY" :scroll-with-animation="true" class="category-list-container" @scroll="rightScroll"
        :enhanced="true" :showScrollbar="false">
        <div class="category-list-container-item" :id="'right' + index" v-for="(item, index) in list" :key="item.name">
          <!-- 三级分类的情况 -->
          <template v-if="item[props.listProps.children]?.length">
            <div class="category-list-container-title">
              <span class="category-list-container-title__line"></span>
              <span class="category-list-container-title__name">{{ item[props.listProps.name] }}</span>
              <span class="category-list-container-title__line"></span>
            </div>
            <template v-for="second in item[props.listProps.children]" :key="second[props.listProps.name]">
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
              <span>{{ item[props.listProps.name] }}</span>
            </div>
            <slot name="custom" :row="item" v-if="$slots.custom"></slot>
            <div class="category-list-container-item__content" v-else>
              <div class="thumb-box" v-for="second in item[props.listProps.children]" :key="second[props.listProps.name]" @click="clickItem(second)">
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
import { onMounted, ref, nextTick } from "vue";

const props = defineProps({
  list: { type: Array, default: [] },
  listProps: { type: Object, default: {} },
});

const scrollTop = ref(0);
const oldScrollTop = ref(0);
const current = ref(0);
// const menuHeight = ref(0)
// const menuItemHeight = ref(0)
const itemId = ref("");
const arr = ref([]);
const scrollRightTop = ref(0);
const scrollRightY = ref(true);
const timer = ref(null);

const rightScrollInto = ref(0);

const stopSetActive = ref(false);

const leftHeight = ref({
  menuHeight: 0,
  menuItemHeight: 0,
});

const emits = defineEmits(["clickItem"]);

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

const getMenuItemTop = async () => {
  return new Promise((resolve) => {
    let selectorQuery = uni.createSelectorQuery();
    selectorQuery
      .selectAll(".category-list-container-item")
      .boundingClientRect((rects) => {
        if (!rects.length) {
          setTimeout(() => {
            getMenuItemTop();
          }, 10);
          return;
        }
        rects.forEach((rect) => {
          arr.value.push(rect.top);
          resolve();
        });
      })
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
const swichMenu = async (index) => {
  stopSetActive.value = true;
  if (arr.value.length == 0) {
    await getMenuItemTop();
  }
  if (index == current.value) return;
  // uni.vibrateShort({ type: 'medium' })
  scrollRightTop.value = oldScrollTop.value;
  current.value = index;
  nextTick(() => {
    scrollRightTop.value = arr.value[index] - arr.value[0];
    setTimeout(() => {
      stopSetActive.value = false;
      leftMenuStatus(index);
    }, 300);
  });
};

// 右边菜单滚动  如果不存在height2，意味着数据循环已经到了最后一个，设置左边菜单为最后一项即可
const rightScroll = async (e) => {
  oldScrollTop.value = e.detail.scrollTop;
  if (arr.value.length == 0) {
    await getMenuItemTop();
  }
  // clearTimeout(timer.value)
  if (!leftHeight.value.menuHeight) {
    await getElRect("menu-scroll-view", "menuHeight");
  }

  // timer.value = setTimeout(() => { // 防抖
  // let scrollHeight = arr.value[0] + e.detail.scrollTop + 20;
  let scrollHeight = arr.value[0] + e.detail.scrollTop;
  if (scrollHeight < 0) {
    return;
  }
  // console.log(arr.value, 'arr.value',scrollHeight);
  for (let i = 0; i < arr.value.length; i++) {
    let height1 = arr.value[i];
    let height2 = arr.value[i + 1];
    if (!height2 || (scrollHeight >= height1 && scrollHeight < height2)) {
      if (i != current.value) {
        leftMenuStatus(i);
      }
      return;
    }
  }
  // }, 10)
};

const clickItem = (item) => {
  emits("clickItem", item);
};

onMounted(() => {
  getMenuItemTop();
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
            flex: 0 0 calc(50% - 6px);
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
              font-size: 13px;
              color: #353a45;
              padding-top: 8rpx;
            }
          }
        }
      }
    }
  }
}

// .page-view {
//   padding: 8px;
// }

.item-menu-name {
  margin-top: 8rpx;
  font-weight: normal;
  font-size: 24rpx;
  color: #000;
}

.item-container {
  display: flex;
  flex-wrap: wrap;
}

.thumb-box {
  width: 33.333333%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-top: 20rpx;
}

.item-menu-img {
  width: 120rpx;
  height: 120rpx;
}
</style>