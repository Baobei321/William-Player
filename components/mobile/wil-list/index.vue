<template>
  <normalList v-if="props.type == 'normal'" v-bind="$attrs" ref="normal_list">
    <template #prepend>
      <slot name="prepend" />
    </template>
    <template #default="item">
      <slot v-bind="{ ...item }"></slot>
    </template>
    <template #empty>
      <slot name="empty" />
    </template>
  </normalList>
  <virtualList v-if="props.type == 'virtual'" v-bind="$attrs"></virtualList>
</template>

<script setup>
import { ref } from 'vue'
import normalList from './normal.vue'
import virtualList from './virtual.vue'
const props = defineProps({
  type: { type: String, default: "normal" },
})

const normal_list = ref(null)

const reload = () => {
  normal_list.value.reload()
}
const handleAdd = () => {
  normal_list.value.handleAdd()
}
const handleDelete = () => {
  normal_list.value.handleDelete()
}
const handleEdit = () => {
  normal_list.value.handleEdit()
}
const clearList = () => {
  normal_list.value.clearList()
}
defineExpose({
  reload,
  handleAdd,
  handleDelete,
  handleEdit,
  clearList
})
</script>

<style lang="scss" scoped>
.wil-list {
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>
