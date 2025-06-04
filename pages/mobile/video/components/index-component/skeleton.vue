<template>
  <view class="sk-container">
    <view class="sk-animation">
      <view class="sk-animation-guangzhu"></view>
    </view>
    <view class="h5-div video">
      <view class="h5-div video-container" style="overflow: hidden;">
        <view class="h5-div recent-played">
          <view class="h5-div recent-played-title">
            <view class="h5-div recent-played-title-left sk-transparent sk-text-14-2857-459 sk-text">最近观看
            </view>
            <view class="h5-div recent-played-title-right">
              <view class="h5-span sk-transparent sk-text-14-2857-474 sk-text">全部
              </view>
              <view class="h5-span sk-transparent sk-opacity">2</view>
              <text class="h5-i nutui-iconfont nut-icon nut-icon-rect-right sk-pseudo sk-pseudo-circle" style="color: gray; font-size: 10px; width: 10px; height: 10px;"></text>
            </view>
          </view>
          <view class="h5-div recent-played-list" style="overflow: hidden;">
            <view class="recent-played-list-scroll">
              <view class="h5-div recent-played-list-movie" style="scroll-snap-align: none;overflow: hidden;width: 100%;">
                <view class="h5-div recent-played-list-movie__item" v-for="item in 4" :key="item">
                  <view class="h5-div recent-played-list-movie__item-img sk-image"></view>
                  <view class="h5-span recent-played-list-movie__item-name sk-transparent sk-text-14-2857-57 sk-text">
                    我们一起摇太阳</view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="h5-div hxList">
          <view class="h5-div hxList-title">
            <view class="h5-div hxList-title-left sk-transparent sk-text-14-2857-375 sk-text">电影</view>
            <view class="h5-div hxList-title-right">
              <view class="h5-span sk-transparent sk-text-14-2857-432 sk-text">全部
              </view>
              <view class="h5-span sk-transparent sk-opacity">8</view>
              <text class="h5-i nutui-iconfont nut-icon nut-icon-rect-right sk-pseudo sk-pseudo-circle" style="color: gray; font-size: 10px; width: 10px; height: 10px;"></text>
            </view>
          </view>
          <view class="h5-div hxList-list">
            <view class="hxList-list-scroll" style="overflow: hidden;">
              <view class="h5-div hxList-list-movie" style="scroll-snap-align: none;overflow: hidden;width: 100%;">
                <view class="h5-div hxList-list-movie__item" v-for="item in 8" :key="item">
                  <image class="h5-img sk-image" mode="aspectFill"></image>
                  <view class="h5-span hxList-list-movie__item-name sk-transparent sk-text-14-2857-799 sk-text">
                    无名之火</view>
                  <view class="h5-span hxList-list-movie__item-time sk-transparent sk-text-14-2857-681 sk-text">
                    2024-07-24</view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="h5-div hxList">
          <view class="h5-div hxList-title">
            <view class="h5-div hxList-title-left sk-transparent sk-text-14-2857-706 sk-text">电视剧</view>
            <view class="h5-div hxList-title-right">
              <view class="h5-span sk-transparent sk-text-14-2857-346 sk-text">全部
              </view>
              <view class="h5-span sk-transparent sk-opacity">9</view>
              <text class="h5-i nutui-iconfont nut-icon nut-icon-rect-right sk-pseudo sk-pseudo-circle" style="color: gray; font-size: 10px; width: 10px; height: 10px;"></text>
            </view>
          </view>
          <view class="h5-div hxList-list">
            <view class="hxList-list-scroll" style="overflow: hidden;">
              <view class="h5-div hxList-list-movie" style="scroll-snap-align: none;overflow: hidden;width: 100%;">
                <view class="h5-div hxList-list-movie__item" v-for="item in 8" :key="item">
                  <image class="h5-img sk-image" mode="aspectFill"></image>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>

</script>

