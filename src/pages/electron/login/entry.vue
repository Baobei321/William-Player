<template>
  <div class="entry">
    <nut-icon name="loading1"></nut-icon>
  </div>
</template>

<script setup>
import * as CONFIG from '@/utils/config'
import { useRouter } from 'vue-router'
import { ipc } from '@/utils/ipcRenderer'
import { ipcApiRoute } from '@/utils/ipcApiRoute'

const router = useRouter()
const base_url = CONFIG.BASE_URL

//跳转到首页之后，放大窗口
const magnifyWindow = async () => {
  ipc.invoke(ipcApiRoute.changeWindowSize, { width: 1358, height: 841 })
}
const refreshAccess = () => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: base_url + '/refresh',
      method: 'post',
      header: { 'Content-Type': 'application/json' },
      data: { refreshToken: uni.getStorageSync('refreshToken') },
      timeout: 10000,
      success: res => {
        if (res.statusCode === 200) {
          if (res.data?.code === 0 || res.data?.code === 200) {
            uni.setStorageSync('Authorization', res.data.accessToken)
            uni.setStorageSync('refreshToken', res.data.refreshToken)
            magnifyWindow()
            router.replace({
              path: '/home',
            })
            resolve(res.data)
            //获取到新的一对token之后，重新请求之前失败的方法
          } else if (res.data?.code === 401) {
            //此时的情况是刷新token也过期了，跳转到登录页重新登录
            uni.removeStorageSync('Authorization')
            uni.removeStorageSync('refreshToken')
            router.replace({
              path: '/login',
            })
          }
        }
      },
      fail: err => {
        //如果接口可用，肯定会请求成功的，即使refreshToken过期，返回的statusCode也是200，所以这里走失败逻辑，大概率是网络异常或者服务器挂掉了，直接到首页去
        let settingData = uni.getStorageSync('settingData')
        if (settingData) {
          settingData.tmdbKey = '9e0add7c02b66868ab0a368df820a335'
          uni.setStorageSync('settingData', settingData)
        } else {
          uni.setStorageSync('settingData', { tmdbKey: '9e0add7c02b66868ab0a368df820a335', showProgress: true, playercodec: 'exoplayer', showRecommend: true })
        }
        magnifyWindow()
        router.replace({
          path: '/home',
        })
        reject(err)
      },
    })
  })
}
//初始化刷新token
const initRefreshToken = () => {
    refreshAccess()
}
initRefreshToken()
</script>

<style lang="scss" scoped>
.entry {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  .nut-icon {
    font-size: 80rpx;
    color: #9b9b9b;
  }
}
</style>
