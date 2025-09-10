<template>
  <normal-form v-if="props.type==='normal'" v-bind="$attrs"></normal-form>
  <steps-form v-if="props.type==='steps'" v-bind="$attrs"></steps-form>
</template>

<script setup>
import normalForm from './normal.vue'
import stepsForm from './steps.vue'

const props = defineProps({
  type: { type: String, default: 'normal' }
})
</script>

<style lang="scss" scoped></style>
