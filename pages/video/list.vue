<template>
  <div class="video">
    <div class="video-refresh" @click="refreshModule">
      <span>{{ isRefresh?'正在同步：':'最近更新：' }}</span>
      <span :class="['video-refresh-time',isRefresh?'hide-span':'show-span']" :style="{width:refreshWidth>=0?refreshWidth+'px':'auto'}">{{ date }}</span>
      <span class="video-refresh-timefixed">{{ date }}</span>
      <nut-icon name="refresh2" size="14" :class="[isRefresh ? 'icon-refresh' : '']"></nut-icon>
    </div>
    <div class="video-module">
      <div class="video-module-item" v-for="item in moduleList" :key="item.name">
        <div class="video-module-item__value">{{ item.value }}</div>
        <div class="video-module-item__name">{{ item.name }}</div>
      </div>
    </div>
    <div class="video-list1">
      <div class="video-list1-title">WebDAV-我的WebDAV</div>
      <div class="video-list1-container" v-if="listData.length">
        <base-cell :options="listData" @click-item="clickCell" :defaultProps="{title:'name',leftIcon:'leftIcon'}"></base-cell>
      </div>
      <div class="video-list1-tip" v-else>暂无WebDAV，请查看Alist是否开启</div>
    </div>
    <div class="video-addbutton" @click="openPopup">
      <image :src="rocketIcon" />
      <span>添加媒体</span>
    </div>
    <nut-popup v-model:visible="showPopup" position="bottom" round class="video-popup" @closed="closedPopup" :destroy-on-close="true">
      <div class="video-popup-title">
        <span>添加媒体</span>
        <nut-icon name="close" size="14" @click="closedPopup"></nut-icon>
      </div>
      <div class="video-popup-container">
        <div class="video-popup-container__webdav" v-if="webdavInfo.name" @click="toEditWebdav">
          <div class="webdav-left">
            <image :src="Alist" /><span>{{ webdavInfo.name }}</span>
          </div>
          <nut-icon name="edit" size="14" class="webdav-right"></nut-icon>
        </div>
        <div class="video-popup-container__add" @click="toAddWebdav">
          <div class="add-left">
            <image :src="Webdav" /><span>从WebDAV导入</span>
          </div>
          <nut-icon name="rect-right" size="14" class="add-right"></nut-icon>
        </div>
      </div>
    </nut-popup>
    <!-- <music-player></music-player> -->
  </div>
</template>
  
  <script setup>
import { onBeforeMount, onMounted, ref, nextTick } from "vue";
import rocketIcon from '../../static/rocket-icon.png'
import Alist from '../../static/alist.png'
import Webdav from '../../static/webdav.png'
import baseCell from '../../components/wil-cell/index.vue'
import Folder from '../../static/folder.png'
import { dayjs } from '@/uni_modules/iRainna-dayjs/js_sdk/dayjs.min.js'
import wilNavbar from '../../components/wil-navbar/index.vue'
import { getFolder } from './components/common.js'
import { onShow } from '@dcloudio/uni-app';

const date = ref('暂未更新')
const showPopup = ref(false)

const moduleList = ref([
  { name: '电影', value: 0 },
  { name: '电视剧', value: 0 },
  { name: '其他', value: 0 },
])

const listData = ref([])
const webdavInfo = ref({})
const isRefresh = ref(false)
const refreshWidth = ref(0)

const toEditWebdav = () => {
  uni.navigateTo({
    url: '/pages/video/add-webdav?title=修改WebDAV'
  })
  showPopup.value = false
}

const toAddWebdav = () => {
  uni.navigateTo({
    url: '/pages/video/add-webdav?title=添加WebDAV'
  })
  // uni.navigateTo({
  //   url: '/media/video-player'
  // })
  showPopup.value = false
}

const loginUser = () => {
  webdavInfo.value = uni.getStorageSync('webdavInfo')
  return new Promise(resolve => {
    uni.request({
      url: 'http://' + webdavInfo.value.address + ':' + webdavInfo.value.port + '/api/auth/login',
      data: JSON.stringify({ username: webdavInfo.value.username, password: webdavInfo.value.password }),
      timeout: 3000,
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        uni.setStorageSync('webdavInfo', { ...webdavInfo.value, token: res.data.data.token })
        resolve(res.data)
      }
    })
  });
}

const clickCell = (item) => {
  uni.navigateTo({
    url: '/pages/video/catelog-list?path=' + item.name
  })
}

const openPopup = () => {
  showPopup.value = true
}

const closedPopup = () => {
  showPopup.value = false
}

const refreshModule = async () => {
  if (!webdavInfo.value.name) {
    uni.showToast({
      title: '请先添加WebDAV',
      icon: 'none'
    })
    return
  }
  if (!listData.value.length) {
    uni.showToast({
      title: '请先开启Alist',
      icon: 'none'
    })
    return
  }
  if (isRefresh.value) return
  isRefresh.value = true
  let num1 = 0
  let num2 = 0
  let num3 = 0
  setTimeout(() => {
    refreshWidth.value = 0
  }, 1000);
  await Promise.all(listData.value.map(async (item) => {
    let res = await getFolder({ path: '/' + item.name })
    let movie = res.data.content.find(i => i.name == '电影')
    let tv = res.data.content.find(i => i.name == '电视剧')
    let other = res.data.content.find(i => i.name == '其他')
    if (movie) {
      let resmovie = await getFolder({ path: '/' + item.name + '/电影' })
      num1 += resmovie.data.total
    }
    if (tv) {
      let restv = await getFolder({ path: '/' + item.name + '/电视剧' })
      num2 += restv.data.total
    }
    if (other) {
      let resother = await getFolder({ path: '/' + item.name + '/其他' })
      num3 += resother.data.total
    }
  })).then(() => {
    setTimeout(async () => {
      moduleList.value.find(i => i.name == '电影').value = num1
      moduleList.value.find(i => i.name == '电视剧').value = num2
      moduleList.value.find(i => i.name == '其他').value = num3
      webdavInfo.value.moduleData = { movie: num1, tv: num2, other: num3 }
      webdavInfo.value.refreshDate = dayjs().format('MM-DD HH:mm')
      date.value = '今天 ' + webdavInfo.value.refreshDate.split(' ')[1]
      uni.setStorageSync('webdavInfo', webdavInfo.value)
      isRefresh.value = false
      await setTimeWidth()
    }, 2000);
  })
}


