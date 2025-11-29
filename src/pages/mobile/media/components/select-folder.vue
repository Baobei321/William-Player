<template>
    <div class="select-folder">
        <div class="select-folder-title">
            <nut-icon name="rect-left" custom-color="#000" @click="toBack"></nut-icon>
            <span>添加{{ props.title }}目录</span>
            <span class="title-right" @click="confirm">确认</span>
        </div>
        <wil-list :requestFn="getFileList" ref="load_list" idKey="name" :pageSize="60" :key="key"
            :responseAdapter="responseAdapter" @currentData="handleData" :refresher-enabled="false">
            <template #default="item">
                <nut-cell is-link :class="[item.$index == data.total - 1 ? 'last-cell' : '']" @click="clickCell(item)">
                    <template #title>
                        {{ item.name.length > 12 ? item.name.slice(0, 12) + '...' : item.name }}
                    </template>
                    <template #icon>
                        <div class="cell-icon">
                            <image :src="selectName == item.name ? checkActive : checkIcon"
                                @click.stop="chooseName(item)" v-if="item.type == '1'"></image>
                            <image :src="setImg(item)" />
                        </div>
                    </template>
                    <template #link>
                        <span v-if="item.type != '1'">{{ handleSize(item.size) }}</span>
                        <span v-else></span>
                    </template>
                </nut-cell>
            </template>
        </wil-list>
    </div>
</template>

<script setup>
import wilList from "@/components/mobile/wil-list/index.vue";
import checkIcon from '@/static/check.png'
import checkActive from '@/static/check-active.png'
import { useSelectFolder } from "@/hooks/useSelectFolder";

const props = defineProps({
    selectType: { type: Object, default: {} },
    selectMedia: { type: Object, default: {} },
    result: { type: Object, default: {} },
    title: { type: String, default: '' }
})

const emits = defineEmits(['openSource', 'confirm'])

const { data, key, selectName, responseAdapter, handleData, handleSize, chooseName, toBack, getFileList, clickCell, setImg, confirm }
    = useSelectFolder({ selectType: props.selectType, selectMedia: props.selectMedia, result: props.result, title: props.title, emits: emits })


</script>

<style lang="scss" scoped>
.select-folder {
    width: 100%;
    height: 100%;
    background: #f6f7f8;
    box-sizing: border-box;
    margin-top: 0;
    display: flex;
    flex-direction: column;

    .select-folder-title {
        width: 100%;
        padding-top: 24rpx;
        font-size: 34rpx;
        font-weight: bold;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;

        :deep(.nut-icon) {
            position: absolute;
            left: 24rpx;
        }

        .title-right {
            color: #2457fd;
            font-size: 32rpx;
            position: absolute;
            right: 24rpx;
        }
    }

    ::v-deep .load-list {
        flex: 1;
        padding: 0 24rpx;
        padding-top: 24rpx;
        box-sizing: border-box;
        overflow: hidden;

        .list-item {
            &:first-child {
                .nut-cell {
                    // border-radius: 24rpx 24rpx 0 0;
                    border-top-left-radius: 24rpx;
                    border-top-right-radius: 24rpx;
                }
            }

            .nut-cell {
                margin: 0;
                padding: 24rpx;
                background: #fff;
                align-items: center;
                box-shadow: none;
                border-radius: 0;

                &::after {
                    border-bottom: 2rpx solid #f5f6f7 !important;
                    /* position: absolute !important;
          box-sizing: border-box !important;
          content: " " !important;
          pointer-events: none !important;
          right: 32rpx !important;
          bottom: 0 !important;
          left: 32rpx !important;
          -webkit-transform: scaleY(0.5) !important;
          -ms-transform: scaleY(0.5) !important;
          transform: scaleY(0.5) !important; */
                }

                .nut-cell__icon {
                    margin-right: 16rpx;

                    .cell-icon {
                        display: flex;
                        align-items: center;

                        image {
                            width: 60rpx;
                            height: 60rpx;
                            object-fit: cover;

                            &:first-child {
                                width: 40rpx;
                                height: 40rpx;
                                margin-right: 20rpx;
                            }
                        }
                    }
                }

                .nut-cell__title {
                    justify-content: center;
                    font-size: 30rpx;
                    color: #353a45;
                    line-height: normal;

                    .wil-cell__title {
                        display: flex;
                        align-items: center;

                        span:last-child {
                            padding-left: 24rpx;
                        }
                    }

                    // font-weight: bold;
                }
            }

            .last-cell {
                // border-radius: 0 0 24rpx 24rpx;
                border-bottom-right-radius: 24rpx;
                border-bottom-left-radius: 24rpx;

                &::after {
                    display: none;
                }
            }
        }

        .load-list__finished-text {
            margin-top: 24rpx;
        }
    }
}
</style>
