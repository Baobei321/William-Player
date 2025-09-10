<template>
    <div class="steps-form" :style="{ '--step-color': props.stepColor }">
        <nut-form :model-value="formData" ref="formRef" :rules="rules">
            <nut-steps direction="vertical" :current="props.options.length + 1">
                <nut-step :title="item.label" v-for="(item, index) in props.options" :key="item.prop">
                    {{ index + 1 }}
                    <template #content>
                        <nut-form-item :prop="item.prop">
                            <input :value="formData[item.prop]" v-bind="item.formItemProps" v-if="item.type == 'input'"
                                @blur="customBlurValidate(item.prop)" @input="(val) => changeInput(val, item.prop)"
                                @click="clickInput(item)" :border="false" />
                            <nut-textarea v-model="formData[item.prop]" v-bind="item.formItemProps"
                                v-if="item.type == 'textarea'" :disableDefaultPadding="true"
                                @blur="customBlurValidate(item.prop)" @change="change" />
                            <!-- 选择器 -->
                            <div class="item-select" @click="(event) => clickSelect(event, item)"
                                v-if="item.type == 'select'">
                                <div
                                    :class="['item-select-value', !mappingData[item.prop] ? 'item-select-placeholder' : '']">
                                    {{ mappingData[item.prop] || item.formItemProps.placeholder }}
                                </div>
                                <image src="@/static/dao-sanjiao.png" class="item-select-icon"></image>
                            </div>
                            <!-- radio单选按钮 -->
                            <nut-radio-group v-model="mappingData[item.prop]" direction="horizontal"
                                v-if="item.type == 'radio'">
                                <nut-radio :label="vitem.value" v-for="vitem in item.columns">{{ vitem.label
                                }}</nut-radio>
                            </nut-radio-group>
                            <slot :name="item.prop" v-if="$slots[item.prop] && !item.type"
                                v-bind="{ ...item.formItemProps, customBlurValidate }"
                                @blur="customBlurValidate(item.prop)">
                            </slot>
                        </nut-form-item>
                    </template>
                </nut-step>
            </nut-steps>
        </nut-form>
        <!-- 用于显示select的popover -->
        <select-popover v-model:visible="showPopover" :options="popoverOptions" :position="popoverPosition"
            @close="closePopover">
        </select-popover>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import selectPopover from '@/pages/mobile/media/components/popover.vue'

const props = defineProps({
    options: { type: Array, default: [] },
    modelValue: { type: Object, default: {} },
    stepColor: { type: String, default: '#bcc7db' },
})

const emits = defineEmits(["submit", "update:modelValue", "changePicker", "clickInput", "blur"]);

const formData = ref({});
const formRef = ref(null)
const mappingData = ref({}) //用于存储那些需要映射的数据，包括select，radio这些，选中的值是id，展示需要中文

const showPopover = ref(false) //点击select的时候，弹窗选择的popover
const popoverOptions = ref([]) //配置popover的列
const popoverPosition = ref({}) //popover的弹出位置
const selectItem = ref({}) //当前点击选中的select

const change = (val) => {
    emits("update:modelValue", JSON.parse(JSON.stringify(formData.value)));
};

const changeInput = (val, prop) => {
    formData.value[prop] = val.detail.value;
    change(val.detail.value);
};
const clickInput = (item) => {
    emits("clickInput", item);
};

//点击选择的输入框，弹出popover
const clickSelect = (event, item) => {
    popoverPosition.value.clientX = event.clientX || event.touches[0].clientX
    popoverPosition.value.clientY = event.clientY - 44 || event.touches[0].clientY
    popoverOptions.value = item.columns
    showPopover.value = true
    selectItem.value = item
}

//关闭select的popover，需要进行校验
const closePopover = () => {
    customBlurValidate(selectItem.value.prop)
}

//失去焦点校验
const customBlurValidate = (prop) => {
    formRef.value?.validate(prop).then(({ valid, errors }) => {
        if (valid) {
            emits("blur", prop);
        } else {
            console.warn("error:", errors, "更新焦点");
        }
    });
};

//计算每一项的rules校验规则
const rules = computed(() => {
    let rules1 = {};
    props.options.forEach((item) => {
        rules1[item.prop] = item.rule;
    });
    return rules1;
});

watch(
    () => props.modelValue,
    (val, oldVal) => {
        Object.keys(formData.value).forEach((v) => {
            delete formData.value[v];
        });
        Object.keys(val).forEach((v) => {
            formData.value[v] = val[v];
            let obj = props.options.find(i => i.prop == v) //查找到当前prop相等的options中的某一项
            if (obj?.type == 'select') { //如果显示的中文跟value不是一个值，就像el-select的label，value，那么就将label值存在mappingData中
                mappingData.value[v] = obj.columns.find(i => i.value == val[v])?.label || val[v]
            } else if (obj?.type == 'radio') {//如果显示的中文跟value不是一个值，就像el-select的label，value，那么就将label值存在mappingData中
                mappingData.value[v] = obj.columns.find(i => i.value == val[v])?.label || val[v]
            }
        });
    },
    { deep: true, immediate: true }
);
</script>

<style lang="scss" scoped>
.steps-form {
    :deep(.nut-form) {
        .nut-cell-group {
            .nut-cell-group__wrap {
                background-color: transparent;
                box-shadow: none;

                .nut-steps {
                    .nut-step {
                        .nut-step-main {
                            flex: 1;
                            padding-left: 24rpx;

                            .nut-step-content {
                                .nut-form-item {
                                    background: transparent;
                                    box-shadow: none;

                                    .nut-form-item__body {
                                        .nut-form-item__body__slots {
                                            input {
                                                caret-color: #315ffd;
                                                height: 45rpx;
                                                line-height: 45rpx;
                                                min-height: 45rpx;
                                            }

                                            .item-select {
                                                display: flex;
                                                align-items: center;
                                                justify-content: space-between;

                                                .item-select-value {
                                                    flex: 1;
                                                    height: 45rpx;
                                                    line-height: 45rpx;
                                                    min-height: 45rpx;
                                                    font-size: 16px;
                                                }

                                                .item-select-placeholder {
                                                    color: gray;
                                                }

                                                .item-select-icon {
                                                    width: 30rpx;
                                                    height: 30rpx;
                                                }
                                            }
                                            .nut-radio-group {
                                                .nut-radio{
                                                    .nut-radio__icon{
                                                        color: #a0c3f6;
                                                    }
                                                    .nut-radio__label{
                                                        color: #fff;
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    &::after {
                                        display: block;
                                        border-bottom: 1px solid #f5f6f7 !important;
                                    }
                                }

                                .nut-form-item.error {
                                    &::before {
                                        border-bottom: 1px solid #fa2c19;
                                    }

                                    &::after {
                                        display: none;
                                    }
                                }
                            }
                        }
                    }

                    .nut-step-finish {
                        .nut-step-head {
                            color: var(--step-color);
                            border-color: var(--step-color);

                            .nut-step-line {
                                background: var(--step-color);
                            }

                            .nut-step-icon {
                                background: var(--step-color);

                                .nut-step-icon-inner {
                                    .nut-step-inner {
                                        color: #000;
                                    }
                                }
                            }
                        }

                        .nut-step-main {
                            .nut-step-title {
                                color: var(--step-color);
                            }
                        }
                    }

                    .nut-step-process {
                        .nut-step-head {
                            border-color: var(--step-color);

                            .nut-step-icon {
                                background: var(--step-color);

                                .nut-step-icon-inner {
                                    .nut-step-inner {
                                        color: #000;
                                    }
                                }

                                &::before {
                                    background: var(--step-color);
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
