<template>
  <div class="userInfo">
    <div class="userInfo-avatar">
      <wil-uploader @success="uploadSuccess">
        <image
          :src="
            userInfo.avatar ||
            'https://storage.7x24cc.com/storage-server/presigned/ss1/a6-online-fileupload/newMediaImage/2AFA742_427A_user-avatar_20241225150546694newMediaImage.png'
          ">
        </image>
      </wil-uploader>
    </div>
    <div class="userInfo-cell">
      <wil-cell :options="options1" @clickItem="clickItem">
        <template #icon="item">
          {{ item.title }}
        </template>
        <template #title="item">
          <span :style="{ color: item.value ? '#353a45' : '#bbbbbb' }">{{ item.value || item.placeholder }}</span>
        </template>
      </wil-cell>
      <wil-cell :options="options2" @clickItem="clickItem">
        <template #icon="item">
          {{ item.title }}
        </template>
        <template #title="item">
          <span :style="{ color: item.value ? '#353a45' : '#bbbbbb' }">{{ item.value || item.placeholder }}</span>
        </template>
      </wil-cell>
      <wil-cell :options="options3" @clickItem="clickItem">
        <template #icon="item">
          {{ item.title }}
        </template>
        <template #title="item">
          <div v-if="item.title === '支付宝'" class="alipay-cell">
            <image :src="userInfo?.isBindAlipay ? bindedIcon : nobindedIcon"></image>
            <span :style="{ color: userInfo?.isBindAlipay ? '#00c286' : '#FE4344' }">{{ userInfo?.isBindAlipay ? '已绑定' : '未绑定' }}</span>
          </div>
          <span :style="{ color: item.value ? '#353a45' : '#bbbbbb' }" v-else>{{ item.value || item.placeholder }}</span>
        </template>
        <template #link="item">
          <span class="unbind-button" v-if="item.title === '支付宝' && userInfo?.isBindAlipay" @click.stop="unBind">解除绑定</span>
        </template>
      </wil-cell>
    </div>
    <wil-modal ref="wil_modal"></wil-modal>
  </div>
</template>

<script setup>
import wilUploader from '@/components/mobile/wil-uploader/index.vue'
import wilCell from '@/components/mobile/wil-cell/index.vue'
import * as CONFIG from '@/utils/config.js'
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { editUserInfo } from '@/network/apis.js'
import bindedIcon from '@/static/binded-icon.png'
import nobindedIcon from '@/static/nobinded-icon.png'
import { bindAlipay, unbindAlipay } from '@/network/apis'

const userInfo = ref({})
const wil_modal = ref(null)
const genderDict = {
  '0': '男',
  '1': '女',
  '2': '未知',
}
const options1 = computed(() => [
  {
    title: '用户ID',
    path: null,
    tip: '无法修改用户ID',
    value: uni.getStorageSync(CONFIG.USER_ID),
  },
  {
    title: '昵称',
    path: null,
    value: userInfo.value.name,
  },
  {
    title: '性别',
    path: null,
    value: genderDict[userInfo.value.gender],
  },
])
const options2 = computed(() => [
  {
    title: '简介',
    path: null,
    value: userInfo.value.remark,
    placeholder: '介绍一下自己',
  },
])
const options3 = computed(() => [
  {
    title: '账号',
    path: null,
    tip: '无法修改账号',
    value: userInfo.value.userName,
  },
  {
    title: '手机号',
    path: null,
    value: userInfo.value.phonenumber,
  },
  {
    title: '邮箱',
    path: null,
    value: userInfo.value.email,
    placeholder: '请绑定邮箱',
  },
  {
    title: '支付宝',
    path: null,
    value: userInfo.value.email,
    placeholder: '请绑定支付宝',
  },
  //   {
  //     title: 'Tmdb密钥',
  //     path: null,
  //     tip: '无法修改Tmbd密钥',
  //     value: userInfo.value.tmdbKey,
  //   },
])
const uploadSuccess = event => {
  userInfo.value.avatar = event.data.url
  uni.setStorageSync(CONFIG.USER_KEY, userInfo.value)
  editUserInfo({ avatar: event.data.url })
}

const clickItem = item => {
  if (item.tip) {
    uni.showToast({
      title: item.tip,
      icon: 'none',
    })
  } else {
    if (item.title === '支付宝') {
      toBindAlipay()
    } else {
      uni.navigateTo({
        url: `/pages/mobile/mine/userInfo/edit?title=${item.title}`,
      })
    }
  }
}

const toBindPost = async (res) => {
  await bindAlipay({ alipayCode: res.auth_code })
  userInfo.value.isBindAlipay = true
  uni.setStorageSync(CONFIG.USER_KEY, userInfo.value)
}

//绑定支付宝
const toBindAlipay = () => {
  const Alipay = uni.requireNativePlugin('AlipayModule')
  Alipay.openAuthScheme(
    {
      appId: '2021006126672664', // 支付宝分配给开发者的应用 ID
      scheme: 'WilliamPlayer',
    },
    res => {
      toBindPost(res)
    }
  )
}

//解除绑定
const unBind = event => {
  wil_modal.value.showModal({
    title: '温馨提示',
    content: '是否确认解绑支付宝？',
    confirmColor: '#ff6701',
    confirm: async () => {
      await unbindAlipay({})
      userInfo.value.isBindAlipay = false
      uni.setStorageSync(CONFIG.USER_KEY, userInfo.value)
    },
  })
}
onShow(() => {
  userInfo.value = uni.getStorageSync(CONFIG.USER_KEY)
})
</script>

<style lang="scss" scoped>
page {
  width: 100%;
  height: 100%;
}

.userInfo {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  padding: 0 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;

  .userInfo-avatar {
    width: 150rpx;
    height: 150rpx;
    margin: 32rpx 0;

    image {
      width: 150rpx;
      height: 150rpx;
      border-radius: 50%;
      display: block;
    }
  }

  .userInfo-cell {
    width: 100%;

    :deep(.wil-cell) {
      margin-top: 24rpx;

      .nut-cell-group__wrap {
        .nut-cell {
          .nut-cell__icon {
            flex: 0 0 200rpx;
            margin-right: 0;
            color: #949494;
            font-weight: 500;
          }

          .nut-cell__title {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            display: block;
            font-weight: 500;
            .alipay-cell {
              display: flex;
              align-items: center;
              //   justify-content: space-between;

              image {
                display: block;
                width: 30rpx;
                height: 30rpx;
              }
              span {
                color: #fe4344;
                font-size: 30rpx;
                padding-left: 12rpx;
              }

              .alipay-cell-right {
                font-size: 30rpx;
                color: #fe4344;
              }
            }
          }
          .unbind-button {
            font-size: 30rpx;
            color: #fe4344;
            position: relative;
            z-index: 9999;
          }
        }
      }
    }
  }
}
</style>
