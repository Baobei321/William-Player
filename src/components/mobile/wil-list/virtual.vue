<template>
    <div class="wil-virtual-list">
        <nut-list :height="50" :listData="list" @scroll="execLoad">
            <template #default="{ item, index }">
                <slot v-bind="{ ...item, $index: index }"></slot>
            </template>
        </nut-list>
        <!-- <div class="virtual-list__loading-text" v-show="loading">
            <nut-icon name="loading"></nut-icon><span>加载中...</span>
        </div>
        <div class="virtual-list__finished-text" v-show="finished">
            {{ paginationData.total == 0 ? (!$slots.empty ? noDataText : '') : finishedText }}
        </div> -->
    </div>
</template>

<script setup>
import { reactive, computed, watch, onBeforeMount, ref, unref } from 'vue';
const props = defineProps({
    requestFn: { type: Function, required: true },
    requestParams: { type: Object, default: {} },
    responseAdapter: { type: Function },
    pageSize: { type: Number, default: 10 },
    finishedText: { type: String, default: "没有更多了" },
    noDataText: { type: String, default: "暂无数据" },
    idKey: { type: String, default: "id" },
    pageNumKey: { type: String, default: "pageNum" }, //配置分页参数的属性名
})
const list = ref([]);
const loading = ref(false);
const loaded = ref(false);

let promiseData = null; //请求接口的函数，已经执行了的
let promiseId = 0; //每个请求的唯一id

const emit = defineEmits(['currentData'])

const paginationData = reactive({
    total: 0,
    currentPage: 1,
    pageSize: 10,
});
const refreshData = reactive({
    refreshed: false,
});
const finished = computed(() => {
    return unref(loaded) && unref(list).length >= paginationData.total;
});
//接口适配器，默认的接口返回格式，可通过传入responseAdapter自定义
const wilResponseAdapter = (result, pageSize) => {
    const _data = result;

    if (isNil(_data)) {
        return {
            listData: [],
            listTotal: 0,
        };
    }

    return {
        listData: _data.rows || [],
        listTotal: +_data.total,
    };
};
//设置接口格式适配器
const getResponseAdapter = () => {
    // let result = defaultAdapter; //默认海康的请求参数以及返回接口
    let result = {};
    if (props.responseAdapter) {
        result = props.responseAdapter; //有自定义接口结果适配器的话
    } else {
        //否则使用wil的接口结果适配器
        result = wilResponseAdapter;
    }
    return result;
};

//设置promiseData，用于解决网络卡之后，reload之后导致之前的数据也被push进去的问题
const setPromise = (params) => {
    const promiseData1 = () => {
        let id = promiseId;
        return props.requestFn({ ...params }).then((res) => {
            res.promiseId = id;
            return res;
        });
    };
    promiseData = promiseData1();
};
const load = async () => { //从接口分页加载数据
    await promiseData.then((result) => {
        if (promiseId != result.promiseId) {
            return;
        }
        const { listData, listTotal } = getResponseAdapter()(result, paginationData.pageSize);
        if (refreshData.refreshed) {
            list.value = [];
        }
        list.value = [...list.value, ...listData];
        paginationData.total = listTotal;
        emit("currentData", { ...paginationData, list: list.value });
    });
};
const execLoad = async () => {//滚动或者reload触发的事件，在请求接口前做一些准备
    if (props.requestParams === null) {
        return;
    }

    if (unref(finished) || unref(loading)) {
        return;
    }

    loading.value = true;
    const params = {
        ...props.requestParams,
        [props.pageNumKey]: paginationData.currentPage++,
        pageSize: paginationData.pageSize,
    };
    setPromise(params);
    await load()
        .then(() => {
            loaded.value = true;
        })
        .finally(() => {
            loading.value = false;
            uni.hideLoading();
        });
};

const reload = async () => { //重新加载
    loaded.value = false;
    loading.value = false;
    paginationData.currentPage = 1;
    paginationData.total = 0;
    isAdd.value = false; //手动添加操作完成，将isAdd设置为false
    promiseId++;
    if (!refreshData.refreshed) {
        list.value = [];
    }

    await execLoad();
    refreshData.refreshed = false;
};
watch(
    () => props.requestParams,
    () => {
        reload();
    },
    { deep: true }
);

onBeforeMount(() => {
    paginationData.pageSize = props.pageSize;
    execLoad();
});

defineExpose({
    reload,
});

</script>

<style lang="scss" scoped>
.wil-virtual-list {
    width: 100%;
    height: 100%;

    :deep(.nut-list) {
        .uni-scroll-view {
            .uni-scroll-view {
                .uni-scroll-view-content {
                    .nut-list-container {
                        .nut-list-item {
                            height: auto !important;
                            margin-bottom: 0;

                            &:last-child {
                                margin-bottom: 20rpx;
                            }
                        }
                    }
                }
            }
        }
    }

    .virtual-list__finished-text {
        line-height: 40rpx;
        font-size: 28rpx;
        text-align: center;
        color: #86909c;
        // padding-bottom: constant(safe-area-inset-bottom);
        // padding-bottom: env(safe-area-inset-bottom);
        padding-bottom: 68rpx;
        width: 100%;
    }

    .virtual-list__loading-text {
        display: flex;
        align-items: center;
        justify-content: center;
        padding-bottom: 68rpx;
        width: 100%;

        span {
            font-size: 28rpx;
            color: #666;
        }
    }
}
</style>
