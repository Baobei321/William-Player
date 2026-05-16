<template>
    <div :class="['catelog-setting', themeClass]">
        <wil-form :options="settings2" :show-button="true" ref="base_form2" v-model="formData" :showButton="false">
            <template #tvCatelog>
                <nut-cell title="电视剧目录设置" is-link @click="toMuluList('tv')">
                    <template #icon>
                        <image :src="isDark ? xspGray : xspBlack"></image>
                    </template>
                </nut-cell>
            </template>
            <template #movieCatelog>
                <nut-cell title="电影目录设置" is-link @click="toMuluList('movie')">
                    <template #icon>
                        <image :src="isDark ? dyGray : dyBlack"></image>
                    </template>
                </nut-cell>
            </template>
        </wil-form>
    </div>
</template>

<script setup>
//目录设置
import wilForm from "@/components/mobile/wil-form/index.vue";
import { useThemeNavbar } from '@/hooks/useThemeNavbar'
import { useThemeClass } from '@/hooks/useThemeClass'
import { useThemeColors } from '@/hooks/useThemeColors'
import xspBlack from '@/static/xsp-black.png'
import dyBlack from '@/static/dy-black.png'
import xspGray from '@/static/xsp-gray.png'
import dyGray from '@/static/dy-gray.png'

useThemeNavbar()
const themeClass = useThemeClass()
const { isDark } = useThemeColors()
const settings2 = [
    { label: "", prop: "tvCatelog" },
    { label: "", prop: "movieCatelog" },
]

const toMuluList = (type) => {
    uni.navigateTo({
        url: `/pages/mobile/media/catelog-mulu?title=${type === 'tv' ? '电视剧' : '电影'}`
    })
}
</script>

<style lang="scss" scoped>
page {
    width: 100%;
    height: 100%;
    background: var(--app-bg);
}

.catelog-setting {
    width: 100%;
    height: 100%;
    background: var(--app-bg);
    color: var(--app-text-primary);

    :deep(.base-form) {
        background: transparent;

        .base-form-content {
            .nut-form {
                .nut-cell-group {
                    .nut-cell-group__wrap {
                        margin-bottom: 0;
                        background: transparent;

                        .nut-form-item {
                            background: transparent;
                            padding-top: 0;
                            padding-bottom: 0;

                            .nut-form-item__body {
                                .nut-form-item__body__slots {
                                    .nut-cell {
                                        margin: 0;
                                        box-shadow: none;
                                        background: transparent;

                                        .nut-cell__icon {
                                            image {
                                                width: 40rpx;
                                                height: 40rpx;
                                            }
                                        }

                                        .nut-cell__title {
                                            color: var(--app-text-primary);
                                        }

                                        .nut-cell__link {
                                            color: var(--app-text-primary);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>
