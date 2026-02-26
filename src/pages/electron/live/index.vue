<template>
  <div class="live">
    <div class="live-left">
      <div class="live-left-video">
        <video :src="videoUrl"></video>
      </div>
      <div class="live-left-title">
        <div class="live-left-title__left">直播</div>
        <nut-icon name="uploader" class="live-left-title__right"></nut-icon>
      </div>
      <div class="live-left-list">
        <div class="live-left-list__item" v-for="item in liveList" :key="item.name" @click="getListData(item.url)">
          <span>{{ item.name }}</span>
          <nut-icon name="rect-right"></nut-icon>
        </div>
      </div>
    </div>
    <div class="live-right">
      <wil-category-list type="category" :list="listData" :list-props="{ children: 'childListArr' }" v-if="listData.length && !loading">
        <template #custom="scope">
          <div class="right-list">
            <el-popover
              trigger="click"
              placement="right-start"
              v-for="item in (scope.row as unknown as MenuItem)?.childListArr || []"
              :key="item.name"
              @before-enter="clickItem(item, (scope.row as unknown as MenuItem)?.childListArr || [])"
            >
              <template #reference>
                <div class="right-list-item">
                  <div class="right-list-item__img">
                    <image :src="item.logo" />
                  </div>
                  <span>{{ item.name }}</span>
                </div>
              </template>
              <div class="popoverline-list">
                <div class="popoverline-list-item" v-for="vitem in lineColumns" :key="vitem.value" @click="selectLine(vitem)">{{ vitem.text }}</div>
              </div>
            </el-popover>
          </div>
        </template>
      </wil-category-list>
      <wil-empty text="加载中..." v-if="loading"></wil-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { parseM3UToArray, groupByGroupTitle, groupByName } from '@/utils/tools.js'
import { ipc } from '@/utils/ipcRenderer'
import { ipcApiRoute } from '@/utils/ipcApiRoute'
import wilCategoryList from '@/components/mobile/wil-category-list/index.vue'
import wilPopover from '@/components/electron/wil-popover/other.vue'
import wilEmpty from '@/components/mobile/wil-empty/index.vue'
import type { LiveItem, MenuItem, MenuChild } from './types'
import { ElPopover } from 'element-plus'

const liveList = ref<LiveItem[]>([])
const listData = ref<MenuItem[]>([])
const loading = ref(false)
const popupValue = ref<string[]>([])
const lineColumns = ref<{ value: string; text: string }[]>([])
const selectItem = ref<MenuChild | null>(null)
const videoUrl = ref('http://112.46.85.60:8009/hls/501/index.m3u8')
//获取iptv
const getIptv = (url: string) => {
  return new Promise((resolve, reject) => {
    loading.value = true
    ipc
      .invoke(ipcApiRoute.httpRequest, {
        url: url,
        method: 'GET',
        options: {
          timeout: 3000,
        },
      })
      .then((res: { code: number; data: string | object | ArrayBuffer }) => {
        loading.value = false
        if (res.code === 200) {
          resolve(parseM3UToArray(res.data))
        } else {
          reject(res)
        }
      })
      .catch((error: any) => {
        loading.value = false
        reject(error)
      })
  })
}

//点击展示线路
const clickItem = (item: MenuChild, row: MenuChild[]) => {
  popupValue.value = []
  row.forEach(v => {
    v.active = false
  })
  item.active = true
  listData.value.forEach(v => {
    let obj: MenuChild | undefined = v.childListArr.find(i => i.name === item.name)
    if (obj) {
      lineColumns.value = obj.childList.map((h, hindex) => {
        return { value: h.url, text: `线路${hindex + 1}` }
      })
    }
  })
  selectItem.value = item
}
const getListData = async (url: string) => {
  let res = await getIptv(url)
  listData.value = groupByGroupTitle(res, '3')
  listData.value.forEach(item => {
    item.childListArr = item.childList || []
    delete item.childList
  })
}

//选择线路
const selectLine = (item: { value: string; text: string }) => {
  videoUrl.value = item.value
  console.log(videoUrl.value, 'viudeo')
}

onBeforeMount(() => {
  liveList.value = uni.getStorageSync('liveList')
  if (!liveList.value) {
    liveList.value = [
      {
        name: '默认直播源',
        url: 'https://storage.7x24cc.com/storage-server/presigned/ss1/a6-online-fileupload/newMediaImage/1674C67_427A_iptv_20250411082147720newMediaImage.m3u',
      },
    ]
    uni.setStorageSync('liveList', liveList.value)
  }
})
</script>

<style lang="scss" scoped>
.live {
  width: 100%;
  height: 100%;
  display: flex;
  .live-left {
    flex: 0 0 55%;
    .live-left-video {
      width: 100%;
      video {
        width: 100%;
        aspect-ratio: 5/3;
        height: auto;
        display: block;
      }
    }
    .live-left-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 16rpx 24rpx;
      .live-left-title__left {
        font-size: 50rpx;
      }
      .live-left-title__right {
        font-size: 40rpx;
        cursor: pointer;
      }
    }
    .live-left-list {
      width: 100%;
      margin-top: 24rpx;
      .live-left-list__item {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        padding: 16rpx 24rpx;
        &:hover {
          background: rgb(240, 240, 240);
        }
      }
    }
  }
  .live-right {
    :deep(.category-list) {
      .category-list-wrap {
        .category-list-container {
          .uni-scroll-view {
            .category-list-container-item {
              .right-list {
                display: flex;
                justify-content: space-between;
                flex-direction: row;
                flex-wrap: wrap;

                .right-list-item {
                  flex: 0 0 calc((100% - 48rpx) / 3);
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  overflow: hidden;
                  border-radius: 16rpx;
                  padding: 16rpx;
                  margin-top: 24rpx;
                  cursor: pointer;
                  background-color: #f7f6fa;
                  &:hover {
                    background-color: #eeeeee;
                  }
                  .right-list-item__img {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24rpx 0;
                    width: 100%;
                    image {
                      display: block;
                      width: 50%;
                      height: auto;
                      div {
                        display: block;
                        height: auto;
                        aspect-ratio: 5/3;
                      }
                      img {
                        display: block;
                        width: 100%;
                        height: auto;
                        aspect-ratio: 5/3;
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
  }
}
</style>

<style lang="scss">
.el-popover {
  .popoverline-list {
    .popoverline-list-item {
      padding: 16rpx 24rpx;
      cursor: pointer;
      border-radius: 8rpx;
      &:hover {
        background-color: #eeeeee;
      }
    }
  }
}
</style>
