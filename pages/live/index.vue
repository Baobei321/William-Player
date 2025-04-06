<template>
  <div class="live">
    <wil-category-list type="category" :list="listData" :list-props="listProps" v-if="listData.length">
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
    <nut-popup v-model:visible="showLine" position="bottom" safe-area-inset-bottom>
      <nut-picker v-model="popupValue" :columns="lineColumns" title="选择线路" @confirm="confirmPicker" @cancel="showLine = false">
      </nut-picker>
    </nut-popup>
  </div>
</template>

<script setup>
import { onBeforeMount, ref } from "vue";
import { parseM3UToArray, groupByGroupTitle } from "./common.js";
import wilCategoryList from "@/components/wil-category-list/index.vue";

const listProps = ref({
  children: "childList",
});

const listData = ref([]);
const staticData = ref([]);

const showLine = ref(false);
const popupValue = ref([]);
const lineColumns = ref([]);

const selectItem = ref({});

//获取iptv
const getIptv = () => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: "https://gist.githubusercontent.com/GhostenEditor/fd637c07531a8610e24c2649c893082b/raw/76464b464f1c2d7f16a716697f2a3b7bf82f9603/iptv.m3u",
      timeout: 5000,
      method: "GET",
      //   header: {
      //     Authorization: webdavInfo.token,
      //     "Content-Type": "application/json",
      //   },
      success: (res) => {
        resolve(parseM3UToArray(res.data));
      },
      fail: (error) => {
        reject(error);
      },
    });
  });
};

const clickItem = (item, row) => {
  popupValue.value = []
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
    url: `/pages/video/video-player?noSetHistory=0&videoUrl=${selectedValue[0]}&liveTitle=${selectItem.value.name}`,
  });
  showLine.value = false;
};

onBeforeMount(async () => {
  let res = await getIptv();
  listData.value = groupByGroupTitle(res);
  staticData.value = groupByGroupTitle(res, "3");
  console.log(staticData.value, "res");
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
</style>
