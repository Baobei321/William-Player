<template>
  <div class="live">
    <wil-category-list type="category" :list="listData" :list-props="listProps" v-if="listData.length&&!loading">
      <template #custom="scope">
        <div class="right-list">
          <div class="right-list-item" :style="{backgroundColor:item.active?'#dce1ff':'#f7f6fa'}" v-for="item in scope.row.childList" :key="item.name"
            @click="clickItem(item,scope.row.childList)">
            <image :src="item.logo"></image>
            <span>{{ item.name }}</span>
          </div>
        </div>
      </template>
    </wil-category-list>
    <wil-empty text="加载中..." v-if="loading"></wil-empty>
    <nut-popup v-model:visible="showLine" position="bottom" round safe-area-inset-bottom>
      <nut-picker v-model="popupValue" :columns="lineColumns" title="选择线路" @confirm="confirmPicker" @cancel="showLine = false">
      </nut-picker>
    </nut-popup>
  </div>
</template>

<script setup>
import { onBeforeMount, ref } from "vue";
import { parseM3UToArray, groupByGroupTitle } from "./common.js";
import wilCategoryList from "@/components/wil-category-list/index.vue";
import wilEmpty from "@/components/wil-empty/index.vue";
import { onLoad } from "@dcloudio/uni-app";

const listProps = ref({
  children: "childList",
});
const loading = ref(false);
const listData = ref([]);
const staticData = ref([]);

const showLine = ref(false);
const popupValue = ref([]);
const lineColumns = ref([]);

const selectItem = ref({});

//获取iptv
const getIptv = (url) => {
  return new Promise((resolve, reject) => {
    loading.value = true;
    uni.request({
      url: url,
      method: "GET",
      success: (res) => {
        loading.value = false;
        resolve(parseM3UToArray(res.data));
      },
      fail: (error) => {
        loading.value = false;
        reject(error);
      },
    });
  });
};

const clickItem = (item, row) => {
  popupValue.value = [];
  row.forEach((v) => {
    v.active = false;
  });
  item.active = true;
  staticData.value.forEach((v) => {
    let obj = v.childList.find((i) => i.name == item.name);
    if (obj) {
      lineColumns.value = obj.childList.map((h, hindex) => {
        return { value: h.url, text: `线路${hindex + 1}` };
      });
      showLine.value = true;
    }
  });
  selectItem.value = item;
};

const confirmPicker = ({ selectedValue, selectedOptions }) => {
  uni.navigateTo({
    url: `/pages/mobile/video/video-player?noSetHistory=0&videoUrl=${encodeURIComponent(selectedValue[0])}&liveTitle=${selectItem.value.name}`,
  });
  showLine.value = false;
};

onLoad(async (options) => {
  let liveList = uni.getStorageSync("liveList");
  let nowLive = liveList.find((item) => item.name == options.name);
  let res = await getIptv(nowLive.url);
  listData.value = groupByGroupTitle(res);
  staticData.value = groupByGroupTitle(res, "3");
});
</script>

<style lang="scss" scoped>
page {
  width: 100%;
  height: 100%;
}
.live {
  width: 100%;
  height: 100%;
  background: #f6f7f8;
  ::v-deep .category-list {
    .category-list-wrap {
      .category-list-container {
        background-color: #f7f6fa;
        .category-list-container-item {
          background-color: #f7f6fa;
          .right-list {
            .right-list-item {
              display: flex;
              align-items: center;
              height: 110rpx;
              image {
                width: 100rpx;
                height: 50rpx;
              }
              span {
                font-size: 32rpx;
                padding-left: 10rpx;
              }
            }
          }
        }
      }
    }
  }
}
@media (prefers-color-scheme: dark) {
  .live {
    background: #1e1e20;
  }
}
</style>
