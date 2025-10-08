<template>
    <div class="settings">
        <div class="settings-title">设置</div>
        <wil-cell :options="options1" @clickItem="clickItem"></wil-cell>
        <wil-cell :options="options2" @clickItem="clickItem"></wil-cell>
    </div>
</template>

<script setup>
import wilCell from '@/components/electron/wil-cell/index.vue'
import ziyuankuBlack from '@/static/ziyuanku-black.png'
import datasyncBlack from '@/static/datasync-black.png'
import xspBlack from '@/static/xsp-black.png'
import dyBlack from '@/static/dy-black.png'
import fankuiBlack from '@/static/fankui-black.png'
import zanshangBlack from '@/static/zanshang-black.png'
import chilunBlack from '@/static/chilun-black.png'
import guanyuBlack from '@/static/guanyu-black.png'
import { useRouter } from 'vue-router'
import * as CONFIG from '@/utils/config'

const router = useRouter()
const options1 = [
    { title: '媒体库列表', icon: ziyuankuBlack, path: '/mediaList' },
    { title: '数据同步', icon: datasyncBlack },
    { title: '电视剧目录设置', icon: xspBlack, path: '/catelog-mulu', query: { title: '电视剧' } },
    { title: '电影目录设置', icon: dyBlack, path: '/catelog-mulu', query: { title: '电影' } },
]
const options2 = [
    { title: '问题与反馈', icon: fankuiBlack, path: '/iframe', query: { title: '问题与反馈', url: CONFIG.BASE_URL.split(":4040")[0] + ':8443/app-webview' } },
    { title: '赞赏', icon: zanshangBlack, path: '/appreciate' },
    { title: '其他设置', icon: chilunBlack },
    { title: '关于', icon: guanyuBlack, path: '/about-version' },
]

const clickItem = (item) => {
    router.push({
        path: item.path,
        query: item.query
    })
}

</script>

<style lang="scss" scoped>
.settings {
    .settings-title {
        font-size: 50rpx;
        padding: 24rpx 0 24rpx 24rpx;
        border-bottom: 2rpx solid #e9e9e9;
    }

    :deep(.wil-cell) {
        border-bottom: 2rpx solid #e9e9e9;

        &:last-child {
            border-bottom: none;
        }
    }
}
</style>
