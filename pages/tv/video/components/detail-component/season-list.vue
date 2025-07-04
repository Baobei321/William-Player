<template>
    <div class="season-list">
        <tv-scroll :scroll-y="true" style="width: 100%;height: 100%;" :enhanced="true" :showScrollbar="false"
            :scrollIntoView="scrollIntoView">
            <div class="season-list-item" v-for="(item, index) in props.list" :key="item.season"
                :class="[tabIndex === index ? 'season-list-active' : '']" :id="'name' + (index + 1)">
                <image src="@/static/season-black.png" v-if="tabIndex === index"></image>
                <image src="@/static/season-gray.png" v-else></image>
                <span>{{ item.name }}</span>
            </div>
        </tv-scroll>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import tvScroll from "@/components/tv/tv-scroll/index.vue";
import { debounce } from "@/utils/scrape";

const props = defineProps({
    list: { type: Array, default: [] }
})

const tabIndex = ref(0)
const scrollIntoView = ref("");

const emits = defineEmits(['backLeft', 'openPopup'])
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
        emits('openPopup', true)
    }
    let time = Date.now();
    if (time - nowTime > 300) {
        if (tabIndex.value >= 6) {
            scrollIntoView.value = "name" + (tabIndex.value - 4);
        } else {
            scrollIntoView.value = "name1";
        }
    } else {
        setScrollIntoView();
    }
    nowTime = time;
};

const setScrollIntoView = debounce(() => {
    if (tabIndex.value >= 6) {
        scrollIntoView.value = "name" + (tabIndex.value - 4);
    } else {
        scrollIntoView.value = "name1";
    }
}, 300);
defineExpose({
    evtMove
})
</script>

<style lang="scss" scoped>
.season-list {
    width: 100%;
    height: 100%;

    .season-list-item {
        display: flex;
        align-items: center;
        background: transparent;
        padding: 30rpx 40rpx;
        border-radius: 16rpx;

        image {
            width: 80rpx;
            height: 80rpx;
        }

        span {
            font-size: 32rpx;
            color: #c5c6d0;
            padding-left: 30rpx;
            font-weight: bold;
        }
    }

    .season-list-active {
        background: #e5e6ec;

        span {
            color: #000015;
        }
    }
}
</style>
