<template>
  <div :class="['tmdb-key', themeClass]">
    <!-- <div class="tmdb-key-title">请输入要修改的tmdbKey</div>
<nut-input v-model="settingData.tmdbKey" placeholder="请输入tmdbKey" @blur="inputTmdb" class="tmdb-key-input"></nut-input> -->
    <div class="tmdb-key-title">{{ t('settings.playSettings') }}</div>
    <wil-form :options="settings1" :show-button="true" ref="base_form1" v-model="formData" :showButton="false">
      <template #showProgress>
        <nut-switch v-model="settingData.showProgress" active-color="#ff6701" @change="val => changeSwitch(val, 'showProgress')" />
      </template>
      <!-- <template #playercodec>
        <nut-radio-group v-model="settingData.playercodec" direction="horizontal" @change="(val)=>changeSwitch(val,'解码器')">
          <nut-radio label="exoplayer">ExoPlayer</nut-radio>
          <nut-radio label="ijkplayer">IjkPlayer</nut-radio>
        </nut-radio-group>
      </template> -->
    </wil-form>
    <div class="tmdb-key-title">{{ t('settings.displaySettings') }}</div>
    <wil-form :options="settings2" :show-button="true" ref="base_form2" v-model="formData" :showButton="false">
      <template #showRecommend>
        <nut-switch v-model="settingData.showRecommend" active-color="#ff6701" @change="val => changeSwitch(val, 'showRecommend')" />
      </template>
      <template #resetData>
        <nut-cell :title="t('settings.resetData')" is-link @click="resetMtData">
          <template #icon>
            <nut-icon name="refresh2"></nut-icon>
          </template>
        </nut-cell>
      </template>
      <template #theme>
        <nut-cell :title="t('settings.theme')" is-link :desc="themeText" @click="showPopover = true">
          <template #icon>
            <image src="@/static/theme-icon.png" />
          </template>
        </nut-cell>
      </template>
      <template #language>
        <nut-cell :title="t('settings.language')" is-link :desc="languageText" @click="showLanguagePopover = true">
          <template #icon>
            <nut-icon name="people"></nut-icon>
          </template>
        </nut-cell>
      </template>
    </wil-form>
    <nut-popup v-model:visible="showPopover" round position="bottom" safe-area-inset-bottom>
      <div :class="themeClass">
        <nut-picker v-model="status" :columns="popoverList" :title="t('settings.theme')" @confirm="confirmPicker" @cancel="showPopover = false" />
      </div>
    </nut-popup>
    <nut-popup v-model:visible="showLanguagePopover" round position="bottom" safe-area-inset-bottom>
      <div :class="themeClass">
        <nut-picker
          v-model="languageStatusValue"
          :columns="languageList"
          :title="t('settings.language')"
          @confirm="confirmLanguagePicker"
          @cancel="showLanguagePopover = false"
        />
      </div>
    </nut-popup>
    <wil-modal ref="wil_modal"></wil-modal>
    <!-- <nut-button custom-color="#090909" @click="confirmSet">确认设置</nut-button> -->
  </div>
</template>

