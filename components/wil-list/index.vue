<template>
  <scroll-view class="load-list" :scroll-y="true" :enhanced="true" :refresherEnabled="refresherEnabled" :refresherTriggered="refreshData.refreshed" refresherBackground="transparent"
    @refresherrefresh="handleRefresherRefresh" @scrolltolower="handleScrollToLower" :style="{ 'height': scrollHeight ? `${scrollHeight}px` : '100%' }"
    :showScrollbar="props.showScrollBar" @scroll="scroll">
    <slot name="prepend" />

    <div :class="listContainerClass">
      <div v-for="(item, index) in list" :key="item[idKey]" class="list-item">
        <slot v-bind="{ ...item, $index: index }" v-if="props.isUseCustom" />
        <slot v-bind="{ ...item, $index: index }" v-else></slot>
      </div>
      <div class="load-list__loading-text" v-show="loading">
        <nut-icon name="loading"></nut-icon><span>加载中...</span>
      </div>
      <div class="load-list__finished-text" v-show="finished">
        {{ paginationData.total == 0 ? (!$slots.empty ? noDataText : '') : finishedText }}
      </div>
      <slot name="empty" v-if="loaded && list.length === 0" />
    </div>
  </scroll-view>
</template>

<script setup>
import { computed, onBeforeMount, reactive, ref, unref, watch, watchEffect } from 'vue';

const emit = defineEmits(['currentData', 'scroll'])

const isNil = (value) => {
  return value === null || value === undefined;
}

