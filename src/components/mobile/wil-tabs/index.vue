<template>
    <div class="wil-tabs">
        <div :class="['wil-tabs-item', activeTab == item.title ? 'wil-tabs-active' : '', props.fixedWidth ? 'wil-tabs-fixed' : '']"
            v-for="item in props.tabsList" @click="changeTab(item)">
            {{ item.title }}
        </div>
        <div class="wil-tabs-line"
            :style="{ transform: `translateX(${lineLeft}px)`, width: props.fixedWidth ? '80rpx' : lineWidth + 'px', background: props.lineColor }">
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';

const props = defineProps({
    tabsList: { type: Array, default: [] },
    lineColor: { type: String, default: '#ff6701' },
    fixedWidth: { type: Boolean, default: true },
    modelValue: { type: String, default: '' }
})

const emits = defineEmits(['changeTab', 'update:modelValue'])

const activeTab = ref(props.tabsList[0].title)
const tabWidth = ref([])
const lineLeft = ref(0)
const lineWidth = ref(0)

//获取每个tab-item的宽度，设置tab-line的宽度
const getItemWidth = () => {
    const query = uni.createSelectorQuery();
    query.selectAll(".wil-tabs-item")
        .boundingClientRect((res) => {
            if (!res) {
                return;
            }
            const scale = uni.upx2px(100) / 100; // 获取1rpx对应的px比例
            if (props.fixedWidth) {
                lineLeft.value = res[0].left + res[0].width / 2 - 40 * scale
            } else {
                lineLeft.value = res[0].left
            }
            lineWidth.value = res[0].width
            tabWidth.value = res
        }
        ).exec();
}

//切换tab
const changeTab = (item) => {
    if (activeTab.value == item.title) return
    activeTab.value = item.title
    let index = props.tabsList.findIndex(i => i.title == activeTab.value)
    lineWidth.value = tabWidth.value[index].width
    const scale = uni.upx2px(100) / 100; // 获取1rpx对应的px比例
    if (props.fixedWidth) {
        lineLeft.value = tabWidth.value[index].left + tabWidth.value[index].width / 2 - 40 * scale
    } else {
        lineLeft.value = tabWidth.value[index].left
    }
    emits('changeTab', activeTab.value)
    emits('update:modelValue', activeTab.value)
}

watch(
    () => props.modelValue,
    (val) => {
        activeTab.value = val
    }, { immediate: true }
)

onMounted(() => {
    getItemWidth()
})
</script>

<style lang="scss" scoped>
.wil-tabs {
    display: flex;
    align-items: center;
    justify-content: space-around;
    position: relative;
    width: 100%;
    padding-bottom: 8rpx;

    .wil-tabs-item {
        padding: 24rpx;
        color: #646566;
    }

    .wil-tabs-active {
        color: #1a1a1a;
        font-weight: bold;
    }

    .wil-tabs-fixed {
        flex: 1;
        display: flex;
        justify-content: center;
    }

    .wil-tabs-line {
        position: absolute;
        transition: transform 0.3s ease, width 0.3s ease;
        height: 6rpx;
        border-radius: 6rpx;
        bottom: 8rpx;
        left: 0;
    }
}
</style>
