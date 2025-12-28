<template>
    <div class="express-search">
        <wil-navbar title="快递查询">
        </wil-navbar>
        <div class="express-search-container">
            <div class="express-search-container__input">
                <nut-searchbar v-model="searchValue" placeholder="输入快递单号或者扫码查询" @search="search">
                    <template #leftin>
                        <nut-icon name="search2"></nut-icon>
                    </template>
                    <template #rightin>
                        <nut-icon name="scan2" @click="scanExpress"></nut-icon>
                    </template>
                </nut-searchbar>
            </div>
        </div>
    </div>
</template>

<script setup>
import wilNavbar from '@/components/mobile/wil-navbar/index.vue'
import { ref } from 'vue';
// import { getTokenV2 } from '@/utils/baiduExpress.js'

const searchValue = ref('')

const search = () => {
    let url = encodeURIComponent(`https://page.cainiao.com/guoguo/app-myexpress-taobao/express-detail.html?mailNo=${searchValue.value}`)
    uni.navigateTo({
        url: `/pages/mobile/backend/index?title=快递详情&url=${url}`
    })
}

const scanExpress = () => {
    uni.scanCode({
        success: async (res) => {
            searchValue.value = res.result
            search()
        },
    });
}

</script>

<style lang="scss" scoped>
page {
    width: 100%;
    height: 100%;

}

.express-search {
    width: 100%;
    height: 100%;
    // background: linear-gradient(180deg, #ffd3b1 0%, #fff5ec 50%, #f6f7f8 70%);

    .express-search-container {
        flex: 1;

        .express-search-container__input {
            :deep(.nut-searchbar) {
                background: transparent;

                .nut-searchbar__search-input {
                    box-shadow: none;
                    border-radius: 16rpx;
                    height: 90rpx;
                }
            }
        }
    }
}
</style>
