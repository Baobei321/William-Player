<template>
  <Category v-if="props.type == 'category'" :list="props.list" :list-props="listProps" @change="changeTabs" @clickItem="clickItem">
    <template #custom="scope" v-if="$slots.custom">
      <slot name="custom" :row="scope.row"></slot>
    </template>
  </Category>
  <Linkage v-if="props.type == 'linkage'" :list="props.list" :list-props="listProps" @clickItem="clickItem"></Linkage>
</template>
  
  <script setup>
import { onMounted, ref, watchEffect } from "vue";
import Category from "./category.vue";
import Linkage from "./linkage.vue";

const props = defineProps({
  list: { type: Array, default: [] },
  type: { type: String, default: "category" },
  listProps: { type: Object, default: {} },
});

const emits = defineEmits(["change", "clickItem"]);

const listProps = ref({});

const changeTabs = (item) => {
  emits("change", item);
};

const clickItem = (item) => {
  emits("clickItem", item);
};

watchEffect(() => {
  listProps.value = {
    name: "name",
    children: "children",
    img: "img",
    ...props.listProps,
  };
});
</script>
  
  <style lang="scss" scoped>
</style>