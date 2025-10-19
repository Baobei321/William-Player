<template>
    <div class="question">
        <wil-title :title="route.query.title"></wil-title>
        <div class="question-container">
            <iframe :src="route.query.url"></iframe>
        </div>
    </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import wilTitle from '@/components/electron/wil-title/index.vue'

const route = useRoute()

</script>

<style lang="scss" scoped>
.question {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;

    .question-container {
        overflow: hidden;
        flex: 1;
        width: 100%;

        iframe {
            // aspect-ratio: 375/812;
            width: 100%;
            height: 100%;
            border: none;
        }
    }
}
</style>
