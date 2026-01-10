<template>
  <div class="tv-navbar">
    <div class="tv-navbar-left">
      <div :class="['tv-navbar-left__search', tabIndex === 0 ? 'search-active' : '']">
        <image src="@/static/search-white.png"></image>
        <span>搜索</span>
      </div>
      <div class="tv-navbar-left__tabs">
        <nut-tabs v-model="activeTab" custom-color="#fff" background="transparent">
          <nut-tab-pane :title="item" :pane-key="item" v-for="item in tabsArr" :key="item"> </nut-tab-pane>
        </nut-tabs>
      </div>
    </div>
    <div class="tv-navbar-right">
      <div :class="['tv-navbar-right__icon', 'tv-navbar-right__refresh', tabIndex === 3 ? 'tv-navbar-right__icon-active' : '']" @click="showProgress">
        <image :class="['tv-navbar-right__icon-refresh', loading ? 'refresh-rotate' : '']" src="@/static/xuanzhuan-icon.png"> </image>
      </div>
      <div :class="['tv-navbar-right__icon', tabIndex === 4 ? 'tv-navbar-right__icon-active' : '']" @click="openSetting">
        <image class="tv-navbar-right__icon-setting" src="@/static/chilun-icon.png"></image>
      </div>
      <span>{{ nowTime }}</span>
    </div>
    <template v-if="showPopover">
      <div :class="['tv-navbar-arrow', isShowPopover ? 'popover-in' : 'popover-out']" :style="{ left: popoverStyle.left, top: popoverStyle.top }">
        <image src="@/static/rect-san.png" style="width: 100%; height: 100%"></image>
      </div>
      <div
        :class="['tv-navbar-popover', , isShowPopover ? 'popover-in' : 'popover-out']"
        :style="{ left: popoverStyle.left, top: +popoverStyle?.top?.split('px')[0] + 12 + 'px' }">
        <div class="popover-title">
          <div class="popover-title-left">
            <span>{{ popoverData.title }}</span>
          </div>
        </div>
        <div class="popover-list">
          <div class="popover-list-item" v-for="(item, index) in popoverData.list" :key="item.label">
            <span>{{ item.label }}</span>
            <span>{{ item.value }}</span>
            <template v-if="index != popoverData.list.length - 1">，</template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import dayjs from 'dayjs'
import { onUnload } from '@dcloudio/uni-app'

const props = defineProps({
  refreshData: { type: Object, default: {} },
  isFocus: { type: Boolean, default: false },
  focusModel: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  isEmpty: { type: Boolean, default: false },
})
const emits = defineEmits(['setFocus', 'changeSetting', 'refresh'])

const tabsArr = ref(['影视', '直播'])
const activeTab = ref('影视')
const nowTime = ref('')
const tabIndex = ref(-1)
const loading = ref(false) //是否正在旋转，刮削中
const showPopover = ref(false) //是否显示蓝色的框，用来显示刮削到多少部影片
const popoverData = ref({}) //用于存储蓝色框显示的数据
const selectType = ref({}) //被选中资源的type
const selectMedia = ref({}) //被选中资源的media

const timer = ref(null)
const timer1 = ref(null)
const timer2 = ref(null)

const popoverStyle = ref({})
const isShowPopover = ref(false)

const evtMove = keyCode => {
  if (keyCode === 'KeyRight') {
    if (tabIndex.value != 4) {
      tabIndex.value++
    }
  } else if (keyCode === 'KeyLeft') {
    if (tabIndex.value > 0) {
      tabIndex.value--
    }
  } else if (keyCode === 'KeyDown') {
    if (props.isEmpty) {
      emits('setFocus', 'videoEmpty', 'KeyDown')
    } else {
      emits('setFocus', 'starRecommend', 'KeyDown')
    }
  } else if (keyCode === 'KeyEnter') {
    if (tabIndex.value === 0) {
      //点击搜索
    } else if (tabIndex.value === 3) {
      showProgress()
    } else if (tabIndex.value === 4) {
      //点击设置
      openSetting()
    }
  }
  if (tabIndex.value == 1) {
    activeTab.value = '影视'
  } else if (tabIndex.value == 2) {
    activeTab.value = '直播'
  }
}

//判断选择的是webdav还是天翼云盘还是夸克
const judgeSelect = () => {
  let sourceList = uni.getStorageSync('sourceList')
  selectType.value = sourceList.find(item => {
    let select = item.list.find(i => i.active)
    if (select) {
      selectMedia.value = select
      return true
    } else {
      return false
    }
  })
}

//父组件调用此方法旋转刷新按钮，触发刮削
const showProgress = () => {
  clearTimeout(timer1.value)
  timer1.value = null
  clearTimeout(timer2.value)
  timer2.value = null
  if (loading.value) {
    showPopover.value = true
    return
  }
  popoverData.value.title = '正在扫描'
  popoverData.value.list = [
    { label: '已找到', value: 0 },
    { label: '待更新', value: 0 },
    { label: '已更新', value: 0 },
  ]
  showPopover.value = true
  isShowPopover.value = true
  judgeSelect()
  if (selectType.value.type == 'Emby') {
    showPopover.value = false
    isShowPopover.value = false
  }
  emits('refresh')
  timer1.value = setTimeout(() => {
    //刮削时间到了60s那就自动暂停
    isShowPopover.value = false
    setTimeout(() => {
      showPopover.value = false
    }, 300)
    clearTimeout(timer1.value)
    timer1.value = null
    emits('pause')
  }, 60000)
}

