<template>
  <div class="sidebar">
    <div class="sidebar-logo">
      <wil-popover trigger="click" placement="right-start" v-model:visible="popoverVisible">
        <template #reference>
          <img
            :src="
              userInfo.avatar ||
              'https://storage.7x24cc.com/storage-server/presigned/ss1/a6-online-fileupload/newMediaImage/2AFA742_427A_user-avatar_20241225150546694newMediaImage.png'
            "
            style="cursor: pointer" />
        </template>
        <user-info-inner @closePopover="popoverVisible = false"></user-info-inner>
      </wil-popover>
    </div>
    <div class="sidebar-list" ref="sidebar_list">
      <div :class="['sidebar-list-item', item.active ? 'sidebar-list-active' : '']" v-for="item in sidebarList" :key="item.name" @click="changeTab(item)">
        <img :src="item.active ? item.activeIcon : item.icon" />
        <span>{{ item.name }}</span>
      </div>
      <div class="sidebar-list-line" :style="setActiveStyle()"></div>
    </div>
  </div>
</template>

<script setup>
import wilPopover from '@/components/electron/wil-popover/other.vue'
import userInfoInner from './user-info.vue'
import homeBlack from '@/static/home-black.png'
// import homeGray from '@/static/home-gray.png'
import homeOrange from '@/static/home-orange.png'
import liveBlack from '@/static/live-black.png'
import liveOrange from '@/static/live-orange.png'
import chilunBlack from '@/static/chilun-black.png'
import chilunOrange from '@/static/chilun-orange.png'
import embyBlack from '@/static/emby-black.png'
import embyOrange from '@/static/emby-orange.png'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as CONFIG from '@/utils/config'
const userInfo = ref(uni.getStorageSync(CONFIG.USER_KEY))
const router = useRouter()
const sidebar_list = ref(null)
const popoverVisible = ref(false)
const activeTab = ref('首页')
const sidebarList = ref([
  { name: '首页', icon: homeBlack, activeIcon: homeOrange, active: true, path: '/home' },
  { name: 'Emby', icon: embyBlack, activeIcon: embyOrange, active: false, path: '/emby' },
  { name: '直播', icon: liveBlack, activeIcon: liveOrange, active: false, path: '/live' },
  { name: '设置', icon: chilunBlack, activeIcon: chilunOrange, active: false, path: '/settings' },
])

// 设置active背景的style
const setActiveStyle = () => {
  const activeItem = sidebarList.value.find(item => item.active)
  const activeIndex = sidebarList.value.findIndex(item => item.active)
  let top = 0
  sidebarList.value.forEach((item, index) => {
    if (index < activeIndex) {
      top += item.height
    }
  })
  return { height: activeItem.height + 'px', top: top + 'px' }
}

const changeTab = item => {
  if (activeTab.value === item.name) return
  sidebarList.value.find(v => v.active).active = false
  item.active = true
  activeTab.value = item.name
  router.replace({
    path: item.path,
  })
}

onMounted(() => {
  sidebarList.value.forEach((item, index) => {
    item.height = sidebar_list.value.childNodes[index + 1].offsetHeight
  })
})
</script>

<style lang="scss" scoped>
.sidebar {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  background: #f6f6f6;
  height: 100%;
  padding: 16rpx;
  border-right: 1px solid #e9e9e9;

  &-logo {
    margin-bottom: 24rpx;
    img {
      width: 80rpx;
      height: 80rpx;
      display: block;
      border-radius: 50%;
    }
  }

  &-list {
    position: relative;
    width: 70px;

    &-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16rpx 24rpx;
      position: relative;
      z-index: 9;
      cursor: pointer;

      img {
        width: 50rpx;
        height: 50rpx;
      }

      span {
        display: block;
        margin-top: 12rpx;
        color: #000;
      }
    }

    &-active {
      span {
        color: #fa851e;
      }
    }

    &-line {
      position: absolute;
      width: 100%;
      z-index: 1;
      background: #e1e1e1;
      border-radius: 8px;
      top: 0;
      left: 0;
      transition: top 0.3s ease;
    }
  }
}
</style>
