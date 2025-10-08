<template>
    <div class="app-wrapper">
        <side-bar v-if="!route.meta.hideSidebar"></side-bar>
        <div class="app-wrapper-right">
            <app-main></app-main>
        </div>
    </div>
</template>

<script setup>
import sideBar from './components/sidebar.vue';
import appMain from './components/app-main.vue';
import { useRoute } from 'vue-router';

const route = useRoute()
</script>

<style lang="scss" scoped>
.app-wrapper {
    width: 100%;
    height: 100%;
    display: flex;

    .app-wrapper-right {
        flex: 1;
        overflow: hidden;
    }
}
</style>
