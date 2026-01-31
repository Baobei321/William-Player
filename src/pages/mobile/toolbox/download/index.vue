<template>
  <div class="download">
    <wil-navbar title="下载管理" :rightShow="true"></wil-navbar>
    <div class="download-container">
      <template v-if="downloadList?.length">
        <div class="download-title">正在下载：{{ downloadList?.length }}</div>
        <div class="download-list">
          <list-item
            v-for="item in downloadList"
            :key="item.id"
            :data="item"
            @click="openDocument(item)"
            @pauseById="pauseById"
            @resumeById="resumeById"
            @deleteById="deleteById"></list-item>
        </div>
      </template>
      <template v-if="completedList?.length">
        <div class="completed-title">下载完成：{{ completedList?.length }}</div>
        <div class="completed-list">
          <list-item v-for="item in completedList" :key="item.id" :data="item" @click="openDocument(item)"></list-item>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import wilNavbar from '@/components/mobile/wil-navbar/index.vue'
import listItem from './components/list-item.vue'
import { handleSize } from '@/utils/emby.js'

const taskList = ref([])
const downloadList = ref([])
const completedList = ref([])
const index1 = ref(0)
let DownloaderManager = null
let isListener = false //是否正在监听

const openDocument = item => {
  uni.navigateTo({
    url: `/pages/mobile/video/video-player?videoUrl=${encodeURIComponent(
      `/storage/emulated/0/Android/data/com.android.williamplayer/cache/myDownloader/${item.name}`
    )}&noSetHistory=0`, //noSetHistory为0表示不缓存历史播放记录
  })
}

const initDownloader = () => {
  if (!DownloaderManager) {
    DownloaderManager = uni.requireNativePlugin('WilliamDownloader')
    DownloaderManager.init(
      {
        maxDownloadTasks: 3, // 最大同时下载任务数
        downloadDir: '/storage/emulated/0/Android/data/com.android.williamplayer/cache/myDownloader', // 下载文件路径
        maxDownloadThreads: 3, // 最大下载线程数
        autoRecovery: true, // 是否自动恢复下载
        openRetry: true, // 下载失败是否打开重试
        maxRetryCount: 2, // 重试次数
        retryIntervalMillis: 1000, // 每次重试时间间隔（毫秒）
      },
      function (res) {
        if (0 == res.code) {
          uni.showToast({
            title: res.msg,
            icon: 'none',
          })
          // 显示下载列表
        }
      }
    )
  }
}

//监听下载进度
const startListener = () => {
  if (!isListener) {
    uni.showToast({
      title: '开始监听',
      icon: 'none',
    })
    isListener = true //此时已经在监听了
    DownloaderManager.startListener(result => {
      index1.value++
      let res = JSON.parse(result.data)
      if (res instanceof Object) {
        let obj = {
          id: res.id,
          name: res.save_name,
          status: res.status,
          current_size: res.current_size,
          total_size: res.total_size,
        }
        if (taskList.value.every(i => i.id !== obj.id)) {
          taskList.value.push(obj)
        } else {
          let exit = taskList.value.find(i => i.id === obj.id)
          exit.speed = handleSize(res.current_byte - exit.current_byte) + '/s'
          exit.current_size = res.current_size
          exit.current_byte = res.current_byte
          exit.total_size = res.total_size
          exit.percent = res.percent
          exit.status = res.status
        }
      }
    })
  }
}

//创建下载任务
const createDownload = () => {
  initDownloader()
  DownloaderManager.createDownloadTask(
    {
      downUrl:
        'https://media-zjhz-fy-person01.zj6oss.ctyunxs.cn/PERSONCLOUD/f310df5a-15cd-4dbc-b414-7a5100252967.mp4?x-amz-CLIENTTYPEIN=PC&AWSAccessKeyId=0Lg7dAq3ZfHvePP8DKEU&x-amz-userLevel=100&x-amz-limitrate=51200&response-content-type=video/mp4&x-amz-UID=64784934&response-content-disposition=attachment%3Bfilename%3D%2209.mp4%22%3Bfilename*%3DUTF-8%27%2709.mp4&x-amz-CLIENTNETWORK=UNKNOWN&x-amz-CLOUDTYPEIN=PERSON&Signature=4XB2gn0QF%2BQtw3HR3DyRot7tlL8%3D&Expires=1769238525&x-amz-FSIZE=1227841923&x-amz-UFID=225481186083258592',
      saveName: '腾讯视频.mp4', // 此处可改成根据下载地址自动获取文件名及文件格式
      imgUrl: 'https://n.sinaimg.cn/sinakd20230822s/429/w1000h1029/20230822/85c9-12a6845ed1089e9489c8510b78bfd6ef.jpg',
    },
    function (res) {
      uni.showToast({
        title: res,
        icon: 'none',
        duration: 7000,
      })
      if (res.code == 0) {
        uni.showToast({
          title: '创建下载任务之后开始监听',
        })
        queryAll()
        startListener()
      }
    }
  )
}

//暂停单个下载任务
const pauseById = id => {
  DownloaderManager.pauseById(id)
}
//取消暂停下载任务
const resumeById = id => {
  DownloaderManager.resumeById(id)
}

//通过id删除下载任务
const deleteById = item => {
  // 删除之前若任务在进行中，请先暂停任务再进行删除操作
  pauseById(item.id)
  // deleteById 参数1：任务id 参数2：是否同时删除文件 参数3：要删除的文件名
  DownloaderManager.deleteById(item.id, true, item.name)
  queryAll()
}

//查询所有下载任务
const queryAll = () => {
  initDownloader()
  DownloaderManager.queryAll(res => {
    taskList.value = res.data ? JSON.parse(res.data) : []
    downloadList.value = taskList.value.filter(i => i.status === 'DOWNLOADING' || i.status === 'PAUSED' || i.status === 'CONNECTING' || i.status === 'ERROR')
    completedList.value = taskList.value.filter(i => i.status === 'COMPLETED')
    startListener()
  })
}
queryAll()
</script>

<style lang="scss" scoped>
.download {
  display: flex;
  flex-direction: column;
  .download-container {
    flex: 1;
    overflow: auto;
    .download-title {
      padding: 0 24rpx;
      font-size: 30rpx;
      font-weight: bold;
    }
    .completed-title {
      padding: 0 24rpx;
      font-size: 30rpx;
      font-weight: bold;
    }
  }
}
</style>