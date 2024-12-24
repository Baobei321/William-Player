<template>
  <div class="base-form">
    <div class="base-form-title" v-if="props.title">
      <div class="base-form-title__left">{{ props.title }}</div>
      <div class="base-form-title__right">
        <slot name="status" v-if="$slots.status"></slot>
        <div class="base-form-title__right-status" v-if="!$slots.status && props.status">{{ props.status }}</div>
      </div>
    </div>
    <div class="base-form-content" :style="{paddingTop:props.title?'':'0'}">
      <nut-form :model-value="formData" :labelPosition="labelPosition" ref="formRef" :rules="rules">
        <nut-form-item :label="item.label" v-for="item in props.options" :key="item.prop" :prop="item.prop">
          <nut-input v-model="formData[item.prop]" v-bind="item.formItemProps" v-if="item.type=='input'" @blur="customBlurValidate(item.prop)" @update:modelValue="change"
            @click="clickInput(item)" :border="false"/>
          <nut-textarea v-model="formData[item.prop]" v-bind="item.formItemProps" v-if="item.type=='textarea'" :disableDefaultPadding="true" @blur="customBlurValidate(item.prop)"
            @change="change" />
          <slot :name="item.prop" v-if="$slots[item.prop]&&!item.type" v-bind="{...item.formItemProps,customBlurValidate}" @blur="customBlurValidate(item.prop)"></slot>
        </nut-form-item>
        <slot name="item" v-if="$slots.item"></slot>
      </nut-form>
    </div>
    <div class="base-form-bottom" v-if="showButton">
      <nut-button custom-color="#18CAB8" v-if="!$slots.bottom" @click="confirmCommit">{{ props.buttonText }}</nut-button>
      <slot name="bottom" v-if="$slots.bottom"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  status: { type: String, default: '' },
  options: { type: Array, default: [] },
  labelPosition: { type: String, default: 'left' },
  showButton: { type: Boolean, default: false },
  modelValue: { type: Object, default: {} },
  buttonText: { type: String, default: '确认并发布' },
})

const formRef = ref(null)


const formData = ref({})

const emits = defineEmits(['submit', 'update:modelValue', 'changePicker', 'clickInput', 'blur'])

const change = (val) => {
  emits('update:modelValue', JSON.parse(JSON.stringify(formData.value)))
}

//失去焦点校验
const customBlurValidate = (prop) => {
  formRef.value?.validate(prop).then(({ valid, errors }) => {
    if (valid) {
      emits('blur', prop)
    } else {
      console.warn('error:', errors, "更新焦点");
    }
  });
}

const clickInput = (item) => {
  emits('clickInput', item)
}

//确认并发布按钮
const confirmCommit = () => {
  return formRef.value?.validate().then(({ valid, errors }) => {
    if (valid) {
      // console.log('success:', valid);
      emits('submit')
      return valid
    } else {
      // console.warn('error:', errors);
      // return errors
    }
  })
}


const rules = computed(() => {
  let rules1 = {}
  props.options.forEach(item => {
    rules1[item.prop] = item.rule
  })
  return rules1
})
defineExpose({
  confirmCommit
})

watch(
  () => props.modelValue,
  (val, oldVal) => {
    Object.keys(formData.value).forEach(v => {
      delete formData.value[v]
    })
    Object.keys(val).forEach(v => {
      formData.value[v] = val[v]
    })
  }, { deep: true, immediate: true }
)

</script>

<style lang="scss" scoped>
.base-form {
  width: 100%;
  background-color: #fff;
  border-radius: 8px;
  padding: 11px 13px;
  box-sizing: border-box;
  &-title {
    background-color: #fff;
    border-radius: 8px 8px 0 0;
    padding-bottom: 11px;
    border-bottom: 1px solid #d8d8d8;
    display: flex;
    justify-content: space-between;
    align-items: center;
    &__left {
      font-weight: bold;
      font-size: 15px;
      color: #343434;
    }
    &__right {
      &-status {
        padding: 4px 13px;
        // box-sizing: border-box;
        display: inline-block;
        border-radius: 4px;
        background: rgba(24, 202, 184, 0.1);
        color: #18cab8;
        font-size: 13px;
      }
    }
  }
  &-content {
    box-sizing: border-box;
    padding-top: 11px;
    ::v-deep .nut-form {
      .nut-cell-group {
        &__wrap {
          border-radius: 0;
          box-shadow: none;
          margin-top: 0;
          .nut-form-item {
            // padding-bottom: 0;
            padding-left: 0;
            padding-right: 0;
            box-shadow: none;
            margin: 0;
            &:first-child {
              padding-top: 0;
            }
            &__label {
              min-width: 70px;
              width: auto;
              font-size: 14px;
              color: #353a45;
              margin-right: 0;
              // display: inline-flex !important;
              // justify-content: center;
              // display: flex !important;
              // flex-direction: row;
              // align-items: center;
            }
            &__body {
              &__slots {
                // padding-top: 1px;
                .nut-textarea {
                  // padding-top: 2px !important;
                  // box-sizing: border-box;
                  &__textarea {
                    color: #353a45;
                    font-size: 14px;
                    height: 128px;
                  }
                  .textarea-placeholder {
                    font-size: 14px;
                    color: #86909c;
                  }
                }
                .item-picker {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                }
                .nut-rate {
                  &-item {
                    margin-right: 4px;
                    .nut-icon::before {
                      position: relative;
                      top: auto;
                      left: auto;
                      -webkit-transform: none;
                      transform: none;
                    }
                  }
                }
              }
              input {
                display: inline;
                height: auto;
                font-size: 14px;
                text-align: left;
                color: #353a45;
                width: 100%;
                outline: 0 none;
                border: 0;
                text-decoration: none;
                background: transparent;
                padding: 0;
                margin: 0;
                min-height: 0;
              }
            }
          }
          .nut-form-item.error.line::before {
            left: 0;
            right: 0;
            z-index: 2;
            // border-bottom: 1px solid #fa2c19;
          }
          .nut-form-item.nut-cell::after {
            left: 0;
            right: 0;
            border-bottom: 1px solid #f5f6f7;
            z-index: 1;
          }
        }
      }
    }
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
  &-bottom {
    width: 100%;
    margin-top: 106px;
    padding-bottom: 30px;
    .nut-button {
      width: 100%;
      height: 40px;
      border-radius: 20px;
    }
  }
}
</style>
