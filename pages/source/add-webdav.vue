<template>
  <div class="add-webdav-form">
    <wil-navbar :title="title"></wil-navbar>
    <div class="add-webdav-form__container">
      <wil-form v-model="state.formData" :options="options" ref="base_form">
        <template #protocol>
          <nut-cell :title="protoColumns.find(i=>i.value==state.formData.protocol)?.text" is-link @click="openPopup"></nut-cell>
        </template>
      </wil-form>
      <nut-button custom-color="#ff6701" @click="confirmSubmit">确认{{ title=='添加WebDAV'?'添加':'修改' }}</nut-button>
      <!-- <loginPopup v-model:visible="showLoginPopup" @loginSuccess="loginSuccess"></loginPopup> -->
      <nut-popup v-model:visible="showProtocol" position="bottom" safe-area-inset-bottom round>
        <nut-picker v-model="protoValue" :columns="protoColumns" title="选择协议" @confirm="confirmPicker" @cancel="showProtocol = false">
        </nut-picker>
      </nut-popup>
    </div>
  </div>
</template>
  
  <script setup>
import { onBeforeMount, reactive, ref } from "vue";
import wilForm from "../../components/wil-form/index.vue";
import wilNavbar from "../../components/wil-navbar/index.vue";
import { onLoad } from "@dcloudio/uni-app";
import { loginUser } from "../../utils/common";

const state = reactive({
  formData: {
    protocol: "http",
  },
  oldData: {},
});

const base_form = ref(null);
// const showLoginPopup = ref(false)

const routerParams = ref({});

const title = ref("");

const options = ref([
  { label: "名称", prop: "name", type: "input", formItemProps: { placeholder: "请输入", type: "text" }, rule: [{ required: true, message: "请输入名称" }] },
  { label: "协议", prop: "protocol", formItemProps: { placeholder: "请输入", type: "text" }, rule: [{ required: true, message: "请选择协议" }] },

  { label: "地址", prop: "address", type: "input", formItemProps: { placeholder: "例如:127.0.0.1", type: "text" }, rule: [{ required: true, message: "请输入地址" }] },
  { label: "端口", prop: "port", type: "input", formItemProps: { placeholder: "选填,例如:5244", type: "number" }, rule: [{ required: true, message: "请输入端口" }] },
  {
    label: "用户名",
    prop: "username",
    type: "input",
    formItemProps: { placeholder: "alist用户名,例如:admin", type: "text" },
    rule: [{ required: true, message: "请输入用户名" }],
  },
  { label: "密码", prop: "password", type: "input", formItemProps: { placeholder: "alist密码", type: "password" }, rule: [{ required: true, message: "请输入密码" }] },
  // { label: "路径", prop: "path", type: "input", formItemProps: { placeholder: "选填,例如:/dav", type: "text" }, rule: [{ required: true, message: "请输入路径" }] },
]);

const showProtocol = ref(false);
const protoValue = ref(["HTTP"]);
const protoColumns = ref([
  { text: "HTTP", value: "http" },
  { text: "HTTPS", value: "https" },
]);

const confirmSubmit = () => {
  base_form.value.confirmCommit().then(async (valid) => {
    if (valid) {
      let sourceList = uni.getStorageSync("sourceList");
      if (title.value == "添加WebDAV") {
        if (sourceList.find((i) => i.type == "WebDAV").list.find((i) => i.address == state.formData.address)) {
          uni.showToast({
            title: "存在重复的WebDAV地址，请修改",
            icon: "none",
          });
          return;
        }
        if (sourceList.find((i) => i.type == "WebDAV").list.find((i) => i.name == state.formData.name)) {
          uni.showToast({
            title: "存在同名的WebDAV，请修改",
            icon: "none",
          });
          return;
        }
        await loginUser(state.formData)
          .then((res) => {
            let isHaveData = !sourceList.every((item) => {
              return !item.list.length;
            });
            if (!isHaveData) {
              sourceList.find((i) => i.type == "WebDAV").list.push({ ...state.formData, token: res.data.token, active: true });
              uni.setStorageSync("isreload", true);
            } else {
              sourceList.find((i) => i.type == "WebDAV").list.push({ ...state.formData, token: res.data.token });
            }
            uni.setStorageSync("sourceList", sourceList);
            uni.navigateBack({
              delta: 2,
            });
          })
          .catch(() => {
            uni.showToast({
              title: "权限校验失败，请检查",
              icon: "none",
            });
          });
      } else if (title.value == "修改WebDAV") {
        if (sourceList.find((i) => i.type == "WebDAV").list.find((i) => i.address == state.formData.address) && state.oldData.address != state.formData.address) {
          uni.showToast({
            title: "存在重复的WebDAV地址，请修改",
            icon: "none",
          });
          return;
        }
        if (sourceList.find((i) => i.type == "WebDAV").list.find((i) => i.name == state.formData.name) && state.oldData.name != state.formData.name) {
          uni.showToast({
            title: "存在同名的WebDAV，请修改",
            icon: "none",
          });
          return;
        }
        await loginUser(state.formData)
          .then((res) => {
            state.formData.token = res.data.token;
            let obj = sourceList.find((i) => i.type == "WebDAV").list.find((i) => i.address == routerParams.value.address);
            Object.keys(state.formData).forEach((v) => {
              obj[v] = state.formData[v];
            });
            uni.setStorageSync("sourceList", sourceList);
            if (routerParams.value.isActive == "1") {
              uni.setStorageSync("isreload", true);
              uni.navigateBack({
                delta: 2,
              });
              return;
            }
            uni.navigateBack();
          })
          .catch(() => {
            uni.showToast({
              title: "权限校验失败，请检查",
              icon: "none",
            });
          });
      }
    }
  });
};

const openPopup = () => {
  showProtocol.value = true;
};
const confirmPicker = ({ selectedValue, selectedOptions }) => {
  console.log(selectedOptions);
  state.formData.protocol = selectedValue[0];
  showProtocol.value = false;
};

onLoad((options) => {
  routerParams.value = options;
  title.value = decodeURIComponent(routerParams.value.title);
  if (title.value == "修改WebDAV") {
    let sourceList = uni.getStorageSync("sourceList");
    state.formData = sourceList.find((i) => i.type == "WebDAV").list.find((i) => i.address == routerParams.value.address);
    state.formData.protocol ? "" : (state.formData.protocol = "http");
    state.oldData = JSON.parse(JSON.stringify(state.formData));
  }
});
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
  // background: url("https://storage.7x24cc.com/storage-server/presigned/ss1/a6-online-fileupload/newMediaImage/4844737_427A_bg_20250211152611234newMediaImage.png")
  //   center no-repeat;
  background: linear-gradient(180deg, #ffd3b1 0%, #fff5ec 30%, #f6f7f8 70%);
  background-size: 100% 100%;
  box-sizing: border-box;
  &__container {
    padding: 0 24rpx;
    padding-top: 24rpx;
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: auto;
    ::v-deep .base-form {
      .nut-form {
        .nut-cell-group {
          &__wrap {
            .nut-form-item {
              &__body {
                &__slots {
                  .nut-cell {
                    margin: 0;
                    padding: 0;
                    height: 100%;
                    box-shadow: none;
                    color: #353a45;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  ::v-deep .nut-button {
    margin-top: 80rpx;
  }
}
</style>
  