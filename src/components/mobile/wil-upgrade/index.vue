<template>
  <div class="wil-upgrade">
    <nut-popup
      v-model:visible="showBottom"
      round
      safe-area-inset-bottom
      position="bottom"
      :custom-style="{ height: '60%' }"
      @closed="closedPopup"
      @open="open"
      @close="close"
    >
      <div class="wil-upgrade-container">
        <div class="wil-upgrade-title">
          <div class="wil-upgrade-title__logo">
            <image :src="props.logo"  />
          </div>
          <div class="wil-upgrade-title__info">
            <div class="wil-upgrade-title__info-name">{{ props.appName }}</div>
            <div class="wil-upgrade-title__info-time">{{ dayjs(newVersion[props.defaultProps.updateTime]).format('YYYY-MM-DD') }}</div>
          </div>
        </div>
        <div class="wil-upgrade-list">
          <div class="wil-upgrade-list__title">
            <span>{{ t('upgrade.foundNewVersion') }}</span>
            <span>{{ newVersion[props.defaultProps.version] }}</span>
          </div>
          <div class="wil-upgrade-list__container" v-html="newVersion[props.defaultProps.remark]"></div>
        </div>
        <div class="wil-upgrade-button">
          <nut-button custom-color="#ff6701" @click="toDownLoad(newVersion[props.defaultProps.apkUrl])" v-if="!showProgress && downStatus == -1">{{ t('upgrade.downloadUpdateNow') }}</nut-button>
          <nut-button custom-color="#ff6701" @click="showBottom = false" v-if="!showProgress && downStatus == 0">{{ t('upgrade.installFailedClose') }}</nut-button>
          <nut-button custom-color="#ff6701" @click="installNow" v-if="!showProgress && downStatus == 1">{{ t('upgrade.installNow') }}</nut-button>
          <nut-button custom-color="#ff6701" @click="downloadInstallApp(newVersion[props.defaultProps.apkUrl])" v-if="!showProgress && downStatus == 2">
            {{ t('upgrade.downloadInterruptedContinue') }}
          </nut-button>
          <template v-if="showProgress">
            <nut-progress :percentage="percent" stroke-color="#ff6701" :text-color="iconColor" />
            <div class="wil-upgrade-button__tip">{{ tipText }}</div>
          </template>
        </div>
      </div>
    </nut-popup>
  </div>
</template>

<script setup>
import { computed, ref, onBeforeMount, watch } from 'vue'
import { onHide } from '@dcloudio/uni-app'
import { addOperLog } from '@/network/apis'
import dayjs from 'dayjs'
import { useThemeColors } from '@/hooks/useThemeColors'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { iconColor } = useThemeColors()

const props = defineProps({
  type: { type: String, default: 'outApp' },
  logo: { type: String, default: '' },
  appName: { type: String, default: '' },
  appVersion: { type: String, default: '' },
  updateFunction: { type: Function },
  visible: { type: Boolean, default: false },
  enableControl: { type: Boolean, default: false },
  defaultProps: {
    type: Object,
    default: {
      updateTime: 'created_at',
      version: 'tag_name',
      remark: 'body',
      apkUrl: 'downloadUrl',
    },
  },
})
const showBottom = ref(false)
const newVersion = ref({})
const tipTextKey = ref('upgrade.waitDownload')
const tipTextParams = ref({})
const tipText = computed(() => t(tipTextKey.value, tipTextParams.value))
const percent = ref(0)
const showProgress = ref(false)

const downStatus = ref(-1)
const systemUrl = ref('')
const dFileName = ref('')
const dTask = ref(null)
const downloadedSize = ref(0)

const emits = defineEmits(['closed', 'update:visible'])

const REMIND_TIME_DEFAULT = 'always'
const REMIND_TIME_TYPES = ['always', 'daily', 'weekly', 'never']
const legacyRemindTimeMap = {
  总是: 'always',
  每天: 'daily',
  每周: 'weekly',
  从不: 'never',
}
const remindTimeIntervalMap = {
  daily: 86400000,
  weekly: 604800000,
}
const normalizeRemindTime = remindTime => {
  const data = remindTime || {}
  const type = legacyRemindTimeMap[data.type] || data.type
  return {
    ...data,
    type: REMIND_TIME_TYPES.includes(type) ? type : REMIND_TIME_DEFAULT,
  }
}

