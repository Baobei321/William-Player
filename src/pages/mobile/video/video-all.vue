<template>
  <transition name="fade-transform" mode="out-in" appear>
    <div class="video-all">
      <wil-navbar :title="routerParams.title" :leftShow="true">
        <template #right>
          <nut-icon name="more-x" custom-color="#000" size="20" @click="showPopover = true"
            v-if="routerParams.title == '电影' || routerParams.title == '电视剧'"></nut-icon>
          <sort-popover :type="mapping[routerParams.title]" v-model="showPopover"
            @changeSort="changeSort"></sort-popover>
        </template>
      </wil-navbar>
      <div class="video-all-list">
        <wil-tabs :tabsList="tabList" lineColor="#52b54b" @changeTab="changeTab" v-model="embyActiveTab"
          v-if="routerParams.type == 'emby' && (routerParams.embyIncludeItemTypes == 'Series' || routerParams.embyIncludeItemTypes == 'Movie')"></wil-tabs>
        <wil-list :requestFn="getMovieTvList" :request-params="requestParams" ref="wil_list" :refresherEnabled="false"
          idKey="path" listContainerClass="list-container" :pageSize="windowWidth > 700 ? 50 : 12"
          :changeItemFn="changeItemFn" :listItemStyle="listItemStyle"
          :style="{ '--line-number': lineNumber, '--line-height': lineHeight }">
          <template #default="item">
            <div class="video-all-list__item" @click="toVideoDetail(item)">
              <div class="item-poster">
                <image :src="(!routerParams.isConnected && !item.loadImg) ? posterEmpty : setEmptyImg(item.poster)"
                  class="item-poster-image" mode="aspectFill" @error="imgError(item)" @load="imgLoad(item)">
                </image>
              </div>
              <span class="item-name">{{ removeExtension(item) }}</span>
              <span class="item-time" v-if="!item.notShowTime">{{ item.releaseTime || '暂无' }}</span>
            </div>
          </template>
        </wil-list>
      </div>
    </div>
  </transition>
</template>

<script setup>
import wilList from "@/components/mobile/wil-list/index.vue";
// import emptyBg from "@/static/empty_bg.png";
import posterEmpty from "@/static/poster-empty.png";
import wilNavbar from "@/components/mobile/wil-navbar/index.vue";
import sortPopover from "./components/index-component/sort-popover.vue";
import wilTabs from "@/components/mobile/wil-tabs/index.vue"
import { ref } from 'vue'
import { useVideoAll } from "@/hooks/useVideoAll";
import { onUnload } from "@dcloudio/uni-app";
import { onBeforeUnmount } from "vue";

const wil_list = ref(null);

const show = ref(true)

const { routerParams, showPopover, mapping, changeSort, tabList, changeTab,
  getMovieTvList, requestParams, windowWidth, changeItemFn, listItemStyle, lineNumber, lineHeight, embyActiveTab,
  toVideoDetail, setEmptyImg, imgError, imgLoad, removeExtension } = useVideoAll({ wil_list })

</script>

<style lang="scss" scoped>
.fade-transform--move,
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.5s;
}

