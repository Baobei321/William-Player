<template>
  <div class="add-webdav-form">
    <wil-navbar :title="routerParams.title"></wil-navbar>
    <div class="add-webdav-form__container">
      <base-form v-model="state.formData" :options="options" ref="base_form"></base-form>
      <nut-button custom-color="#18CAB8" @click="confirmSubmit">确认{{ routerParams.title=='添加WebDAV'?'添加':'修改' }}</nut-button>
      <!-- <loginPopup v-model:visible="showLoginPopup" @loginSuccess="loginSuccess"></loginPopup> -->
    </div>
  </div>
</template>
  
  <script setup>
import { onBeforeMount, reactive, ref } from 'vue'
import baseForm from '../../components/wil-form/index.vue'
import wilNavbar from '../../components/wil-navbar/index.vue'
import { onLoad } from '@dcloudio/uni-app';


const state = reactive({
  formData: {}
})

const base_form = ref(null)
// const showLoginPopup = ref(false)

const routerParams = ref({})

const options = ref([
  { label: '名称', prop: 'name', type: 'input', formItemProps: { placeholder: '请输入', type: 'text' }, rule: [{ required: true, message: '请输入名称' }] },
  { label: '地址', prop: 'address', type: 'input', formItemProps: { placeholder: '例如:127.0.0.1', type: 'text' }, rule: [{ required: true, message: '请输入地址' }] },
  { label: '端口', prop: 'port', type: 'input', formItemProps: { placeholder: '选填,例如:5244', type: 'number' }, rule: [{ required: true, message: '请输入端口' }] },
  { label: '用户名', prop: 'username', type: 'input', formItemProps: { placeholder: 'alist用户名,例如:admin', type: 'text' }, rule: [{ required: true, message: '请输入用户名' }] },
  { label: '密码', prop: 'password', type: 'input', formItemProps: { placeholder: 'alist密码', type: 'password' }, rule: [{ required: true, message: '请输入密码' }] },
  { label: '路径', prop: 'path', type: 'input', formItemProps: { placeholder: '选填,例如:/dav', type: 'text' }, rule: [{ required: true, message: '请输入路径' }] },
])



const confirmSubmit = () => {
  base_form.value.confirmCommit().then(async valid => {
    if (valid) {
      uni.setStorageSync('webdavInfo', state.formData)
      let pages = getCurrentPages()
      let prevPage = pages[pages.length - 2]
      if (prevPage.route == 'pages/video/index') {
        uni.setStorageSync('isreload', true)
      }
      uni.navigateBack()
    }
  })
}

onLoad((options) => {
  routerParams.value.title = options.title
  let title = ''
  title = routerParams.value.title
  if (title == '修改WebDAV') {
    state.formData = uni.getStorageSync('webdavInfo')
  }
})

  </script>
  
  <style lang="scss" scoped>
page {
  width: 100%;
  height: 100%;
}
.add-webdav-form {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: url("https://storage.7x24cc.com/storage-server/presigned/ss1/a6-online-fileupload/newMediaImage/4E2B141_427A_background_20241125161030786newMediaImage.png")
    center no-repeat;
  background-size: 100% 100%;
  box-sizing: border-box;
  &__container {
    padding: 0 24rpx;
    padding-top: 24rpx;
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: auto;
  }
  ::v-deep .nut-button {
    margin-top: 80rpx;
  }
}
</style>
  