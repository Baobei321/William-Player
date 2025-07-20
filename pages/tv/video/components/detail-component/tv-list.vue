<template>
    <div class="tv-list">
        <tv-scroll :scroll-y="true" style="width: 100%;height: 100%;" :enhanced="true" :showScrollbar="false"
            :scrollIntoView="scrollIntoView">
            <div :class="['tv-list-item', tabIndex === index ? 'tv-list-active' : '']"
                v-for="(item, index) in props.list" :key="item.id" :id="'name' + (index + 1)"
                @click="toPlay(item, index)">
                <image :src="item.poster" mode="aspectFill"></image>
                <div class="item-right">
                    <div class="item-right-name">
                        {{ item.title ? `第${index + 1}集 ${item.title}` : `第${index + 1}集` }}
                    </div>
                    <div class="item-right-overview">{{ item.overview }}</div>
                </div>
            </div>
        </tv-scroll>
    </div>
</template>

<script setup>
import tvScroll from "@/components/tv/tv-scroll/index.vue";
import { ref } from 'vue'
import { debounce } from "@/utils/scrape";

const props = defineProps({
    list: { type: Array, default: [] }
})

const tabIndex = ref(0)
const scrollIntoView = ref("");

const emits = defineEmits(['backLeft', 'openPopup', 'toPlay'])
let nowTime = 0
const evtMove = (keyCode) => {
    if (keyCode === "KeyUp") {
        if (tabIndex.value > 0) {
            tabIndex.value--
        }
    } else if (keyCode === "KeyDown") {
        if (tabIndex.value < props.list.length - 1) {
            tabIndex.value++
        }
    } else if (keyCode === "KeyLeft") {
        emits('backLeft')
    } else if (keyCode === 'KeyEnter') {
        let item = props.list[tabIndex.value]
        toPlay(item, tabIndex.value)
    }
    let time = Date.now();
    if (time - nowTime > 300) {
        if (tabIndex.value >= 2) {
            scrollIntoView.value = "name" + (tabIndex.value);
        } else {
            scrollIntoView.value = "name1";
        }
    } else {
        setScrollIntoView();
    }
    nowTime = time;
};

const toPlay = (item, index) => {
    emits("toPlay", item, index)
}

const setScrollIntoView = debounce(() => {
    if (tabIndex.value >= 2) {
        scrollIntoView.value = "name" + (tabIndex.value);
    } else {
        scrollIntoView.value = "name1";
    }
}, 300);
defineExpose({
    evtMove
})
</script>

<style lang="scss" scoped>
.tv-list {
    width: 100%;
    height: 100%;

    .tv-list-item {
        display: flex;
        align-items: flex-start;
        background: transparent;
        padding: 30rpx 40rpx;
        border-radius: 16rpx;

        image {
            flex: 0 0 400rpx;
            height: 220rpx;
            border-radius: 20rpx;
            box-sizing: border-box;
            border: 6rpx solid transparent;
        }

        .item-right {
            padding-left: 20rpx;
            padding-top: 6rpx;

            .item-right-name {
                font-size: 36rpx;
                font-weight: bold;
                color: #fff;
            }

            .item-right-overview {
                display: -webkit-box;
                -webkit-line-clamp: 3;
                /* 限制显示的行数 */
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
                font-size: 28rpx;
                color: #fff;
                padding-top: 20rpx;
            }
        }
    }

    .tv-list-active {
        image {
            border: 6rpx solid #ff6701;

        }
    }
}
</style>
