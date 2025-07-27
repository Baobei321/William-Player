<template>
    <div class="catelog-setting">
        <wil-form :options="settings2" :show-button="true" ref="base_form2" v-model="formData" :showButton="false">
            <template #tvCatelog>
                <nut-cell title="电视剧目录设置" is-link @click="toMuluList('tv')">
                    <template #icon>
                        <image src="@/static/xsp-black.png"></image>
                    </template>
                </nut-cell>
            </template>
            <template #movieCatelog>
                <nut-cell title="电影目录设置" is-link @click="toMuluList('movie')">
                    <template #icon>
                        <image src="@/static/dy-black.png"></image>
                    </template>
                </nut-cell>
            </template>
        </wil-form>
    </div>
</template>

<script setup>
//目录设置
import wilForm from "@/components/mobile/wil-form/index.vue";
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
}

.catelog-setting {
    width: 100%;
    height: 100%;

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
                                            color: #000015;
                                        }

                                        .nut-cell__link {
                                            color: #000015;
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
