<template>
    <div class="toolbox">
        <wil-navbar title="工具箱"></wil-navbar>
        <div class="toolbox-container">
            <div class="toolbox-container-list">
                <div class="list-item" v-for="item in toolboxArr" :key="item.title" @click="clickItem(item)">
                    <image class="list-item-logo" :src="item.icon"></image>
                    <span>{{ item.title }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import wilNavbar from '@/components/mobile/wil-navbar/index.vue'
import expressSearch from '@/static/express-search.png'
import { toStringfy, toParse } from "@/pages/mobile/mine/common";

const toolboxArr = [
    { title: '快递查询', icon: expressSearch, path: '/pages/mobile/toolbox/express/search' },
    {
        title: 'AI应用', icon: 'https://img2.baidu.com/it/u=1301209709,4272401830&fm=253&fmt=auto&app=138&f=JPEG?w=437&h=437',
        path: '/pages/mobile/backend/index', query: {
            url: "https://www.qianwen.com/",
            title: "通义千问",
        }
    },
    {
        title: '今日油价', icon: 'https://appimg-drcn.dbankcdn.com/application/icon144/950609aee81d49c38d3c5f1ad5fd5e87.png',
        path: '/pages/mobile/backend/index',
        query: {
            url: 'https://www.xirumi.cn',
            title: "今日油价",
        }
    },
    {
        title: '天气预报', icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/77/a8/3e/77a83e97-f088-b8f9-71cc-9cf395deae1c/AppIcon-0-0-1x_U007emarketing-0-8-0-0-85-220.png/350x350.png',
        path: '/pages/mobile/backend/index',
        query: {
            url: 'https://qq.weather.com.cn/mweather15d/101300501.shtml',
            title: "天气预报",
        }
    },
    {
        title: '草料二维码', icon: 'https://tmpic.tmkoo.com/407b6f44964ededc967541ee3bb13223?v=2022',
        path: '/pages/mobile/backend/index',
        query: {
            url: 'https://cli.im/',
            title: "草料二维码",
        }
    },
    {
        title: '下厨房', icon: 'http://file.market.xiaomi.com/thumbnail/PNG/l62/AppStore/0fd2845f926424d67a95aa14402d2ff14fca354d4',
        path: '/pages/mobile/backend/index',
        query: {
            url: 'https://m.xiachufang.com/',
            title: "下厨房",
        }
    },
]

const clickItem = (item) => {
    uni.navigateTo({
        url: toStringfy(item.query) ? item.path + "?" + toStringfy(item.query) : item.path,
        animationType: 'slide-in-bottom'
    })
}
</script>

<style lang="scss" scoped>
page {
    width: 100%;
    height: 100%;
}

.toolbox {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    background: linear-gradient(180deg, #ffd3b1 0%, #fff5ec 50%, #f6f7f8 70%);
    background-size: 100% 100%;
    position: relative;

    .toolbox-container {
        flex: 1;
        overflow: auto;
        padding: 0 24rpx;
        padding-top: 24rpx;

        .toolbox-container-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120rpx, 1fr));
            gap: 24rpx;
            justify-content: space-between;

            .list-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                cursor: pointer;

                image {
                    display: block;
                    width: 90rpx;
                    height: 90rpx;
                    border-radius: 50%;
                }

                span {
                    width: 100%;
                    display: block;
                    font-size: 28rpx;
                    color: #000;
                    padding-top: 16rpx;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    text-align: center;
                }
            }
        }
    }

}
</style>
