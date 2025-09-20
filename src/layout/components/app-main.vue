<template>
    <div class="app-main">
        <router-view v-slot="{ Component, route }">
            <transition name="fade-transform" mode="out-in">
                <keep-alive>
                    <component v-if="!route.meta.link" :is="Component" :key="route.path" />
                </keep-alive>
            </transition>
        </router-view>
    </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>
.app-main{
    width: 100%;
    height: 100%;
}
</style>
