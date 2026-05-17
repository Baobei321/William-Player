<template>
  <div class="wil-virtual-list">
  <nut-list :height="50" :listData="list" @scroll="execLoad">
  <template #default="{ item, index }">
  <slot v-bind="{ ...item, $index: index }"></slot>
  </template>
  </nut-list>
  </div>
</template>

<script setup>
import { reactive, computed, watch, onBeforeMount, ref, unref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
const props = defineProps({
  requestFn: { type: Function, required: true },
  requestParams: { type: Object, default: {} },
  responseAdapter: { type: Function },
  pageSize: { type: Number, default: 10 },
  finishedText: { type: String, default: '' },
  noDataText: { type: String, default: '' },
  idKey: { type: String, default: 'id' },
  pageNumKey: { type: String, default: 'pageNum' },
})
const list = ref([]);
const loading = ref(false);
const loaded = ref(false);

let promiseData = null;
let promiseId = 0;

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

const isNil = value => {
  return value === null || value === undefined
}

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

const getResponseAdapter = () => {
  let result = {};
  if (props.responseAdapter) {
    result = props.responseAdapter;
  } else {
    result = wilResponseAdapter;
  }
  return result;
};

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
const load = async () => {
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
const execLoad = async () => {
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

const reload = async () => {
  loaded.value = false;
  loading.value = false;
  paginationData.currentPage = 1;
  paginationData.total = 0;
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
    color: var(--app-text-tertiary);
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
      color: var(--app-text-secondary);
    }
  }
}
</style>