<style lang="scss" scoped>
@keyframes backpos {
  0% {
    left: -750rpx;
  }

  100% {
    left: calc(750rpx + 100%);
  }
}
.recent-played {
  width: 100%;
  margin-bottom: 50rpx;
  .recent-played-title {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .recent-played-title-left {
      font-size: 36rpx;
      font-weight: bold;
      color: #000;
    }

    .recent-played-title-right {
      display: flex;
      align-items: center;

      span {
        font-size: 30rpx;
        color: gray;
      }

      span:nth-child(2) {
        padding-left: 6rpx;
      }
    }
  }
  .recent-played-list {
    margin-top: 24rpx;

    .recent-played-list-scroll {
      width: 100%;
      overflow-x: auto;

      .recent-played-list-movie {
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
        .recent-played-list-movie__item {
          margin-left: 24rpx;
          flex: 0 0 520rpx;
          .recent-played-list-movie__item-img {
            background-position: center;
            background-repeat: no-repeat;
            background-size: cover;
            height: 320rpx;
            width: 100%;
            border-radius: 20rpx;
            position: relative;
            img {
              width: 80rpx;
              height: 80rpx;
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
            }
            .img-runtime {
              position: absolute;
              right: 10rpx;
              bottom: 10rpx;
              background: rgba(0, 0, 0, 0.5);
              color: #fff;
              font-size: 24rpx;
              border-radius: 8rpx;
              padding: 4rpx 8rpx;
            }
          }
          &-name {
            font-size: 28rpx;
            font-weight: bold;
            color: #000;
          }
          &:first-child {
            margin-left: 0;
          }
        }
      }
    }
  }
}
.hxList {
  width: 100%;
  margin-bottom: 50rpx;
  overflow-x: hidden;
  .hxList-title {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .hxList-title-left {
      font-size: 36rpx;
      font-weight: bold;
      color: #000;
    }

    .hxList-title-right {
      display: flex;
      align-items: center;

      span {
        font-size: 30rpx;
        color: gray;
      }

      span:nth-child(2) {
        padding-left: 6rpx;
      }
    }
  }

  .hxList-list {
    margin-top: 24rpx;

    .hxList-list-scroll {
      width: 100%;

      .hxList-list-movie {
        display: flex;
        flex-wrap: nowrap;
        align-items: center;

        .hxList-list-movie__item {
          margin-left: 24rpx;
          flex: 0 0 214rpx;
          overflow: hidden;
          .h5-img {
            width: 100%;
            height: 320rpx;
            border-radius: 20rpx;
          }
          &-name {
            font-size: 28rpx;
            font-weight: bold;
            color: #000;
            display: block;
          }
          &-time {
            font-size: 24rpx;
            color: gray;
            padding-top: 6rpx;
            display: block;
          }

          &:first-child {
            margin-left: 0;
          }
        }

        .is-move {
          transition: transform 0.3s ease;
        }

        .is-new {
          animation: opacityIn 0.3s ease;
        }
      }
    }
  }
}
.sk-animation {
  animation: backpos 1.5s ease-in-out 0s infinite;
  background-repeat: no-repeat;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 1;

  .sk-animation-guangzhu {
    width: 120rpx;
    height: 100%;
    transform: skew(-20deg);
    background: linear-gradient(
      100deg,
      hsla(0, 0%, 100%, 0),
      hsl(0, 0%, 100%) 50%,
      hsla(0, 0%, 100%, 0) 80%
    );
  }
}

.sk-transparent {
  color: transparent !important;
}

.sk-text-14-2857-322 {
  background-image: linear-gradient(
    transparent 14.2857%,
    #eeeeee 0%,
    #eeeeee 85.7143%,
    transparent 0%
  ) !important;
  background-size: 100% 56rpx;
  position: relative !important;
}

.sk-text {
  background-origin: content-box !important;
  background-clip: content-box !important;
  background-color: transparent !important;
  color: transparent !important;
  background-repeat: repeat-y !important;
}

.sk-text-14-2857-459 {
  background-image: linear-gradient(
    transparent 14.2857%,
    #eeeeee 0%,
    #eeeeee 85.7143%,
    transparent 0%
  ) !important;
  background-size: 100% 50.4rpx;
  position: relative !important;
}

.sk-text-14-2857-474 {
  background-image: linear-gradient(
    transparent 14.2857%,
    #eeeeee 0%,
    #eeeeee 85.7143%,
    transparent 0%
  ) !important;
  background-size: 100% 42rpx;
  position: relative !important;
}

.sk-opacity {
  opacity: 0 !important;
}

.sk-text-14-2857-534 {
  background-image: linear-gradient(
    transparent 14.2857%,
    #eeeeee 0%,
    #eeeeee 85.7143%,
    transparent 0%
  ) !important;
  background-size: 100% 33.6rpx;
  position: absolute !important;
}