.fade-transform-enter {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

page {
  width: 100%;
  height: 100%;
}

.video-all {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  ::v-deep .wil-navbar {
    .nut-navbar {
      overflow: visible;

      .nut-navbar__right {
        display: block;
        position: absolute;
        right: 0;
        display: flex;
        align-items: center;
      }
    }
  }

  .video-all-list {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    // padding-top: 16px;
    ::v-deep .load-list {
      flex: 1;
      overflow: hidden;

      .list-container {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        padding: 0 24rpx;
        padding-top: 16px;

        // gap: 24rpx;
        .list-item {
          margin-bottom: 24rpx;
          // flex: 1 1 218rpx;
          min-width: 218rpx;
          /* 确保最小宽度 */
          flex: 0 0 calc((100% - (var(--line-number) - 1) * 24rpx) / var(--line-number));

          .video-all-list__item {
            .item-poster {
              width: 100%;
              // aspect-ratio: 109/160; /* 高度 = (109/160) × 宽度 */
              height: var(--line-height);
              border-radius: 20rpx;
              position: relative;

              .item-poster-image {
                width: 100% !important;
                height: 100%;
                border-radius: 20rpx;
                object-fit: cover;
              }
            }

            .item-name {
              font-size: 28rpx;
              font-weight: bold;
              color: #000;
              display: block;
            }

            .item-time {
              font-size: 24rpx;
              color: gray;
              padding-top: 6rpx;
              display: block;
            }
          }

          // &:nth-child(3n + 1) {
          //   margin-left: 0;
          // }
        }
      }

      .list-recent {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        padding: 0 24rpx;
        padding-top: 32rpx;

        // gap: 24rpx;
        .list-item {
          margin-bottom: 24rpx;
          // flex: 1 1 218rpx;
          min-width: 218rpx;
          /* 确保最小宽度 */
          flex: 0 0 calc((100% - (var(--line-number) - 1) * 24rpx) / var(--line-number));

          .video-all-list__item {
            .item-poster {
              width: 100%;
              height: var(--line-height);
              // aspect-ratio: 169.5/90; /* 高度 = (109/160) × 宽度 */
              // height: 180rpx;
              border-radius: 20rpx;
              position: relative;

              .item-poster-image {
                width: 100%;
                height: 100%;
                border-radius: 20rpx;
                object-fit: cover;
              }

              .item-poster-runtime {
                position: absolute;
                right: 10rpx;
                bottom: 10rpx;
                background: rgba(0, 0, 0, 0.5);
                color: #fff;
                font-size: 24rpx;
                border-radius: 8rpx;
                padding: 4rpx 8rpx;
              }

              .item-poster-process {
                height: 3.5rpx;
                background: #ff6701;
                position: absolute;
                bottom: 0;
                left: 0;
              }

              .item-poster-check {
                width: 30rpx;
                height: 30rpx;
                box-sizing: border-box;
                // border: 2rpx solid #ff6701;
                background: #ff6701;
                position: absolute;
                top: 20rpx;
                right: 20rpx;
                border-radius: 8rpx;

                image {
                  width: 100%;
                  height: 100%;
                }
              }

              .item-poster-nocheck {
                width: 30rpx;
                height: 30rpx;
                box-sizing: border-box;
                border: 2rpx solid #ff6701;
                background: #fff;
                position: absolute;
                top: 20rpx;
                right: 20rpx;
                border-radius: 8rpx;
              }
            }

            .item-name {
              font-size: 28rpx;
              font-weight: bold;
              color: #000;
            }

            .item-time {
              font-size: 24rpx;
              color: gray;
              padding-top: 6rpx;
            }
          }

          &:nth-child(2n + 1) {
            margin-left: 0;
          }
        }
      }
    }
  }

  .video-all-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24rpx;
    font-size: 32rpx;
    font-weight: bold;
    height: 120rpx;
    border-top: 2rpx solid rgb(227, 227, 227);
    box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.3);

    &__left {
      color: #2457fd;
    }

    &__right {
      color: rgb(188, 188, 188);
    }
  }
}

@media (prefers-color-scheme: dark) {
  .video-all {
    background: #1e1e20;

    ::v-deep .wil-navbar {
      .nut-navbar {
        overflow: visible;

        .nut-navbar__right {
          .nut-icon-more-x {
            color: #fff !important;
          }
        }
      }
    }

    .video-all-list {
      ::v-deep .load-list {
        .list-container {
          .list-item {
            .video-all-list__item {
              .item-name {
                color: #fff;
              }

              .item-time {
                color: rgb(154, 154, 154);
              }
            }
          }
        }

        .list-recent {
          .list-item {
            .video-all-list__item {
              .item-name {
                color: #fff;
              }

              .item-time {
                color: rgb(154, 154, 154);
              }
            }
          }
        }
      }
    }

    .video-all-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24rpx;
      font-size: 32rpx;
      font-weight: bold;
      height: 120rpx;
      border-top: 2rpx solid rgb(227, 227, 227);
      box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.3);

      &__left {
        color: #2457fd;
      }

      &__right {
        color: rgb(188, 188, 188);
      }
    }
  }
}
</style>
