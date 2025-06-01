<template>
  <div class="live">
    <nut-cell-group>
      <nut-swipe v-for="(item,index) in liveList" :key="item.name" :disabled="item.name=='默认直播源' ? true : false">
        <nut-cell :title="item.name" is-link @click="toLiveList(item)"></nut-cell>
        <template #right>
          <nut-button style="height: 100%" type="danger" shape="square" @click="deleteLive(index)">删除</nut-button>
        </template>
      </nut-swipe>
    </nut-cell-group>
    <wil-modal ref="wil_modal">
      <wil-form v-model="state.formData" :options="options" ref="base_form">
      </wil-form>
    </wil-modal>
    <div class="live-add" @click="openForm">
      <image src="@/static/jia-hao.png"></image>
    </div>
    <share-dialog v-model:visible="showShareModal" :shareUrl="shareUrl"></share-dialog>
  </div>
</template>

<script setup>
import { onBeforeMount, ref, reactive } from "vue";
import wilForm from "@/components/wil-form/index.vue";
import wilModal from "@/components/wil-modal/index.vue";
import shareDialog from "../video/components/index-component/share-dialog.vue";
import { parseM3UToArray, groupByGroupTitle } from "./common.js";
import { getCutContent } from "@/utils/common";
import { onShow } from "@dcloudio/uni-app";

const liveList = ref([]);
const wil_modal = ref(null);
const base_form = ref(null);
const showShareModal = ref(false);
const shareUrl = ref("");

const state = reactive({
  formData: {},
});

//m3u校验
const validatorUrl = (val) => {
  if (!val) {
    return false;
  } else {
    const reg = /^https?:\/\/([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i;
    if (!reg.test(val)) {
      return false;
    } else {
      return true;
    }
  }
};

const options = [
  { label: "直播源名称", prop: "name", type: "input", formItemProps: { placeholder: "请输入", type: "text" }, rule: [{ required: true, message: "请输入直播源名称" }] },
  { label: "直播源地址", prop: "url", type: "input", formItemProps: { placeholder: "请输入", type: "text" }, rule: [{ validator: validatorUrl, message: "请输入正确的直播源地址" }] },
];

//获取iptv
const getIptv = (url) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: url,
      method: "GET",
      success: (res) => {
        resolve(parseM3UToArray(res.data));
      },
      fail: (error) => {
        reject(error);
      },
    });
  });
};

const openForm = () => {
  wil_modal.value.showModal({
    title: "添加",
    confirmColor: "#ff6701",
    confirm: async () => {
      if (!state.formData.name || !state.formData.url) {
        uni.showToast({
          title: "请输入完整的直播源",
          icon: "none",
        });
        return;
      }
      if (liveList.value.some((v) => v.name == state.formData.name)) {
        uni.showToast({
          title: "存在同名直播源",
          icon: "none",
        });
        return;
      }
      if (liveList.value.some((v) => v.url == state.formData.url)) {
        uni.showToast({
          title: "存在相同url直播源",
          icon: "none",
        });
        return;
      }
      let res = await getIptv(state.formData.url);
      if (!res[0].groupTitle) {
        uni.showToast({
          title: "请检查文件的格式是否正确",
          icon: "error",
        });
      } else {
        liveList.value.push(state.formData);
        uni.setStorageSync("liveList", liveList.value);
      }
      state.formData = {};
    },
    cancel: () => {
      state.formData = {};
    },
  });
};

const deleteLive = (index) => {
  liveList.value.splice(index, 1);
  uni.setStorageSync("liveList", liveList.value);
};

const toLiveList = (item) => {
  uni.navigateTo({
    url: "/pages/live/list?name=" + item.name,
  });
};

onBeforeMount(() => {
  liveList.value = uni.getStorageSync("liveList");
  if (!liveList.value) {
    liveList.value = [{ name: "默认直播源", url: "https://storage.7x24cc.com/storage-server/presigned/ss1/a6-online-fileupload/newMediaImage/1674C67_427A_iptv_20250411082147720newMediaImage.m3u" }];
    uni.setStorageSync("liveList", liveList.value);
  }
});

onShow(async () => {
  let shareUrl1 = await getCutContent();
  if (shareUrl1) {
    shareUrl.value = shareUrl1;
    showShareModal.value = true;
  }
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
  box-sizing: border-box;
  border-top: 2rpx solid #f6f7f8;
  ::v-deep .nut-cell-group {
    .nut-cell-group__wrap {
      background-color: transparent;
      box-shadow: none;
      .nut-swipe {
        .nut-swipe__content {
          .nut-cell {
            margin: 0;
            background-color: #fff;
            box-shadow: none;
            border-radius: 0;
            .nut-cell__title {
              color: #000;
            }
            .nut-icon {
              color: #000;
            }
            &::after {
              border-bottom: 2rpx solid #eaeaea;
            }
          }
        }
      }
    }
  }
  ::v-deep .nut-transition {
    .wil-modal {
      .wil-modal-top {
        padding-bottom: 0;
        .base-form {
          .base-form-content {
            .nut-form {
              .nut-cell-group {
                .nut-cell-group__wrap {
                  .nut-form-item {
                    .nut-form-item__label {
                      min-width: 170rpx;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  .live-add {
    width: 120rpx;
    height: 120rpx;
    background: #ff6701;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    bottom: 180rpx;
    right: 24rpx;
    box-shadow: 0 8rpx 12rpx #5b73a01a;
    image {
      width: 50rpx;
      height: 50rpx;
    }
  }
}
@media (prefers-color-scheme: dark) {
  .live {
    background: #1e1e20;
    border-top: 2rpx solid #1e1e20;
    ::v-deep .nut-cell-group {
      .nut-cell-group__wrap {
        .nut-swipe {
          .nut-swipe__content {
            .nut-cell {
              background-color: #2f2f2f;
              .nut-cell__title {
                color: #fff;
              }
              .nut-icon {
                color: #fff;
              }
              &::after {
                border-bottom: 2rpx solid rgb(73, 73, 73);
              }
            }
          }
        }
      }
    }
    .live-add {
      width: 120rpx;
      height: 120rpx;
      background: #ff6701;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: fixed;
      bottom: 180rpx;
      right: 24rpx;
      box-shadow: 0 8rpx 12rpx #5b73a01a;
      image {
        width: 50rpx;
        height: 50rpx;
      }
    }
  }
}
</style>
