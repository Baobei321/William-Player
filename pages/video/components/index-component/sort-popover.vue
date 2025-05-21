<template>
  <div class="sort-popover">
    <nut-transition :show="showPopover" name="fade" :duration="200">
      <div class="more-arrow"></div>
      <div class="more-popover">
        <div class="more-popover-item" v-for="item in popoverArr" :key="item.title">
          <span class="more-popover-item__title">{{ item.title }}</span>
          <div class="more-popover-item__list">
            <div class="list-item" v-for="sitem in item.list" :key="sitem.value" @click="changeTypeOrWay(sitem,item.title)">
              <div class="list-item-bingo">
                <image src="@/static/ic_player_check.png" v-if="item.title =='排序依据' ? sitem.value == sortWay[props.type].type : sitem.value == sortWay[props.type].way"></image>
              </div>
              <div class="list-item-name">{{ sitem.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </nut-transition>
    <nut-overlay v-model:visible="showPopover" :z-index="2000" :lock-scroll="true" @click="clickOverlay"></nut-overlay>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeMount } from "vue";
import { dayjs } from "@/uni_modules/iRainna-dayjs/js_sdk/dayjs.min.js";
import { chineseToPinYin } from "@/utils/pinyin.js";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  type: { type: String, default: "tv" },
});
const emits = defineEmits(["update:modelValue", "changeSort"]);
const showPopover = ref(false);
const sortWay = ref({});
const popoverArr = [
  {
    title: "排序依据",
    list: [
      { name: "影片名称", value: "1" },
      { name: "更新时间", value: "2" },
      { name: "添加时间", value: "3" },
      { name: "上映时间", value: "4" },
    ],
  },
  {
    title: "排序方式",
    list: [
      { name: "升序", value: "1" },
      { name: "降序", value: "2" },
    ],
  },
];

const clickOverlay = () => {
  showPopover.value = false;
  emits("update:modelValue", false);
};

const handleSort = (type, way) => {
  let localMovieTvData = uni.getStorageSync("localMovieTvData");
  if (type == "1") {
    if (way == "1") {
      localMovieTvData[props.type] = localMovieTvData[props.type].sort((a, b) => {
        const nameA = chineseToPinYin(a.name).toLowerCase().slice(0, 1);
        const nameB = chineseToPinYin(b.name).toLowerCase().slice(0, 1);
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });
    } else {
      localMovieTvData[props.type] = localMovieTvData[props.type].sort((a, b) => {
        const nameA = chineseToPinYin(a.name).toLowerCase().slice(0, 1);
        const nameB = chineseToPinYin(b.name).toLowerCase().slice(0, 1);
        if (nameA < nameB) return 1;
        if (nameA > nameB) return -1;
        return 0;
      });
    }
  } else if (type == "2") {
    if (way == "1") {
      localMovieTvData[props.type] = localMovieTvData[props.type].sort((a, b) => {
        if (dayjs(a.updateTime).isBefore(dayjs(b.updateTime))) {
          return -1;
        } else {
          return 1;
        }
      });
    } else {
      localMovieTvData[props.type] = localMovieTvData[props.type].sort((a, b) => {
        if (dayjs(a.updateTime).isBefore(dayjs(b.updateTime))) {
          return 1;
        } else {
          return -1;
        }
      });
    }
  } else if (type == "3") {
    if (way == "1") {
      localMovieTvData[props.type] = localMovieTvData[props.type].sort((a, b) => {
        if (dayjs(a.createTime).isBefore(dayjs(b.createTime))) {
          return -1;
        } else {
          return 1;
        }
      });
    } else {
      localMovieTvData[props.type] = localMovieTvData[props.type].sort((a, b) => {
        if (dayjs(a.createTime).isBefore(dayjs(b.createTime))) {
          return 1;
        } else {
          return -1;
        }
      });
    }
  } else if (type == "4") {
    if (way == "1") {
      localMovieTvData[props.type] = localMovieTvData[props.type].sort((a, b) => {
        if (dayjs(a.releaseTime).isBefore(dayjs(b.releaseTime))) {
          return -1;
        } else {
          return 1;
        }
      });
    } else {
      localMovieTvData[props.type] = localMovieTvData[props.type].sort((a, b) => {
        if (dayjs(a.releaseTime).isBefore(dayjs(b.releaseTime))) {
          return 1;
        } else {
          return -1;
        }
      });
    }
  }
  uni.setStorageSync("localMovieTvData", localMovieTvData);
};

const changeTypeOrWay = (item, title) => {
  if (title == "排序依据") {
    sortWay.value[props.type].type = item.value;
    handleSort(item.value, sortWay.value[props.type].way);
  } else if (title == "排序方式") {
    sortWay.value[props.type].way = item.value;
    handleSort(sortWay.value[props.type].type, item.value);
  }

  showPopover.value = false;
  emits("update:modelValue", false);
  emits("changeSort");
  uni.setStorageSync("sortWay", sortWay.value);
};

watch(
  () => props.modelValue,
  (val) => {
    showPopover.value = val;
  }
);

onBeforeMount(() => {
  sortWay.value = uni.getStorageSync("sortWay") || { tv: { type: "1", way: "1" }, movie: { type: "1", way: "1" } };
});
</script>

<style lang="scss" scoped>
.sort-popover {
  ::v-deep .nut-transition {
    position: absolute;
    top: 50rpx;
    right: 25%;
    z-index: 3000;
    .more-arrow {
      width: 0;
      height: 0;
      position: absolute;
      right: 14rpx;
      transform: translateY(-100%);
      border-left: 12rpx solid transparent;
      border-right: 12rpx solid transparent;
      border-bottom: 16rpx solid #4d4d4d;
    }
    .more-popover {
      width: 230rpx;
      background: #4d4d4d;
      border-radius: 16rpx;
      box-sizing: border-box;
      padding: 16rpx 24rpx;
      .more-popover-item {
        display: flex;
        flex-direction: column;
        justify-content: center;
        image {
          width: 40rpx;
          height: 40rpx;
        }
        .more-popover-item__title {
          flex: 1;
          padding-left: 15rpx;
          color: #bfbfbf;
          font-size: 24rpx;
          margin-bottom: 20rpx;
        }
        .more-popover-item__list {
          .list-item {
            display: flex;
            align-items: center;
            margin-bottom: 20rpx;
            .list-item-bingo {
              width: 34rpx;
              height: 34rpx;
              image {
                width: 34rpx;
                height: 34rpx;
              }
            }
            .list-item-name {
              color: #fff;
              margin-left: 14rpx;
            }
          }
        }
      }
    }
  }
  ::v-deep .nut-overlay {
    position: fixed;
    top: 0px;
    left: 0px;
    top: 0;
    left: 0;
    background: transparent;
  }
}
</style>