const compareVersions = (newBb, oldBb) => {
  if (newBb) {
    const v1 = newBb?.split('.').map(Number)
    const v2 = oldBb?.split('.').map(Number)

    for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
      if ((v1[i] || 0) < (v2[i] || 0)) {
        return -1
      }
      if ((v1[i] || 0) > (v2[i] || 0)) {
        return 1
      }
    }
  }
  return 0
}

const judegeShow = () => {
  const remindTime = normalizeRemindTime(uni.getStorageSync('remindTime'))
  const interval = remindTimeIntervalMap[remindTime.type]
  if (remindTime.lastTime) {
    if (Date.now() - remindTime.lastTime > interval) {
      showBottom.value = true
      uni.setStorageSync('remindTime', { type: remindTime.type, lastTime: Date.now() })
    }
  } else {
    showBottom.value = true
    uni.setStorageSync('remindTime', { type: remindTime.type, lastTime: Date.now() })
  }
}

const getUpdateInfo = async () => {
  let res = await props.updateFunction()
  newVersion.value = res
  let version = props.appVersion
  if (compareVersions(newVersion.value.tag_name, version) == 1) {
    if (props.enableControl) {
      let remindTime = normalizeRemindTime(uni.getStorageSync('remindTime'))
      uni.setStorageSync('remindTime', remindTime)
      if (remindTime.type == 'always') {
        showBottom.value = true
      } else if (remindTime.type == 'daily' || remindTime.type == 'weekly') {
        judegeShow()
      } else if (remindTime.type == 'never') {
      } else {
        showBottom.value = true
      }
    } else {
      showBottom.value = true
    }
  }
}

const installNow = () => {
  plus.runtime.install(systemUrl.value, {}, {}, function (error) {
    uni.showToast({
      title: t('upgrade.installFailed'),
      icon: 'none',
    })
  })
}

const toDownLoad = apkUrl => {
  if (props.type == 'inApp') {
    downloadInstallApp(apkUrl)
  } else if (props.type == 'outApp') {
    addOperLog({ title: t('upgrade.updateApp'), businessType: 13, operatorType: 2 })
    if (apkUrl) {
      plus.runtime.openURL(apkUrl, error => {
        if (error) {
          uni.showToast({ title: t('common.openBrowserFailed'), icon: 'none' })
        }
      })
    } else {
      plus.runtime.openURL('https://gitee.com/waylon-chen/William-Player/releases/latest', error => {
        if (error) {
          uni.showToast({ title: t('common.openBrowserFailed'), icon: 'none' })
        }
      })
    }
  }
}