<script setup>
import { ref, onBeforeMount, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import wilForm from '@/components/mobile/wil-form/index.vue'
import wilModal from '@/components/mobile/wil-modal/index.vue'
import { useThemeStore } from '@/stores/theme'
import { useLocaleStore } from '@/stores/locale'
import { useThemeClass } from '@/hooks/useThemeClass'
import { useThemeNavbar } from '@/hooks/useThemeNavbar'

useThemeNavbar()
const { t } = useI18n()
const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const themeClass = useThemeClass()

const settingData = ref({
  tmdbKey: '',
  showProgress: true,
  playercodec: 'exoplayer',
  showRecommend: true,
})

const wil_modal = ref(null)
const settings1 = computed(() => [
  { label: t('settings.showBottomProgress'), prop: 'showProgress' },
  // { label: t('settings.videoDecoder'), prop: "playercodec" },
])
const settings2 = computed(() => [
  { label: t('settings.showHomeRecommend'), prop: 'showRecommend' },
  { label: '', prop: 'resetData' },
  { label: '', prop: 'theme' },
  { label: '', prop: 'language' },
])

const showPopover = ref(false)
const popoverList = computed(() => [
  { text: t('settings.followSystem'), value: 'auto' },
  { text: t('settings.lightMode'), value: 'light' },
  { text: t('settings.darkMode'), value: 'dark' },
])
const status = ref(['auto'])
const themeText = computed(() => popoverList.value.find(i => i.value == status.value[0])?.text || t('settings.followSystem'))
const showLanguagePopover = ref(false)
const languageList = computed(() => localeStore.supportedLocales.map(item => ({ text: item.label, value: item.value })))
const languageStatus = ref([localeStore.locale])
const languageStatusValue = ref([localeStore.locale])
const languageText = computed(() => languageList.value.find(i => i.value == languageStatus.value[0])?.text || t('settings.chinese'))

watch(
  () => localeStore.locale,
  locale => {
    languageStatus.value[0] = locale
    languageStatusValue.value[0] = locale
  }
)

const changeSwitch = (val, type) => {
  if (type == 'showProgress') {
    settingData.value.showProgress = val
  } else if (type == 'showRecommend') {
    settingData.value.showRecommend = val
  } else if (type == 'playercodec') {
    settingData.value.playercodec = val
  }
  uni.setStorageSync('settingData', settingData.value)
}

const resetMtData = () => {
  wil_modal.value.showModal({
    title: t('modal.warmTip'),
    content: t('settings.resetDataConfirm'),
    confirmColor: '#ff6701',
    confirm: async () => {
      uni.removeStorageSync('localMovieTvData')
      uni.removeStorageSync('historyPlay')
    },
  })
}

const confirmPicker = ({ selectedValue, selectedOptions }) => {
  showPopover.value = false
  status.value[0] = selectedValue[0]
  // 通过 store 统一设置主题，支持 light/dark/auto 三种模式
  themeStore.setThemeUi(selectedValue[0])
}

const confirmLanguagePicker = ({ selectedValue }) => {
  showLanguagePopover.value = false
  languageStatus.value[0] = selectedValue[0]
  localeStore.setLocale(selectedValue[0])
}

onBeforeMount(() => {
  let settingData1 = uni.getStorageSync('settingData')
  if (settingData1) {
    settingData.value = settingData1
  }
  // 从 store 读取当前主题模式
  const mode = themeStore.getThemeUi()
  status.value[0] = mode
  languageStatus.value[0] = localeStore.locale
})
</script>

<style lang="scss" scoped>
page {
  width: 100%;
  height: 100%;
}
.tmdb-key {
  background: var(--app-bg-secondary);
  width: 100%;
  height: 100%;
  padding: 36rpx 24rpx 0 24rpx;
  box-sizing: border-box;
  .tmdb-key-title {
    font-size: 36rpx;
    color: var(--app-text-primary);
    font-weight: bold;
    margin-top: 24rpx;
  }
  ::v-deep .nut-input {
    padding-left: 20rpx;
    margin-top: 30rpx;
  }
  ::v-deep .nut-button {
    width: 100%;
    margin-top: 30rpx;
    height: 80rpx;
    border-radius: 16rpx;
  }
  ::v-deep .base-form {
    background: transparent;
    .base-form-content {
      .nut-form {
        .nut-cell-group__wrap {
          margin-bottom: 0;
          background: transparent;
          .nut-form-item {
            background: transparent;
            padding-top: 0;
            .nut-form-item__label {
              font-size: 32rpx;
              color: var(--app-text-secondary);
            }
            .nut-form-item__body {
              align-items: flex-end;
              .nut-form-item__body__slots {
                display: flex;
                width: 100%;
                justify-content: flex-end;
                .nut-radio-group {
                  .nut-radio {
                    .nut-icon-check-checked {
                      color: #ff6701;
                    }
                  }
                }
                .nut-cell {
                  width: 100%;
                  margin: 0;
                  padding: 26rpx 0;
                  box-shadow: none;
                  background: transparent;
                  .nut-cell__icon {
                    .nutui-icon {
                      width: 40rpx;
                      height: 40rpx;
                      line-height: 40rpx;
                      font-size: 32rpx;
                    }
                    image {
                      width: 40rpx;
                      height: 40rpx;
                    }
                  }
                  .nut-cell__title {
                    color: var(--app-text-secondary);
                    font-size: 32rpx;
                  }
                  .nut-cell__link {
                    // display: none;
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
