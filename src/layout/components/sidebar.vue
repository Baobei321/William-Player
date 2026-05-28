<template>
  <div class="sidebar">
    <div class="sidebar-logo">
      <el-popover trigger="click" placement="right-start" v-model:visible="popoverVisible" :popper-style="{ width: 'auto' }">
        <template #reference>
          <img
            :src="
              userInfo.avatar ||
              'https://storage.7x24cc.com/storage-server/presigned/ss1/a6-online-fileupload/newMediaImage/2AFA742_427A_user-avatar_20241225150546694newMediaImage.png'
            "
            style="cursor: pointer"
          />
        </template>
        <user-info-inner @closePopover="popoverVisible = false"></user-info-inner>
      </el-popover>
    </div>
    <div class="sidebar-list" ref="sidebar_list">
      <div :class="['sidebar-list-item', item.active ? 'sidebar-list-active' : '']" v-for="item in sidebarList" :key="item.path" @click="changeTab(item)">
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
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import * as CONFIG from '@/utils/config'
import { ElPopover } from 'element-plus'

const { t } = useI18n()
const userInfo = ref(uni.getStorageSync(CONFIG.USER_KEY))
const router = useRouter()
const sidebar_list = ref(null)
const popoverVisible = ref(false)
const activePath = ref(router.currentRoute.value.path || '/home')

const getSidebarList = () => [
  { name: t('pc.home'), icon: homeBlack, activeIcon: homeOrange, path: '/home' },
  { name: t('pc.emby'), icon: embyBlack, activeIcon: embyOrange, path: '/emby' },
  { name: t('navbar.live'), icon: liveBlack, activeIcon: liveOrange, path: '/live' },
  { name: t('pc.settings'), icon: chilunBlack, activeIcon: chilunOrange, path: '/settings' },
].map(item => ({ ...item, active: item.path === activePath.value }))

const sidebarList = ref(getSidebarList())

const updateSidebarActive = () => {
  sidebarList.value.forEach(item => {
    item.active = item.path === activePath.value
  })
}

const measureSidebarHeights = () => {
  if (!sidebar_list.value) return

  sidebarList.value.forEach((item, index) => {
    item.height = sidebar_list.value.children[index].offsetHeight
  })
}

// 设置active背景的style
const setActiveStyle = () => {
  const activeItem = sidebarList.value.find(item => item.active)
  const activeIndex = sidebarList.value.findIndex(item => item.active)
  if (!activeItem || activeIndex === -1) return { height: '0px', top: '0px' }

  let top = 0
  sidebarList.value.forEach((item, index) => {
    if (index < activeIndex) {
      top += item.height || 0
    }
  })
  return { height: (activeItem.height || 0) + 'px', top: top + 'px' }
}

const changeTab = item => {
  if (activePath.value === item.path) return
  activePath.value = item.path
  updateSidebarActive()
  router.replace({
    path: item.path,
  })
}

onMounted(() => {
  setTimeout(measureSidebarHeights, 100)
})

// 监听语言变化，更新侧边栏文案
watch(
  () => t('pc.home'),
  () => {
    sidebarList.value = getSidebarList()
    nextTick(measureSidebarHeights)
  }
)
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
        width: 100%;
        margin-top: 12rpx;
        color: #000;
        text-align: center;
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