const setTimeWidth = () => {
  return new Promise((resolve) => {
    const query = uni.createSelectorQuery();
    query.select('.video-refresh-timefixed').fields({
      size: true
    }, res => {
      if (!res) {
        return;
      }
      refreshWidth.value = res.width
      resolve()
    }).exec();
  })
}

onShow(async () => {
  webdavInfo.value = uni.getStorageSync('webdavInfo')
  if (webdavInfo.value.name) {
    await loginUser()
    let res = await getFolder()
    listData.value = res.data.content.map(item => {
      if (item.type == '1') {
        item.leftIcon = Folder
      }
      delete item.size
      return item
    })
    moduleList.value.find(i => i.name == '电影').value = webdavInfo.value.moduleData?.movie || 0
    moduleList.value.find(i => i.name == '电视剧').value = webdavInfo.value.moduleData?.tv || 0
    moduleList.value.find(i => i.name == '其他').value = webdavInfo.value.moduleData?.other || 0
    if (webdavInfo.value.refreshDate) {
      if (webdavInfo.value.refreshDate?.split(' ')[0] == dayjs().format('MM-DD')) {
        date.value = '今天 ' + webdavInfo.value.refreshDate.split(' ')[1]
      } else {
        date.value = webdavInfo.value.refreshDate
      }
    }
    nextTick(() => {
      setTimeWidth()
    })
  }
})

  </script>
  
  <style lang="scss" scoped>
@keyframes rotate1 {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes widthchange1 {
  0% {
    width: 0;
  }
  100% {
  }
}
@keyframes widthchange2 {
  0% {
  }
  100% {
    width: 0;
  }
}
page {
  width: 100%;
  height: 100%;
}
.video {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f6f7f8;
  box-sizing: border-box;
  &-refresh {
    display: inline-flex;
    align-items: center;
    font-size: 28rpx;
    background: rgba(255, 103, 1, 0.1);
    color: #ff6701;
    border-radius: 16rpx;
    padding: 16rpx;
    margin-top: 24rpx;
    &-time {
      overflow: hidden;
      white-space: nowrap;
    }
    &-timefixed {
      position: fixed;
      color: transparent;
    }
    .nut-icon {
      margin-left: 16rpx;
    }
    .show-span {
      animation: widthchange1 1s ease;
    }
    .hide-span {
      animation: widthchange2 1s ease;
    }
    .icon-refresh {
      animation-duration: 0.5s;
      animation-name: rotate1;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }
  }
  &-module {
    margin-top: 24rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0 24rpx;
    box-sizing: border-box;
    &-item {
      flex: 1;
      background: #fff;
      border-radius: 12rpx;
      margin-left: 24rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24rpx 0;
      &:first-child {
        margin-left: 0;
      }
      &__value {
        font-weight: bold;
        padding-bottom: 8rpx;
        font-size: 32rpx;
      }
      &__name {
        font-size: 26rpx;
        color: #797979;
      }
    }
  }
  &-list1 {
    width: 100%;
    margin-top: 24rpx;
    padding: 0 24rpx;
    box-sizing: border-box;
    &-title {
      color: #797979;
      font-size: 28rpx;
    }
    &-container {
      ::v-deep .base-cell {
        .nut-cell-group__wrap {
          .nut-cell {
            .right-icon {
              display: none;
            }
          }
        }
      }
    }
    &-tip {
      margin-top: 24rpx;
      text-align: center;
      font-size: 28rpx;
    }
  }
  &-addbutton {
    position: fixed;
    width: 136rpx;
    height: 136rpx;
    background: #ff6701;
    right: 24rpx;
    bottom: 148rpx;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    image {
      width: 64rpx;
      height: 64rpx;
    }
    span {
      font-size: 24rpx;
      color: #ffffff;
    }
  }
  ::v-deep .nut-popup {
    background: #f3f2f7;
    .video-popup-title {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24rpx 0;
      span {
        font-size: 32rpx;
      }
      .nut-icon {
        position: absolute;
        right: 30rpx;
      }
    }
    .video-popup-container {
      padding: 0 24rpx;
      &__webdav {
        background: #fff;
        border-radius: 16rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20rpx 24rpx;
        &:active {
          background: rgba(0, 0, 0, 0.2);
        }
        .webdav-left {
          display: flex;
          align-items: center;
          image {
            width: 80rpx;
            height: 70rpx;
            border-radius: 50%;
          }
          span {
            padding-left: 20rpx;
            font-size: 28rpx;
            color: #000;
          }
        }
      }
      &__add {
        background: #fff;
        border-radius: 16rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20rpx 24rpx;
        margin-top: 20rpx;
        margin-bottom: 20rpx;
        &:active {
          background: rgba(0, 0, 0, 0.2);
        }
        .add-left {
          display: flex;
          align-items: center;
          image {
            width: 70rpx;
            height: 70rpx;
            border-radius: 50%;
          }
          span {
            padding-left: 30rpx;
            font-size: 28rpx;
            color: #000;
          }
        }
      }
    }
  }
}
</style>
  