// 下载更新
const downloadInstallApp = apkUrl => {
  showProgress.value = true
  let dtask = plus.downloader.createDownload(apkUrl, { filename: '_downloads/' }, function (d, status) {
    if (status == 200) {
      downStatus.value = 1
      showProgress.value = false
      systemUrl.value = plus.io.convertLocalFileSystemURL(d.filename)
      dFileName.value = d.filename
      plus.runtime.install(plus.io.convertLocalFileSystemURL(d.filename), {}, {}, function (error) {
        uni.showToast({
          title: t('upgrade.installFailed'),
          icon: 'none',
          duration: 7000,
        })
      })
    } else {
      uni.showToast({
        title: t('upgrade.updateFailed'),
        icon: 'none',
      })
      downStatus.value = 0
      showProgress.value = false
    }
  })
  dTask.value = dtask
  downloadProgress(dtask)
}
// 下载进度
const downloadProgress = dtask => {
  try {
    dtask.start()
    uni.showToast({
      title: t('upgrade.startDownload'),
      icon: 'none',
    })
    dtask.addEventListener('statechanged', function (task, status) {
      switch (task.state) {
        case 1:
          tipTextKey.value = 'upgrade.waitDownload'
          tipTextParams.value = {}
          break
        case 2:
          tipTextKey.value = 'upgrade.connectedToServer'
          tipTextParams.value = {}
          break
        case 3:
          downloadedSize.value = task.downloadedSize
          percent.value = parseInt((parseFloat(task.downloadedSize) / parseFloat(task.totalSize)) * 100)
          tipTextKey.value = 'upgrade.apkDownloading'
          tipTextParams.value = { downloaded: handleSize(task.downloadedSize), total: handleSize(task.totalSize) }
          break
        case 4:
          plus.nativeUI.closeWaiting()
          break
      }
    })
  } catch (e) {
    plus.nativeUI.closeWaiting()
    downStatus.value = 0
    showProgress.value = false
    uni.showToast({
      title: t('upgrade.updateFailed'),
      icon: 'none',
    })
  }
}
//处理内存大小
const handleSize = size => {
  if (size == 0) return '0'
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(size) / Math.log(1024))
  const formatted = parseFloat((size / Math.pow(1024, i)).toFixed(2))
  return formatted + ' ' + sizes[i]
}

const closedPopup = () => {
  if (dFileName.value) {
    plus.io.resolveLocalFileSystemURL(
      dFileName.value,
      function (entry) {
        entry.remove(
          function () {
            dFileName.value = ''
            systemUrl.value = ''
          },
          function (e) {}
        )
      },
      function (e) {}
    )
    plus.downloader.clear()
  }
  emits('closed')
}

const open = () => {
  emits('update:visible', true)
}

const close = () => {
  emits('update:visible', false)
}

closedPopup()

onBeforeMount(() => {
  downloadedSize.value = +uni.getStorageSync('downloadedSize')
  if (downloadedSize.value > 0) {
    downStatus.value = 2
  }
})

watch(
  () => props.visible,
  val => {
    if (val) {
      if (!props.enableControl) {
        getUpdateInfo()
      }
    } else {
      if (props.enableControl) {
        getUpdateInfo()
      }
    }
    showBottom.value = val
  },
  { immediate: true }
)

onHide(() => {
  uni.setStorageSync('downloadedSize', downloadedSize.value)
  if (downStatus.value != 1) {
    if (props.type == 'inApp') {
      dTask.value.abort()
    }
  }
})
</script>

<style lang="scss" scoped>
.wil-upgrade {
  .wil-upgrade-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;
    padding-bottom: 24rpx;

    .wil-upgrade-title {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-top: 20rpx;

      &__logo {
        width: 100rpx;
        height: 100rpx;
        box-sizing: border-box;

        image {
          width: 100%;
          height: 100%;
        }
      }

      &__info {
        &-name {
          font-size: 32rpx;
        }

        &-version {
          color: var(--app-text-tertiary);
          font-size: 24rpx;
        }

        &-time {
          color: var(--app-text-tertiary);
          font-size: 24rpx;
        }
      }
    }

    .wil-upgrade-list {
      flex: 1;
      overflow: hidden;
      width: 100%;
      box-sizing: border-box;
      padding-top: 24rpx;
      display: flex;
      flex-direction: column;

      &__title {
        font-size: 36rpx;
        font-weight: bold;
        padding-left: 36rpx;
        padding-bottom: 24rpx;

        span:last-child {
          padding-left: 15rpx;
        }
      }

      &__container {
        padding: 0 60rpx;
        white-space: pre-line;
        overflow: auto;
        flex: 1;
        width: 100%;
        box-sizing: border-box;

        ::v-deep p {
          img {
            width: 100%;
          }
        }
      }
    }

    .wil-upgrade-button {
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 0 60rpx;
      box-sizing: border-box;
      padding-top: 24rpx;

      ::v-deep .nut-button {
        width: 100%;
        border: none;
      }

      .wil-upgrade-button__tip {
        padding-top: 10rpx;
        font-size: 28rpx;
        color: var(--app-text-primary);
      }
    }
  }
}
</style>
