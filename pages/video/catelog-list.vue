<template>
  <div class="video-list">
    <load-list :requestFn="getFileList" ref="load_list" idKey="name" :pageSize="60" :responseAdapter="responseAdapter" @currentData="handleData"
      :refresher-enabled="false">
      <template #default="item">
        <nut-cell is-link :class="[item.$index==data.total-1 ? 'last-cell' : '']" @click="clickCell(item)">
          <template #title>
            {{ item.name.length>12 ? item.name.slice(0,12)+'...' : item.name}}
          </template>
          <template #icon>
            <image :src="Folder" v-if="item.type=='1'" />
            <image :src="item.thumb || videoPlayer" v-else />
          </template>
          <template #link>
            <span v-if="item.type!='1'">{{ handleSize(item.size) }}</span>
            <span v-else></span>
          </template>
        </nut-cell>
      </template>
    </load-list>
  </div>
</template>

<script setup>
import { ref } from "vue";
import loadList from "../../components/wil-list/index.vue";
import Folder from "../../static/folder.png";
import videoPlayer from "../../static/video-player.png";
import { get189Folder, getQuarkFolder } from "./components/common.js";
import { onShow, onLoad } from "@dcloudio/uni-app";

const webdavInfo = ref({});
const data = ref({});
const load_list = ref(null);

const routerParams = ref({});
const sourceList = ref([]);
const selectType = ref({});
const selectMedia = ref({});
const responseAdapter = (result) => {
  if (!result) {
    return {
      listData: [],
      listTotal: 0,
    };
  }
  return {
    listData: result.data.content || [],
    listTotal: +result.data.total,
  };
};

const judgeSelect = () => {
  sourceList.value = uni.getStorageSync("sourceList");
  selectType.value =
    sourceList.value.find((item) => {
      let select = item.list.find((i) => i.active);
      if (select) {
        selectMedia.value = select;
        return true;
      } else {
        return false;
      }
    }) || {};
};
const getFileList = async (data) => {
  judgeSelect();
  if (selectType.value.type == "WebDAV") {
    webdavInfo.value = uni.getStorageSync("webdavInfo");
    let path = "";
    path = routerParams.value.path;
    return new Promise((resolve) => {
      uni.request({
        url: "http://" + webdavInfo.value.address + ":" + webdavInfo.value.port + "/api/fs/list",
        data: JSON.stringify({ path: "/" + path, page: data.pageNum, per_page: data.pageSize, refresh: false }),
        method: "POST",
        header: { Authorization: webdavInfo.value.token, "Content-Type": "application/json" },
        success: (res) => {
          resolve(res.data);
        },
      });
    });
  } else if (selectType.value.type == "天翼云盘") {
    let res = await get189Folder({ ...data, folderId: routerParams.value.folderFileId }, selectMedia.value);
    res.fileListAO.fileList.forEach((v) => {
      v?.icon?.largeUrl ? (v.thumb = v.icon.largeUrl) : "";
      v.type = 0;
      v.folderFileId = v.id;
    });
    res.fileListAO.folderList.forEach((v) => {
      v.type = 1;
      v.folderFileId = v.id;
    });

    return { data: { content: [...res.fileListAO.folderList, ...res.fileListAO.fileList], total: res.fileListAO.count } };
  } else if (selectType.value.type == "夸克网盘") {
    let res = await getQuarkFolder({ ...data, fid: routerParams.value.folderFileId }, selectMedia.value);
    res.data.list.forEach((v) => {
      v.file_type == 0 ? (v.type = 1) : (v.type = 0);
      v.name = v.file_name;
      v.big_thumbnail ? (v.thumb = v.big_thumbnail) : "";
      v.folderFileId = v.fid;
    });
    return { data: { content: res.data.list, total: res.data.list.length } };
  }
};

//处理内存大小
const handleSize = (size) => {
  if (size == 0) return "0";
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(size) / Math.log(1024));
  const formatted = parseFloat((size / Math.pow(1024, i)).toFixed(2));
  return formatted + " " + sizes[i];
};

const handleData = (val) => {
  data.value = val;
};

const clickCell = (item) => {
  let path = "";
  path = routerParams.value.path;
  if (item.type == "1") {
    if (selectType.value.type == "WebDAV") {
      uni.navigateTo({
        url: `/pages/video/catelog-list?path=${path}/${item.name}`,
      });
    } else if (selectType.value.type == "天翼云盘") {
      uni.navigateTo({
        url: `/pages/video/catelog-list?path=${path}/${item.name}&folderFileId=${item.folderFileId}`,
      });
    } else if (selectType.value.type == "夸克网盘") {
      uni.navigateTo({
        url: `/pages/video/catelog-list?path=${path}/${item.name}&folderFileId=${item.folderFileId}`,
      });
    }
  } else {
    let type = "";
    if (path.indexOf("电视剧") > -1) {
      type = "tv";
    } else if (path.indexOf("电影") > -1) {
      type = "movie";
    }
    uni.navigateTo({
      url: `/pages/video/video-player?path=${path}/${item.name}&type=${type}&noSetHistory=0&folderFileId=${item.folderFileId}`, //noSetHistory为0表示不缓存历史播放记录
    });
  }
};

onLoad((options) => {
  routerParams.value = options;
  uni.setNavigationBarTitle({
    title: routerParams.value.path.split("/")[routerParams.value.path.split("/").length - 1],
  });
});
</script>

<style lang="scss" scoped>
page {
  width: 100%;
  height: 100%;
}
.video-list {
  width: 100%;
  height: 100%;
  background: #f6f7f8;
  box-sizing: border-box;
  margin-top: 0;
  display: flex;
  flex-direction: column;
  ::v-deep .load-list {
    flex: 1;
    padding: 0 24rpx;
    padding-top: 24rpx;
    box-sizing: border-box;
    overflow: hidden;
    .list-item {
      &:first-child {
        .nut-cell {
          border-radius: 24rpx 24rpx 0 0;
        }
      }
      .nut-cell {
        margin: 0;
        padding: 24rpx;
        background: #fff;
        align-items: center;
        box-shadow: none;
        border-radius: 0;
        &::after {
          border-bottom: 2rpx solid #f5f6f7 !important;
          /* position: absolute !important;
          box-sizing: border-box !important;
          content: " " !important;
          pointer-events: none !important;
          right: 32rpx !important;
          bottom: 0 !important;
          left: 32rpx !important;
          -webkit-transform: scaleY(0.5) !important;
          -ms-transform: scaleY(0.5) !important;
          transform: scaleY(0.5) !important; */
        }
        .nut-cell__icon {
          margin-right: 16rpx;
          uni-image {
            div {
              background-size: cover !important;
            }
          }
          image {
            width: 60rpx;
            height: 60rpx;
            object-fit: cover;
          }
          img {
            width: 60rpx;
            height: 60rpx;
            object-fit: cover;
          }
        }
        .nut-cell__title {
          justify-content: center;
          font-size: 30rpx;
          color: #353a45;
          line-height: normal;

          .base-cell__title {
            display: flex;
            align-items: center;
            span:last-child {
              padding-left: 24rpx;
            }
          }
          // font-weight: bold;
        }
      }
      .last-cell {
        border-radius: 0 0 24rpx 24rpx;
        &::after {
          display: none;
        }
      }
    }
    .load-list__finished-text {
      margin-top: 24rpx;
    }
  }
}
</style>