.sk-text-14-2857-53 {
  background-image: linear-gradient(
    transparent 14.2857%,
    #eeeeee 0%,
    #eeeeee 85.7143%,
    transparent 0%
  ) !important;
  background-size: 100% 39.2rpx;
  position: relative !important;
}

.sk-text-14-2857-57 {
  background-image: linear-gradient(
    transparent 14.2857%,
    #eeeeee 0%,
    #eeeeee 85.7143%,
    transparent 0%
  ) !important;
  background-size: 100% 39.2rpx;
  position: relative !important;
}

.sk-text-14-2857-375 {
  background-image: linear-gradient(
    transparent 14.2857%,
    #eeeeee 0%,
    #eeeeee 85.7143%,
    transparent 0%
  ) !important;
  background-size: 100% 50.4rpx;
  position: relative !important;
}

.sk-text-14-2857-432 {
  background-image: linear-gradient(
    transparent 14.2857%,
    #eeeeee 0%,
    #eeeeee 85.7143%,
    transparent 0%
  ) !important;
  background-size: 100% 42rpx;
  position: relative !important;
}

.sk-text-14-2857-799 {
  background-image: linear-gradient(
    transparent 14.2857%,
    #eeeeee 0%,
    #eeeeee 85.7143%,
    transparent 0%
  ) !important;
  background-size: 100% 39.2rpx;
  position: relative !important;
}

.sk-text-14-2857-681 {
  background-image: linear-gradient(
    transparent 14.2857%,
    #eeeeee 0%,
    #eeeeee 85.7143%,
    transparent 0%
  ) !important;
  background-size: 100% 33.6rpx;
  position: relative !important;
}

.sk-text-14-2857-471 {
  background-image: linear-gradient(
    transparent 14.2857%,
    #eeeeee 0%,
    #eeeeee 85.7143%,
    transparent 0%
  ) !important;
  background-size: 100% 39.2rpx;
  position: relative !important;
}

.sk-text-14-2857-780 {
  background-image: linear-gradient(
    transparent 14.2857%,
    #eeeeee 0%,
    #eeeeee 85.7143%,
    transparent 0%
  ) !important;
  background-size: 100% 33.6rpx;
  position: relative !important;
}

.sk-text-14-2857-396 {
  background-image: linear-gradient(
    transparent 14.2857%,
    #eeeeee 0%,
    #eeeeee 85.7143%,
    transparent 0%
  ) !important;
  background-size: 100% 39.2rpx;
  position: relative !important;
}

.sk-text-14-2857-103 {
  background-image: linear-gradient(
    transparent 14.2857%,
    #eeeeee 0%,
    #eeeeee 85.7143%,
    transparent 0%
  ) !important;
  background-size: 100% 33.6rpx;
  position: relative !important;
}

.sk-text-14-2857-211 {
  background-image: linear-gradient(
    transparent 14.2857%,
    #eeeeee 0%,
    #eeeeee 85.7143%,
    transparent 0%
  ) !important;
  background-size: 100% 39.2rpx;
  position: relative !important;
}

.sk-text-14-2857-117 {
  background-image: linear-gradient(
    transparent 14.2857%,
    #eeeeee 0%,
    #eeeeee 85.7143%,
    transparent 0%
  ) !important;
  background-size: 100% 33.6rpx;
  position: relative !important;
}

.sk-text-14-2857-706 {
  background-image: linear-gradient(
    transparent 14.2857%,
    #eeeeee 0%,
    #eeeeee 85.7143%,
    transparent 0%
  ) !important;
  background-size: 100% 50.4rpx;
  position: relative !important;
}

.sk-text-14-2857-346 {
  background-image: linear-gradient(
    transparent 14.2857%,
    #eeeeee 0%,
    #eeeeee 85.7143%,
    transparent 0%
  ) !important;
  background-size: 100% 42rpx;
  position: relative !important;
}

.sk-image {
  background: #efefef !important;
}

.sk-pseudo::before,
.sk-pseudo::after {
  background: #efefef !important;
  background-image: none !important;
  color: transparent !important;
  border-color: transparent !important;
}

.sk-pseudo-rect::before,
.sk-pseudo-rect::after {
  border-radius: 0 !important;
}

.sk-pseudo-circle::before,
.sk-pseudo-circle::after {
  border-radius: 50% !important;
}

.sk-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  flex: 1;
  padding: 20px 12px;
  padding-bottom: 0;
  box-sizing: border-box;
  position: relative;
}
</style>