const hshyResponseAdapter = (result, pageSize) => {
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

const props = defineProps({
  // requestType: { type: String, default: '1' },
  requestFn: { type: Function, required: true },
  requestParams: { type: Object, default: {} },
  responseAdapter: { type: Function },
  pageSize: { type: Number, default: 10 },
  immediate: { type: Boolean, default: true },
  finishedText: { type: String, default: '没有更多了' },
  useListTotal: { type: Boolean, default: false },
  noDataText: { type: String, default: '暂无数据' },
  idKey: { type: String, default: 'id' },
  refresherEnabled: { type: Boolean, default: true }, // 下拉刷新
  scrollHeight: { type: Number }, //高度
  listContainerClass: { type: String, default: '' },
  showScrollBar: { type: Boolean, default: true },
  changeItemFn: { type: Function, default: () => { } },//修改某一项的方法，需配合requireStore的editId使用
  isUseCustom: { type: Boolean, default: true },//是否使用custom-wrapper提高性能,
  pageNumKey: { type: String, default: 'pageNum' },//配置分页参数的属性名
});

const list = ref([]);
const loading = ref(false);
const loaded = ref(false);

const isAdd = ref(false) //是否动态添加了

let promiseData = null //请求接口的函数，已经执行了的
let promiseId = 0 //每个请求的唯一id

const paginationData = reactive({
  total: 0,
  currentPage: 1,
  pageSize: 10
});

const refreshData = reactive({
  refreshed: false,
});

const finished = computed(() => {
  return unref(loaded) && unref(list).length >= paginationData.total;
});

const getResponseAdapter = () => {
  // let result = defaultAdapter; //默认海康的请求参数以及返回接口
  let result = {}
  if (props.responseAdapter) {
    result = props.responseAdapter; //有自定义接口结果适配器的话
  }
  else { //否则使用hshy的接口结果适配器
    result = hshyResponseAdapter;
  }
  return result;
};

const deletePage = ref(1)

const load = async () => {
  deletePage.value = paginationData.currentPage
  await promiseData.then(result => {

    if (promiseId != result.promiseId) {
      return
    }
    const { listData, listTotal } = (getResponseAdapter())(result, paginationData.pageSize);
    if (refreshData.refreshed) {
      list.value = [];
    }
    if (isAdd.value) { //如果isAdd为true，就表示进行了新增操作
      list.value = Array.from(new Map([...list.value, ...listData].map(obj => [obj.id, obj])).values()) //直接去重
      isAdd.value = false //手动添加操作完成，将isAdd设置为false
    } else {
      list.value = [...list.value, ...listData];
    }
    paginationData.total = listTotal;
    
    if (props.useListTotal) {
      paginationData.total = listData.length;
    }

    emit('currentData', { ...paginationData, list: list.value })
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
    pageSize: paginationData.pageSize
  }
  setPromise(params)
  await load().then(() => {
    loaded.value = true;
  }).finally(() => {
    loading.value = false;
    uni.hideLoading();
  });
};

const reload = async () => {
  loaded.value = false;
  paginationData.currentPage = 1;
  paginationData.total = 0;
  isAdd.value = false //手动添加操作完成，将isAdd设置为false
  promiseId++
  if (!refreshData.refreshed) {
    list.value = [];
  }

  await execLoad();
  refreshData.refreshed = false;
};

const handleScrollToLower = () => {
  execLoad();
};

const handleRefresherRefresh = () => {
  refreshData.refreshed = true;
  isAdd.value = false
  reload().then(() => {
    refreshData.refreshed = false;
  });
};

const scroll = (detail) => {
  emit('scroll', detail)
}


//手动添加一条数据，往数组索引0，push数据
const handleAdd = async (isA, sort = 'DESC') => {
  isAdd.value = isA
  if (sort == 'DESC') {  //降序，新增的在数组的第一条
    const params = {
      ...props.requestParams,
      [props.pageNumKey]: 1,
      pageSize: 1
    };
    setPromise(params)
    await promiseData.then(result => {
      if (promiseId != result.promiseId) {
        return
      }
      const { listData, listTotal } = (getResponseAdapter())(result); //因为新增的都在最上面，那么就请求第一页第一条，将第一条push到数组前面去
      if (list.value.length > 0) {
        if (listData[0][props.idKey] != list.value[0][props.idKey] && listTotal > 0) {
          list.value = [...listData, ...list.value];
          paginationData.total = listTotal;
        } else {
          isAdd.value = false //手动添加操作完成，将isAdd设置为false
        }
      } else {
        if (listTotal > 0) { //添加上去的请求到了数据，如果跟筛选条件不符合，是请求不到数据的
          list.value = [...listData, ...list.value];
          paginationData.total = listTotal;
          isAdd.value = false  //手动添加操作完成，将isAdd设置为false
        }
      }
      if (props.useListTotal) {
        paginationData.total = listData.length;
      }
    });
  } else if (sort == 'ASC') {  //升序,新增的在数组最后一条
    let params = {}
    if (Math.ceil((paginationData.total + 1) / paginationData.pageSize) == paginationData.currentPage - 1) {
      params = {
        ...props.requestParams,
        [props.pageNumKey]: paginationData.currentPage - 1,
        pageSize: paginationData.pageSize,
      }
      setPromise(params)
      await promiseData.then(result => { //因为已经在最后一页了，那就获取最后一页的数据，再拿到最后一条
        if (promiseId != result.promiseId) {
          return
        }
        const { listData, listTotal } = (getResponseAdapter())(result); //因为在
        if (list.value.length > 0) {
          if (listTotal > 0 && listData[listData.length - 1][props.idKey] != list.value[list.value.length - 1][props.idKey]) {
            list.value.push(listData[listData.length - 1])
            paginationData.total = listTotal;
            isAdd.value = false //手动添加操作完成，将isAdd设置为false
          }
        } else {
          if (listTotal > 0) { //添加上去的请求到了数据，如果跟筛选条件不符合，是请求不到数据的
            list.value = [...listData, ...list.value];
            paginationData.total = listTotal;
            isAdd.value = false  //手动添加操作完成，将isAdd设置为false
          }
        }
        if (props.useListTotal) {
          paginationData.total = listData.length;
        }
      });
    }
  }
}

//手动删除一条数据
const handleDelete = async (id) => {
  console.log(id, 'id');
  if (!finished.value) { //如果还没滚动到底部
    const params = {
      ...props.requestParams,
      [props.pageNumKey]: deletePage.value,
      pageSize: paginationData.pageSize
    };
    setPromise(params)
    list.value = list.value.filter(item => item[props.idKey] != id)
    await promiseData.then(result => { //因为删除了一项，那么下一页的第一条就变成了当前页面的最后一条，下次请求的时候这条数据就无法再获取到了，那么就应该请求当前页，获取最后一条push进去。
      const { listData, listTotal } = (getResponseAdapter())(result);
      let data = listData.slice(params.pageSize - 1, params.pageSize)
      list.value = [...list.value, ...data];
      paginationData.total = listTotal;

      if (props.useListTotal) {
        paginationData.total = listData.length;
      }
    });
  } else {
    paginationData.total--;//保证total与后端同步，这样就是finished已经到底部，往下拉不会再请求数据
    list.value = list.value.filter(item => item[props.idKey] != id)
  }
}

//手动调用传入的函数修改item,避免多个缓存的页面用到这个组件，不想被调用的也被调用了
const handleEdit = (id) => {
  if (id) {
    let item = list.value.find(i => i[props.idKey] == id)
    props.changeItemFn(item)
  }
}

//设置promiseData，用于解决网络卡之后，reload之后导致之前的数据也被push进去的问题
const setPromise = (params) => {
  const promiseData1 = () => {
    let id = promiseId
    return props.requestFn({ ...params }).then(res => {
      res.promiseId = id
      return res
    })
  }
  promiseData = promiseData1()
}

watch(() => props.requestParams, () => {
  reload();
}, { deep: true });

onBeforeMount(() => {
  paginationData.pageSize = props.pageSize
  isAdd.value = false
  execLoad();
});

defineExpose({
  reload,
  handleAdd,
  handleDelete,
  handleEdit,
});
</script>

<style lang="scss" scoped>
$b: load-list;

.#{$b} {
  height: 100%;

  &__finished-text {
    line-height: 40rpx;
    font-size: 28rpx;
    text-align: center;
    color: #86909c;
    // padding-bottom: constant(safe-area-inset-bottom);
    // padding-bottom: env(safe-area-inset-bottom);
    padding-bottom: 68rpx;
    width: 100%;
  }
  &__loading-text {
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