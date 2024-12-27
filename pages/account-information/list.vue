<template>
  <div class="account-information-list">
    <wil-navbar title="报账信息"></wil-navbar>
    <nut-searchbar v-model="searchValue" background="transparent" input-background="#fff" clearable placeholder="输入商品名搜索" @search="searchAccount">
      <template #leftin>
        <img :src="searchIcon">
      </template>
    </nut-searchbar>
    <div class="account-information-list-select">
      <div class="account-information-list-select-title">
        <div class="account-information-list-select-title__left">
          <div class="account-information-list-select-title__item" @click="toOpenPicker('platform')">
            <span>购买平台</span><img :src="deltaIcon">
          </div>
          <div class="account-information-list-select-title__item" @click="toOpenPicker('status')">
            <span>报账状态</span><img :src="deltaIcon">
          </div>
        </div>
      </div>
      <div class="account-information-list-select-content">
        <div class="account-information-list-select-content__item" v-if="requestParams.platform">
          <span>{{ requestParams.platform }}</span><img :src="closeGreen" @click="closeSelect('platform',item)">
        </div>
        <div class="account-information-list-select-content__item" v-if="requestParams.status">
          <span>{{ requestParams.status=='0'?'未报账':'已报账' }}</span><img :src="closeGreen" @click="closeSelect('status',item)">
        </div>
      </div>
    </div>
    <div class="account-information-list-list">
      <load-list :requestFn="getAccountList" :request-params="requestParams" ref="load_list" :changeItemFn="changeItemFn" v-show="!showSke" :is-use-custom="false" idKey="accountId">
        <template #default="item">
          <nut-swipe :name="String(item.accountId)" :ref="(el)=>setRef(el,item)">
            <wil-box :data="item" :title="item.tradeName" :obj-data="objData" :transData="transData" :tagObj="tagObj" :textColor="textColor" @click="toDetail(item)">
              <template #bottom>
                <div class="bottom">
                  <div class="bottom-left">
                    <span class="bottom-left-platform">{{item.platform}}</span><span class="cut-line"></span><span class="bottom-left-buyTime">{{item.buyTime}}</span>
                  </div>
                  <div class="bottom-right">
                    <img :src="trashIcon" @click.stop="deleteItem(item)">
                  </div>
                </div>
              </template>
            </wil-box>
            <template #right>
              <nut-button shape="square" style="height: 100%" @click="changeItem(item)" v-if="item.status=='0'" color="#18cab8">已报账</nut-button>
              <nut-button shape="square" style="height: 100%" @click="changeItem(item)" v-if="item.status=='1'" color="#f56c6c">未报账</nut-button>
              <nut-button shape="square" style="height: 100%" @click="editItem(item)" color="#498ff2">修改</nut-button>
            </template>
          </nut-swipe>
        </template>
      </load-list>
    </div>
    <div class="account-information-list-popup">
      <nut-popup v-model:visible="showPicker" position="bottom">
        <nut-picker :columns="pickerColumns" @confirm="confirmPicker" @cancel="showPicker=false" :title="pickerTitle"></nut-picker>
      </nut-popup>
    </div>
    <div class="account-information-list-addbutton" @click="toForm">
      <img :src="rocketIcon">
      <span>上传报账</span>
    </div>
  </div>
</template>

<script setup>
import searchIcon from '../../static/search-icon.png'
import deltaIcon from '../../static/delta-icon.png'
import trashIcon from '../../static/trash-icon.png'
import closeGreen from '../../static/close-green.png'
import rocketIcon from '../../static/rocket-icon.png'
import loadList from '../../components/wil-list/index.vue'
import wilBox from '../../components/wil-box/index.vue'
import { useDict } from '../../utils/useDict';
import { ref, nextTick } from 'vue'
import { getAccountList, updateAccount, deleteAccount, getAccountDetail } from '../../network/apis'
import * as CONFIG from '../../utils/config'
import wilNavbar from '../../components/wil-navbar/index.vue'
import { onShow } from '@dcloudio/uni-app';

const { getDict } = useDict()
const platformArr = ref([])
getDict('sys_buy_platform').then(res => {
  platformArr.value = res.sys_buy_platform.map(item => {
    return { value: item.value, text: item.label }
  })
})



const searchValue = ref('')
const pickerColumns = ref([])
const requestParams = ref({
  createBy: uni.getStorageSync(CONFIG.USER_KEY).userName
})
const load_list = ref(null)
const nutSwipeRefs = ref({})

const showSke = ref(false)
const pickerProp = ref('')
const pickerTitle = ref('')

const showPicker = ref(false)

const changeItemFn = ref(null)

const editId = ref('')


//批量设置nut-swipe的ref
const setRef = (el, item) => {
  if (el) {
    nutSwipeRefs.value[item.accountId] = el
  }
}

const objData = ref({
  createBy: '创建人',
  money: '购买金额',
})

const transData = ref({})

const tagObj = ref({
  tagName: 'status',
  tagTrans: {
    '0': {
      label: '未报账',
      color: '#f56c6c'
    },
    '1': {
      label: '已报账',
      color: '#18cab8'
    },
  }
})

const textColor = ref({
  money: '#fa2c19'
})

const searchAccount = (val) => {
  if (val != requestParams.value.tradeName) {
    // showSke.value = true
  }
  requestParams.value.tradeName = val
}

const toOpenPicker = (type) => {
  pickerProp.value = type
  showPicker.value = true
  if (type == 'platform') {
    pickerTitle.value = '购买平台'
    pickerColumns.value = platformArr.value
  } else if (type == 'status') {
    pickerTitle.value = '报账状态'
    pickerColumns.value = [{ value: '0', text: '未报账' }, { value: '1', text: '已报账' }]
  }
}

