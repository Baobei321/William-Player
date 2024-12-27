<template>
  <div class="wil-box">
    <div class="wil-box-top" v-if="props.title">
      <div class="title-box">
        <span class="title">{{ props.title.length > 17 ? props.title.slice(0, 17) + '...' : props.title }}</span>
      </div>
      <div :class="['tag',`${props.tagObj.tagTrans[props.data[props.tagObj.tagName]].class}`]"
        :style="{backgroundColor:props.tagObj.tagTrans[props.data[props.tagObj.tagName]].color||'transparent'}" v-if="tagObj && Object.keys(tagObj).length">
        {{ props.tagObj.tagTrans[props.data[props.tagObj.tagName]].label || props.data[props.tagObj.tagName] }}
      </div>
    </div>
    <div class="wil-box-center">
      <div class="wil-box-center__img" v-if="props.img">
        <img :src="props.img">
      </div>
      <div class="wil-box-center__container">
        <div class="wil-box-center-item" v-for="(item,index) in getData(props.data)" :key="index">
          <span class="name" :style="{minWidth:props.minWidth?props.minWidth*2+'rpx':''}">{{ item.name }}：</span>
          <span :class="['value']" :style="{color:item.color ? item.color : '#1a1a1a'}">{{ item.label|| '-' }}</span>
        </div>
        <div class="wil-box-center-item" v-if="$slots.center">
          <slot name="center" v-bind="props.data"></slot>
        </div>
      </div>
    </div>
    <div class="wil-box-bottom" v-if="$slots.bottom">
      <nut-divider style="color: #D8D8D8;" />
      <div class="wil-box-bottom-item">
        <slot name="bottom" v-bind="props.data"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watchEffect } from 'vue';


const props = defineProps({
  data: { type: Object, default: {} },//盒子数据
  title: { type: String, default: '' },//标题
  img: { type: String, default: '' },//图像链接
  imgMode: { type: String, default: 'scaleToFill' },//图片裁剪、缩放的模式
  objData: { type: Object, default: {} },  //字段名对应中文,例如'name': '姓名'
  textColor: { type: Object, default: {} },//文字对应颜色
  transData: { type: Object, default: {} },//需要转换的数据，例如"name": { "1": "红", "2": "橙",}
  tagObj: { type: Object, default: {} },//右侧标签状态对应颜色
  minWidth: { type: [String, Number], default: '' },//每一行字段名的最小宽度
})


const getData = (data) => {
  let keys = props.objData ? Object.keys(props.objData) : []
  let trans = props.transData ? Object.keys(props.transData) : []
  let color = props.textColor ? Object.keys(props.textColor) : []
  let arr = keys.map(item => {
    return color.indexOf(item) > -1 ?
      {
        name: props.objData[item],
        label: trans.indexOf(item) > -1 ? props.transData[item][data[item]] : data[item],
        color: props.textColor[item]
      } : {
        name: props.objData[item],
        label: trans.indexOf(item) > -1 ? props.transData[item][data[item]] : data[item],
      }
  })
  return arr
}

</script>

<style lang="scss" scoped>
.wil-box {
  background: #ffffff;
  border-radius: 8px;
  padding: 11px 0 11px 13px;
  margin-bottom: 12px;
  &-top {
    display: flex;
    justify-content: space-between;
    .title-box {
      display: flex;
      .title {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: bold;
        color: #343434;
      }
    }
    .tag {
      // position: absolute;
      // top: 0;
      // right: -12px;
      border-radius: 10px 0px 0px 10px;
      font-size: 11px;
      color: #ffffff;
      padding: 3px 6px 3px 9px;

      &.blue {
        background: #1492ff;
      }

      &.gray {
        background: #86909c;
      }

      &.green {
        background: #18cab8;
      }
      &.red {
        background: rgba(245, 63, 63, 1);
      }
    }
  }
  &-center {
    display: flex;
    align-items: center;
    padding-top: 7px;
    &__img {
      width: 80px;
      height: 80px;
      margin-right: 16px;
      img {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        object-fit: cover;
      }
    }
    &__container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      .wil-box-center-item {
        display: flex;
        flex-direction: row;
        // align-items: center;
        padding-top: 7px;
        overflow: hidden;
        &:first-child {
          padding-top: 0;
        }

        span {
          font-size: 13px;
          font-weight: 400;
        }

        .name {
          color: #86909c;
          // min-width: 75px;
        }

        .value {
          color: #1a1a1a;
          flex: 1;

          &.blue {
            color: #1492ff;
          }
        }
      }
    }
  }
  &-bottom {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding-top: 11px;
    padding-right: 12px;
    box-sizing: border-box;
    &-item {
      padding-top: 11px;
    }
    .nut-divider {
      // margin: 11px 0;
      // margin-top: 0;
      margin: 0;
    }
  }
}
</style>
