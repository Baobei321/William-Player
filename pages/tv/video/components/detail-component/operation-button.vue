<template>
    <div class="operation-button">
        <div class="operation-button-play">
            <image src="@/static/play-gray.png"></image>
            <div class="operation-button-play__text">
                <span>立即观看</span>
                <span>第一集</span>
            </div>
        </div>
        <div class="operation-button-tvlist">
            d3c4b4
            383029
        </div>
    </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>
.operation-button{
    .operation-button-play{
        display: flex;
        align-items: center;
        image{
            width: 35rpx;
            height: 35rpx;
        }
        .operation-button-play__text{
            display: flex;
            flex-direction: column;
            padding-left: 30rpx;
            color: #c2bab2;
            font-weight: bold;
        }
    }
}
</style>