const closeSelect = (type) => {
  requestParams.value[type] = ''
}

const confirmPicker = ({ selectedValue, selectedOptions }) => {
  requestParams.value[pickerProp.value] = selectedOptions[0].value
  showPicker.value = false
}

const changeItem = async (item) => {
  if (item.status == '0') {
    await updateAccount({ accountId: item.accountId, status: '1' })
  } else if (item.status == '1') {
    await updateAccount({ accountId: item.accountId, status: '0' })
  }
  changeItemFn.value = changeListItem
  nextTick(() => {
    load_list.value.handleEdit(item.accountId)
  })
  nutSwipeRefs.value[item.accountId].close()
}

const editItem = (item) => {
  uni.navigateTo({
    url: `/account-information/form?accountId=${item.accountId}&title=报账修改`
  })
  editId.value = item.accountId
  nutSwipeRefs.value[item.accountId].close()
}

const changeListItem = (item) => {
  item.status == '0' ? item.status = '1' : item.status = '0'
}

const changeItemAll = async (item) => {
  let res = await getAccountDetail({ accountId: item.accountId })
  Object.keys(item).forEach(v => {
    item[v] = res.data[v]
  })
}

const deleteItem = (item) => {
  uni.showModal({
    title: '温馨提示',
    content: '是否确认删除该报账？',
    confirmColor: '#00B2A0',
    success: async function (res) {
      if (res.confirm) {
        await deleteAccount({ accountId: item.accountId })
        load_list.value.handleDelete(item.accountId)
      } else if (res.cancel) {
        // console.log('用户点击取消')
      }
    }
  })
}

const toDetail = (item) => {
  uni.navigateTo({
    url: '/account-information/detail?accountId=' + item.accountId,
  })
}

const toForm = () => {
  uni.navigateTo({
    url: `/account-information/form?title=报账上传`
  })
}

onShow(() => {
  let pages = getCurrentPages();
  let currentPage = pages[pages.length - 1]; // 获取当前页面
  // let isAdd = currentPage.data.isAdd
  // let isEdit = currentPage.data.isEdit
  // if (isAdd) {
  //   currentPage.data.isAdd = null
  //   load_list.value.handleAdd(isAdd)
  // }
  // if (isEdit) {
  //   currentPage.data.isEdit = null
  //   changeItemFn.value = changeItemAll
  //   nextTick(() => {
  //     load_list.value.handleEdit(editId.value)
  //   })
  // }
})

</script>

<style lang="scss" scoped>
page {
  width: 100%;
  height: 100%;
}
.account-information-list {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: url("https://storage.7x24cc.com/storage-server/presigned/ss1/a6-online-fileupload/newMediaImage/4E2B141_427A_background_20241125161030786newMediaImage.png")
    center no-repeat;
  background-size: 100% 100%;
  box-sizing: border-box;
  ::v-deep .nut-searchbar {
    padding-left: 0;
    padding-right: 0;
    margin: 0 12px;
    box-sizing: border-box;
    width: auto;
    .nut-searchbar__search-input {
      height: 42px;
      border-radius: 30px;
      .nut-searchbar__search-icon {
        width: 18px;
        height: 18px;
        img {
          width: 18px;
          height: 18px;
        }
      }
    }
  }
  &-select {
    padding: 7px 12px 12px 12px;
    &-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      &__left {
        display: flex;
        align-items: center;
        .account-information-list-select-title__item {
          display: flex;
          align-items: center;
          margin-left: 18px;
          span {
            font-size: 14px;
            color: #353a45;
          }
          img {
            width: 10px;
            height: 7px;
            margin-left: 4px;
          }
          &:first-child {
            margin-left: 0;
          }
        }
      }
      &__right {
        display: flex;
        align-items: center;
        img {
          width: 16px;
          height: 16px;
        }
        span {
          font-size: 15px;
          color: #353a45;
          padding-left: 4px;
        }
      }

      .account-information-list-select-title__item-light {
        span {
          color: #2fada1;
        }
      }
    }
    &-content {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      padding-top: 6px;
      &__item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-radius: 20px;
        border: 1px solid #2fada1;
        padding: 6px 8px 6px 12px;
        margin-right: 10px;
        margin-top: 10px;
        span {
          display: inline;
          font-size: 13px;
          color: #2fada1;
        }
        img {
          width: 16px;
          height: 16px;
        }
      }
    }
  }
  &-list {
    flex: 1;
    overflow: hidden;
    padding: 0 12px;
    ::v-deep .load-list {
      .list-item {
        border-radius: 8px;
        background: #fff;
        overflow: hidden;
        margin-bottom: 12px;

        .wil-box {
          background: transparent;
          border-radius: 0;
          margin-bottom: 0;
        }
      }
    }
    .bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-right: 8px;
      &-left {
        display: flex;
        align-items: center;
        &-platform {
          font-size: 14px;
          color: #86909c;
        }
        .cut-line {
          width: 0.5px;
          height: 13px;
          background: #86909c;
          margin: 0 10px;
        }
        &-buyTime {
          font-size: 14px;
          color: #86909c;
        }
      }
      &-right {
        img {
          width: 24px;
          height: 24px;
        }
      }
    }
  }
  &-popup {
    ::v-deep .nut-popup {
      .nut-picker {
        .nut-picker__bar {
          .nut-picker__title {
            font-weight: bold;
            font-size: 14px;
            color: #353a45;
          }
          .nut-picker__right {
            color: #18cab8;
          }
        }
      }
    }
  }
  &-addbutton {
    position: fixed;
    width: 68px;
    height: 68px;
    background: #18cab8;
    right: 12px;
    bottom: 74px;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    img {
      width: 32px;
      height: 32px;
    }
    span {
      font-size: 12px;
      color: #ffffff;
    }
  }
}
</style>