const openSetting = () => {
  emits('changeSetting', true)
}
const getScrollTop = () => {
  return 0
}
const getNowTime = () => {
  nowTime.value = dayjs().format('HH:mm')
}
getNowTime()
timer.value = setInterval(() => {
  getNowTime()
}, 1000)
onUnload(() => {
  clearInterval(timer.value)
  timer.value = null
})
watch(
  () => props.isFocus,
  val => {
    if (val) {
      tabIndex.value = 0
    } else {
      tabIndex.value = -1
    }
  }
)
watch(
  () => props.refreshData,
  val => {
    if (props.loading) {
      popoverData.value.list = [
        { label: '已找到', value: 0 },
        { label: '待更新', value: 0 },
        { label: '已更新', value: 0 },
      ]
      popoverData.value.list.find(i => i.label == '待更新').value = val.toupdate || 0
    } else {
      popoverData.value.list = [
        { label: '已找到', value: 0 },
        { label: '已失败', value: 0 },
        { label: '已更新', value: 0 },
      ]
      popoverData.value.list.find(i => i.label == '已失败').value = val.fail || 0
    }
    popoverData.value.list.find(i => i.label == '已找到').value = val.found || 0
    popoverData.value.list.find(i => i.label == '已更新').value = val.updated || 0
  },
  { deep: true }
)
watch(
  () => props.loading,
  val => {
    loading.value = val
    if (!val) {
      popoverData.value.title = `已完成同步${props.refreshData.success || 0}个影片`
      timer2.value = setTimeout(() => {
        isShowPopover.value = false
        setTimeout(() => {
          showPopover.value = false
        }, 300)
      }, 6000)
      clearTimeout(timer1.value)
      timer1.value = null
    }
  },
  { deep: true }
)

onMounted(() => {
  const query = uni.createSelectorQuery()
  query
    .select('.tv-navbar-right__refresh')
    .fields(
      {
        rect: true,
        size: true,
      },
      res => {
        popoverStyle.value = { left: res.left + res.width / 2 + 'px', top: res.top + res.height + 'px' }
      }
    )
    .exec()
})
defineExpose({
  evtMove,
  getScrollTop,
  tabIndex,
  showProgress,
})
</script>

<style lang="scss" scoped>
@keyframes spin-reverse {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

.tv-navbar {
  padding: 40rpx 80rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  width: 100%;
  z-index: 1000;
  box-sizing: border-box;

  .tv-navbar-left {
    display: flex;
    align-items: center;

    .tv-navbar-left__search {
      display: flex;
      align-items: center;
      padding: 20rpx 30rpx;
      border-radius: 40rpx;

      image {
        width: 35rpx;
        height: 35rpx;
      }

      span {
        color: #fff;
        font-size: 28rpx;
        padding-left: 14rpx;
      }
    }

    .search-active {
      background: #2b2b2b;
    }

    .tv-navbar-left__tabs {
      margin-left: 130rpx;

      ::v-deep .nut-tabs {
        .nut-tabs__titles {
          .nut-tabs__list {
            .nut-tabs__titles-item {
              .nut-tabs__titles-item__text {
                color: #d3d3d3;
                font-size: 28rpx;
              }

              .nut-tabs__titles-item__line {
                height: 4rpx;
              }
            }

            .nut-tabs-active {
              .nut-tabs__titles-item__text {
                color: #fff;
                font-weight: normal;
              }
            }
          }
        }

        .nut-tabs__content {
          display: none;
        }
      }
    }
  }

  .tv-navbar-right {
    display: flex;
    align-items: center;

    .tv-navbar-right__icon {
      padding: 10rpx;
      border: 4rpx solid transparent;
      display: flex;
      cursor: pointer;
      margin-left: 0;

      &:first-child {
        margin-left: 0;
      }

      .tv-navbar-right__icon-refresh {
        width: 50rpx;
        height: 50rpx;
      }

      .refresh-rotate {
        animation: spin-reverse 1s linear infinite reverse;
      }

      .tv-navbar-right__icon-setting {
        width: 50rpx;
        height: 50rpx;
      }
    }

    .tv-navbar-right__icon-active {
      border: 4rpx solid #fff;
      border-radius: 50%;
    }

    span {
      padding-left: 20rpx;
      color: #fff;
      font-weight: bold;
    }
  }

  .tv-navbar-arrow {
    width: 16px;
    height: 16px;
    position: fixed;
    transform: translateX(-50%);
  }

  .tv-navbar-popover {
    position: fixed;
    transform: translateX(-70%);
    background: #315ffd;
    padding: 12px;
    border-radius: 10px;

    .popover-title {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .popover-title-left {
        font-size: 15px;
        color: #fff;

        .popover-title-left__button {
          display: inline-block;
          border: 1px solid #fff;
          margin-left: 5px;
          padding: 0 2px;
        }
      }

      .popover-title-right {
        .nut-icon-close {
          font-size: 15px;
          width: 15px;
          height: 15px;
          display: block;
        }
      }
    }

    .popover-list {
      display: flex;
      align-items: center;
      margin-top: 10px;

      .popover-list-item {
        display: flex;
        align-items: baseline;

        span:first-child {
          font-size: 14px;
          color: #d0d0d0;
          white-space: nowrap;
        }

        span:last-child {
          font-size: 14px;
          padding-left: 3px;
          color: #fff;
          font-weight: bold;
        }
      }
    }
  }

  .popover-in {
    animation: fadeIn 0.3s ease-in-out forwards;
  }

  .popover-out {
    animation: fadeOut 0.3s ease-in-out forwards;
  }
}
</style>
