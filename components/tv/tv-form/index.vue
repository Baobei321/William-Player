<template>
  <normal-form v-if="props.type === 'normal'" v-bind="$attrs" ref="normal_form"></normal-form>
  <steps-form v-if="props.type === 'steps'" v-bind="$attrs" ref="steps_form"></steps-form>
</template>

<script setup>
import { ref } from 'vue'
import normalForm from './normal.vue'
import stepsForm from './steps.vue'

const props = defineProps({
  type: { type: String, default: 'normal' }
})

const normal_form = ref(null)
const steps_form = ref(null)

const evtMove = (keyCode) => {
  props.type === 'normal' ? normal_form.value.evtMove(keyCode) : steps_form.value.evtMove(keyCode)
}

const submitForm = (callback)=>{
  props.type === 'normal' ? normal_form.value.submitForm(callback) : steps_form.value.submitForm(callback)
}

defineExpose({
  evtMove,
  submitForm
})
</script>

<style lang="scss" scoped></style>
