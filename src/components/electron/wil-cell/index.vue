<template>
    <div class="wil-cell">
        <div class="wil-cell-item" v-for="(item, index) in props.options" :key="index" @click="clickItem(item)">
            <div class="wil-cell-item__left">
                <slot name="icon" v-if="$slots.icon"></slot>
                <div class="left-icon" v-if="!$slots.icon && item.icon">
                    <img :src="item.icon">
                </div>
                <slot name="title" v-if="$slots.title"></slot>
                <div class="left-title" v-if="!$slots.title && item.title">{{ item.title }}</div>
            </div>
            <slot name="link" v-if="$slots.link"></slot>
            <div class="wil-cell-item__right" v-else>
                <img src="@/static/arrow-black.png">
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    options: { type: Array, default: [] },
})

const emits = defineEmits(['clickItem'])

const clickItem = (item) => {
    emits('clickItem', item)
}

</script>

<style lang="scss" scoped>
.wil-cell{
    .wil-cell-item{
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20rpx 32rpx;
        cursor: pointer;
        &:hover{
            background: #f2f2f5;
        }
        &:active{
            background: #d2d2d3;
        }
        .wil-cell-item__left{
            display: flex;
            align-items: center;
            .left-icon{
                width: 60rpx;
                height: 60rpx;
                img{
                    width: 100%;
                    height: 100%;
                }
            }
            .left-title{
                margin-left: 24rpx;
            }
        }
        .wil-cell-item__right{
            img{
                width: 40rpx;
                height: 40rpx;
            }
        }
    }
}
</style>
