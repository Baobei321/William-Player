<template>
    <div class="app-main">
        <router-view v-slot="{ Component, route }">
            <transition name="fade-transform" mode="out-in">
                <keep-alive :include="cacheRoutes">
                    <component v-if="!route.meta.link" :is="Component" :key="route.path" />
                </keep-alive>
            </transition>
        </router-view>
    </div>
</template>

<script setup>

const cacheRoutes = ['Home']

</script>

<style lang="scss" scoped>
.app-main {
    width: 100%;
    height: 100%;

    .fade-transform--move,
    .fade-transform-leave-active,
    .fade-transform-enter-active {
        transition: all .3s;
    }

    .fade-transform-enter {
        opacity: 0;
        transform: translateX(-30px);
    }

    .fade-transform-enter-from {
        opacity: 0;
        transform: translateX(-30px);
    }

    .fade-transform-leave-to {
        opacity: 0;
        transform: translateX(30px);
    }
}
</style>
