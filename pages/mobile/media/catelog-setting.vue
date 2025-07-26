<template>
    <div class="catelog-setting">
        <wil-form :options="settings2" :show-button="true" ref="base_form2" v-model="formData" :showButton="false">
            <template #tvCatelog>
                <nut-cell title="电视剧目录设置" is-link @click="resetMtData">
                    <template #icon>
                        <image src="@/static/xsp-black.png"></image>
                    </template>
                </nut-cell>
            </template>
            <template #movieCatelog>
                <nut-cell title="电影目录设置" is-link @click="resetMtData">
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
</script>

<style lang="scss" scoped>
.catelog-setting{
    :deep(.base-form){
        .base-form-content{
            .nut-form{
                .nut-cell-group{
                    .nut-cell-group__wrap{
                        .nut-form-item{
                            .nut-form-item__body{
                                .nut-form-item__body__slots{
                                    .nut-cell{
                                        .nut-cell__icon{
                                            image{
                                                width: 40rpx;
                                                height: 40rpx;
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
}
</style>
