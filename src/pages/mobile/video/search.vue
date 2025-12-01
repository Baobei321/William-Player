<template>
  <div class="video-search">
    <wil-navbar>
      <template #content>
        <nut-searchbar v-model="searchValue" placeholder="输入影片名称搜索" @search="toSearch" @clear="toCancel">
          <template #leftin>
            <nut-icon name="search" custom-color="#000"></nut-icon>
          </template>
          <template #rightout>
            <span :style="{ color: searchValue ? '#315ffd' : '#d0d0d0' }" @click="toSearch">搜索</span>
          </template>
        </nut-searchbar>
      </template>
    </wil-navbar>
    <div class="video-search-list" v-if="selectType.type == 'Emby'" v-show="listData.length">
      <wil-list :requestFn="getSearchEmbyList" :request-params="requestParams" ref="wil_list" :refresherEnabled="false"
        idKey="id" listContainerClass="list-recent" :pageSize="50" 
         @currentData="currentData">
        <template #default="item">
          <searchBox :data="item" :oldValue="oldValue" @click="toVideoDetail(item)" :isEmby="true"></searchBox>
        </template>
      </wil-list>
    </div>
    <div class="video-search-list" v-if="listData.length && selectType.type != 'Emby'">
      <searchBox :data="item" v-for="item in listData" :key="item.movieTvId" @click="toVideoDetail(item)"
        :oldValue="oldValue" :isEmby="false"></searchBox>
    </div>
    <wil-empty v-if="!listData.length" text="仅支持搜索影片名，暂不支持搜索演员"></wil-empty>
  </div>
</template>

<script setup>
import { ref } from "vue";
import wilNavbar from "@/components/mobile/wil-navbar/index.vue";
import wilEmpty from "@/components/mobile/wil-empty/index.vue";
import wilList from '@/components/mobile/wil-list/index.vue'
import { handleSeasonName } from "@/utils/scrape.js";
import { onLoad } from "@dcloudio/uni-app";
import searchBox from "./components/index-component/search-box.vue";
import { getEmbyList, setEmbyImg } from '@/utils/emby'
import dayjs from 'dayjs';

const oldValue = ref("");
const searchValue = ref("");
const listData = ref([]);

const selectType = ref({})
const selectMedia = ref({})
const wil_list = ref(null)
const requestParams = ref(null)

const toSearch = () => {
  if (oldValue.value == searchValue.value || !searchValue.value) return;
  if (selectType.value.type == 'Emby') {
    requestParams.value = {}
    wil_list.value.reload()
  } else {
    let data = uni.getStorageSync("localMovieTvData");
    let movieArr = data.movie.filter((item) => item.name.indexOf(searchValue.value) > -1);
    let tvArr = data.tv.filter((item) => item.name.indexOf(searchValue.value) > -1);
    listData.value = [...movieArr, ...tvArr];
  }
  oldValue.value = searchValue.value;
};

const toCancel = () => {
  if (selectType.value.type == 'Emby') {
    wil_list.value.clearList()
  } else {
    searchValue.value = "";
    oldValue.value = "";
    listData.value = [];
  }
};

const currentData = (data) => {
  listData.value = data.list
}

const typeMapping = {
  "Movie": "movie",
  "Series": "tv",
};

const toVideoDetail = (item) => {
  if (selectType.value.type == 'Emby') {
    uni.navigateTo({
      url: `/pages/mobile/video/emby/emby-detail?name=${handleSeasonName(item.name, true)}&type=${typeMapping[props.title]}&movieTvId=${item.id}`,
    });
  } else {
    uni.navigateTo({
      url: `/pages/mobile/video/video-detail?path=${item.path}&name=${handleSeasonName(item.name, true)}&type=${item.type == "1" ? "tv" : "movie"}&source=${JSON.stringify(item.source)}&movieTvId=${item.movieTvId}`,
    });
  }
};

//判断选择的是webdav还是天翼云盘还是夸克还是Emby
const judgeSelect = () => {
  let sourceList = uni.getStorageSync("sourceList");
  selectType.value = sourceList.find((item) => {
    let select = item.list.find((i) => i.active);
    if (select) {
      selectMedia.value = select;
      return true;
    } else {
      return false;
    }
  });
};

//emby分页查询影视
const getSearchEmbyList = async (params) => {
  let res = await getEmbyList({
    IncludeItemTypes: 'Series,Movie', Fields: 'BasicSyncInfo,CanDelete,CanDownload,PrimaryImageAspectRatio,ProductionYear,Status,EndDate',
    StartIndex: (params.pageNum - 1) * params.pageSize,
    Limit: params.pageSize,
    SortBy: 'SortName',
    SortOrder: 'Ascending',
    EnableImageTypes: 'Primary,Backdrop,Thumb',
    ImageTypeLimit: '1',
    Recursive: true,
    SearchTerm: searchValue.value,
    IncludeSearchTypes: false,
  }, selectMedia.value)
  let rows = res.Items.map(item => {
    return {
      id: item.Id, type: item.Type == 'Series' ? '1' : '0', poster: setEmbyImg(item, selectMedia.value), name: item.Name,
      releaseTime: item.ProductionYear + (item.EndDate ? `-${dayjs(item.EndDate).format('YYYY')}` : '')
    }
  })
  return { total: res.TotalRecordCount, rows }
}
judgeSelect()
</script>

<style lang="scss" scoped>
page {
  width: 100%;
  height: 100%;
}

.video-search {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  ::v-deep .wil-navbar {
    background: #fff;

    .nut-navbar {
      padding-right: 0;

      .nut-navbar__title {
        margin: 0 0 0 20rpx;
        flex: 1;
        max-width: 100%;

        .nut-searchbar {
          .nut-searchbar__search-input {
            border-radius: 12rpx;
            align-items: center;
            overflow: hidden;

            .nut-searchbar__input-bar {
              color: #000;
              min-height: 0;
            }
          }

          .nut-searchbar__search-icon {
            margin-top: -6rpx;

            span {
              font-size: 30rpx;
            }
          }

          .nut-searchbar__right-search-icon {
            margin-top: 0;
            white-space: nowrap;
          }
        }
      }
    }
  }

  ::v-deep .wil-list {
    flex: 1;
    overflow: hidden;
  }

  .video-search-list {
    padding: 24rpx 24rpx 68rpx 24rpx;
    flex: 1;
    overflow: auto;
  }
}

// @media (prefers-color-scheme: dark) {
//   .video-search {
//     ::v-deep .wil-navbar {
//       background-color: #1e1e20;

//       .nut-navbar {
//         background: #1e1e20;

//         .nut-navbar__title {
//           .nut-searchbar {
//             background: #1e1e20;

//             .nut-searchbar__search-input {
//               background: #2f2f2f;

//               .nut-searchbar__search-icon {
//                 .nut-icon-search {
//                   color: #606060 !important;
//                 }
//               }

//               .nut-searchbar__input-inner {
//                 .nut-searchbar__input-form {
//                   .uni-input-input {
//                     color: #fff;
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     }

//     .video-search-list {
//       .video-search-list__item {
//         .item-right {
//           .item-right-name {
//             color: #fff;
//           }

//           .item-right-content {
//             color: #b9b9b9;

//             .item-right-content__line {
//               background: #b9b9b9;
//             }
//           }
//         }
//       }
//     }
//   }
// }
</style>
