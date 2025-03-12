<template>
  <div class="video">
    <video-navbar @refresh="refreshVideo" :refreshData="refreshData" :loading="refreshLoading" ref="video_navbar" :tmdbKey1="tmdbKey"></video-navbar>
    <Skeleton v-if="refreshLoading"></Skeleton>
    <template v-else>
      <div class="video-container" v-if="localMovieTvData?.movie?.length || localMovieTvData?.tv?.length">
        <scroll-view :scroll-y="true" class="video-container-scroll">
          <div class="scroll-list">
            <recent-played v-if="historyPlay.length" :catchtouchmove="true"></recent-played>
            <hx-list title="电影" :listData="localMovieTvData?.movie" v-if="localMovieTvData?.movie?.length"></hx-list>
            <hx-list title="电视剧" :listData="localMovieTvData?.tv" v-if="localMovieTvData?.tv?.length"></hx-list>
            <Classify></Classify>
          </div>
        </scroll-view>
      </div>
      <div class="video-empty" v-if="!localMovieTvData?.movie?.length && !localMovieTvData?.tv?.length">
        <div class="video-empty-logo">
          <image :src="appLogo" />
          <span>William Player</span>
        </div>
        <div class="video-empty-tip">
          <div>从网盘添加资源到媒体库中</div>
          <div>即可打造私人影院，随时观看</div>
        </div>
        <nut-button custom-color="#090909" @click="toAddWebdav">
          <template #icon>
            <nut-icon name="uploader" custom-color="#fff" size="12"></nut-icon>
          </template>
          <span>添加新资源</span>
        </nut-button>
        <nut-dialog title="api_key" v-model:visible="showDialog" @cancel="onCancel" @ok="onOk">
          <nut-input v-model="tmdbKey" placeholder="请输入tmdb的api_key" />
        </nut-dialog>
      </div>
    </template>
    <wil-upgrade :updateFunction="getAppUpdateInfo" :logo="upgradeInfo.logo" :app-name=upgradeInfo.appName :enableControl="true">
    </wil-upgrade>
  </div>
</template>

<script setup>
import { ref, onBeforeMount } from "vue";
import Folder from "../../static/folder.png";
import videoNavbar from "./components/navbar.vue";
import Skeleton from "./components/skeleton.vue";
import { onShow } from "@dcloudio/uni-app";
import hxList from "./components/hx-list.vue";
import recentPlayed from "./components/recent-played.vue";
import Classify from "./components/classify.vue";
import { setTmdbKey, getUntokenDicts } from "../../network/apis";
import wilUpgrade from "../../components/wil-upgrade/index.vue";
import appLogo from "../../static/app-logo1.png";
import webdavFileIcon from "../../static/webdav-fileIcon.png";
import { loginUser, getFolder, get189Folder, getQuarkFolder } from "./components/common";

const video_navbar = ref(null);

const listData = ref([]);
const webdavInfo = ref({});
const sourceList = ref([]);
const refreshData = ref({ found: 0, toupdate: 0, updated: 0 });
const refreshLoading = ref(false);
const showDialog = ref(false);

const upgradeInfo = ref({
  logo: appLogo,
  appName: "William Player",
});

const movieTvData = ref({
  //存储电影电视剧数据
  movie: [],
  tv: [],
});

const localMovieTvData = ref({});
const tmdbKey = ref("");

const historyPlay = ref([]);

const selectMedia = ref({});
const selectType = ref({});

//通过tmdb接口获取更详细的信息
const searchMovieTv = (data, type) => {
  let url = "";
  if (type == "movie") {
    url = "https://api.tmdb.org/3/search/movie";
  } else if (type == "tv") {
    url = "https://api.tmdb.org/3/search/tv";
  }
  return new Promise((resolve, rej) => {
    uni.request({
      url: url,
      data: {
        ...data,
        language: "zh-CN",
        page: 1,
        api_key: uni.getStorageSync("tmdbKey"),
      },
      method: "GET",
      header: { "Content-Type": "application/json" },
      success: (res) => {
        resolve(res.data);
      },
    });
  });
};

//处理内存大小
const handleSize = (size) => {
  if (size == 0) return "0";
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(size) / Math.log(1024));
  const formatted = parseFloat((size / Math.pow(1024, i)).toFixed(2));
  return formatted + " " + sizes[i];
};

//groupBy视频来源，将多个网盘来的视频合成一个
const groupBySource = (arr) => {
  const map = new Map();
  arr.forEach((item) => {
    if (!map.has(removeExtension(item.name))) {
      map.set(removeExtension(item.name), {
        ...item,
        provider: null,
        source: [],
      });
    }
    map.get(removeExtension(item.name)).source.push({
      provider: item.provider,
      size: handleSize(item.size) || 0,
      path: item.path,
      folderFileId: item.id,
      name: item.name,
    });
  });
  const result = Array.from(map.values());
  return result;
};

const removeExtension = (filename) => {
  const lastDotIndex = filename.lastIndexOf(".");
  let name = lastDotIndex === -1 ? filename : filename.substring(0, lastDotIndex);
  return name;
};

const handleSeasonName = (filename) => {
  const lastDotIndex = filename.lastIndexOf(".");
  let name = lastDotIndex === -1 ? filename : filename.substring(0, lastDotIndex);
  const lastKgIndex = name.lastIndexOf(" ");
  name = lastKgIndex === -1 ? name : name.substring(0, lastKgIndex);
  return name;
};

const refreshWebDavVideo = async () => {
  refreshData.value = { found: 0, toupdate: 0, updated: 0 };
  movieTvData.value = { movie: [], tv: [] };
  if (selectMedia.value.name) {
    let res1 = await loginUser(selectMedia.value);
    selectMedia.value.token = res1.data.token;
    uni.setStorageSync("sourceList", sourceList.value);
    if (!listData.value.length) {
      let res = await getFolder({}, selectMedia.value);
      listData.value = res.data.content.map((item) => {
        if (item.type == "1") {
          item.leftIcon = Folder;
        }
        return item;
      });
    }
  }
  await getMovieTv(listData.value, "/");
  if (!movieTvData.value.movie.length && !movieTvData.value.tv.length) {
    refreshLoading.value = false;
    return;
  }
  let movie = groupBySource(movieTvData.value.movie);
  let tv = groupBySource(movieTvData.value.tv);
  compareMovieTv(movie, "movie");
  compareMovieTv(tv, "tv");
  await setMovieTvImg(movie, "movie")
    .then((res) => {
      localMovieTvData.value.movie = res;
    })
    .catch(() => {
      refreshLoading.value = false;
      showDialog.value = true;
      uni.showToast({
        title: "请填写正确的api_key",
        icon: "none",
      });
    });
  localMovieTvData.value.tv = await setMovieTvImg(tv, "tv");
  refreshData.value.updated = refreshData.value.toupdate;
  refreshData.value.toupdate = 0;
  uni.setStorageSync("localMovieTvData", localMovieTvData.value);
  refreshLoading.value = false;
};

//比较新刮削出来的影片是否已经存在或者删除，不存在就是待更新
const compareMovieTv = (arr, type) => {
  if (type == "movie") {
    const deleteNumber = localMovieTvData.value.movie?.filter((item) => arr?.every((i) => i.name != item.name))?.length || 0;
    const addNumber = arr?.filter((item) => localMovieTvData.value.movie?.every((i) => i.name != item.name))?.length || 0;
    refreshData.value.toupdate += deleteNumber + addNumber;
  } else if (type == "tv") {
    const deleteNumber = localMovieTvData.value.tv?.filter((item) => arr?.every((i) => i.name != item.name))?.length || 0;
    const addNumber = arr?.filter((item) => localMovieTvData.value.tv?.every((i) => i.name != item.name))?.length || 0;
    refreshData.value.toupdate += deleteNumber + addNumber;
  }
};

//查找网盘中的名叫电影,电视剧的文件夹
const getMovieTv = async (arr1, path1 = "/") => {
  const handleMovieTv = async (arr, path) => {
    if (!arr?.length) return;
    refreshLoading.value = true;
    for (let item of arr) {
      if (item.type != "1") continue;
      if (item.name == "电影") {
        uni.hideLoading();
        let movieResult = await getFolder({ path: path + "电影" }, selectMedia.value);
        movieResult.data.content.forEach((v) => {
          v.path = path + "电影";
          v.provider = movieResult.data.provider;
        });
        movieTvData.value.movie.push(...movieResult.data.content);
        refreshData.value.found += movieResult.data.content.length;
      }
      if (item.name == "电视剧") {
        uni.hideLoading();
        let tvResult = await getFolder({ path: path + "电视剧" }, selectMedia.value);
        tvResult.data.content.forEach((v) => {
          v.path = path + "电视剧";
          v.provider = tvResult.data.provider;
        });
        movieTvData.value.tv.push(...tvResult.data.content);
        refreshData.value.found += tvResult.data.content.length;
      }
      if (item.name != "电影" && item.name != "电视剧") {
        uni.hideLoading();
        let otherResult = await getFolder({ path: path + item.name }, selectMedia.value);
        await handleMovieTv(otherResult.data?.content, path + item.name + "/");
      }
    }
  };
  await handleMovieTv(arr1, path1);
};

//将网盘中的电影等都设置详细信息
const setMovieTvImg = async (arr, type) => {
  for (let item of arr) {
    if (showDialog.value) return;
    try {
      let res = await searchMovieTv({ query: handleSeasonName(item.name) }, type);
      let data = res.results[0];
      if (data) {
        item.poster = "https://media.themoviedb.org/t/p/w300_and_h450_bestv2" + data.poster_path;
        if (type == "movie") {
          item.releaseTime = data.release_date;
        } else if (type == "tv") {
          item.releaseTime = data.first_air_date;
        }
        item.movieTvId = data.id;
        item.genre_ids = data.genre_ids;
      } else {
        item.poster = "https://img0.baidu.com/it/u=3410216376,4211467608&fm=253&fmt=auto&app=138&f=JPEG?w=750&h=465";
        item.releaseTime = "暂无时间";
      }
    } catch (error) {
      return Promise.reject();
    }
  }
  return arr;
};

const toAddWebdav = () => {
  uni.navigateTo({
    url: "/pages/video/source-list",
  });
};

//处理添加或者修改完webdav之后自动刮削
const handleGx = async () => {
  let isreload = uni.getStorageSync("isreload");
  if (isreload) {
    uni.removeStorageSync("isreload");
    sourceList.value = uni.getStorageSync("sourceList");
    if (selectType.value.type == "WebDAV") {
      if (selectMedia.value.name) {
        let res1 = await loginUser(selectMedia.value);
        selectMedia.value.token = res1.data.token;
        uni.setStorageSync("sourceList", sourceList.value);

        uni.setStorageSync("sourceList", sourceList.value);
        let res = await getFolder({}, selectMedia.value);
        console.log(res, "res111");

        listData.value = res.data.content.map((item) => {
          if (item.type == "1") {
            item.leftIcon = Folder;
          }
          return item;
        });
      }
    }
    if (!uni.getStorageSync("tmdbKey")) {
      showDialog.value = true;
      return;
    } else {
      video_navbar.value.showProgress();
    }
  }
};

//天翼云盘refresh
const refresh189Video = async () => {
  refreshData.value = { found: 0, toupdate: 0, updated: 0 };
  movieTvData.value = { movie: [], tv: [] };
  await get189MovieTv(listData.value[0]);
  if (!movieTvData.value.movie.length && !movieTvData.value.tv.length) {
    refreshLoading.value = false;
    return;
  }
  console.log(movieTvData.value, "movieTvData");

  let movie = groupBySource(movieTvData.value.movie);
  let tv = groupBySource(movieTvData.value.tv);
  compareMovieTv(movie, "movie");
  compareMovieTv(tv, "tv");
  await setMovieTvImg(movie, "movie")
    .then((res) => {
      localMovieTvData.value.movie = res;
    })
    .catch(() => {
      refreshLoading.value = false;
      showDialog.value = true;
      uni.showToast({
        title: "请填写正确的api_key",
        icon: "none",
      });
    });
  localMovieTvData.value.tv = await setMovieTvImg(tv, "tv");
  refreshData.value.updated = refreshData.value.toupdate;
  refreshData.value.toupdate = 0;
  uni.setStorageSync("localMovieTvData", localMovieTvData.value);
  refreshLoading.value = false;
};

//查找天翼云盘中的名叫电影,电视剧的文件夹，按照此路径简单查询/我的视频/电影，/我的视频/电视剧，避免扫库有风险
const get189MovieTv = async (obj) => {
  if (!obj?.count) return;
  refreshLoading.value = true;

  let myVideo = obj.folderList.find((i) => i.name == "我的视频");
  let res1 = await get189Folder({ folderId: myVideo.id }, selectMedia.value);

  for (let item of res1.fileListAO.folderList) {
    if (item.name == "电影") {
      let movieResult = await get189Folder({ folderId: item.id }, selectMedia.value);

      movieResult.fileListAO.fileList.forEach((v) => {
        v.path = "/我的视频/电影";
        v.provider = "189CloudPC";
      });
      movieTvData.value.movie.push(...movieResult.fileListAO.fileList);
      refreshData.value.found += movieResult.fileListAO.fileList.length;
    }
    if (item.name == "电视剧") {
      let tvResult = await get189Folder({ folderId: item.id }, selectMedia.value);

      tvResult.fileListAO.folderList.forEach((v) => {
        v.path = "/我的视频/电视剧";
        v.provider = "189CloudPC";
      });
      movieTvData.value.tv.push(...tvResult.fileListAO.folderList);
      refreshData.value.found += tvResult.fileListAO.folderList.length;
    }
  }
  if (res1.fileListAO.folderList.every((i) => i.name != "电影" && i.name != "电视剧")) {
    uni.showToast({
      title: "请按照规则设置文件夹",
      icon: "none",
    });
  }
};
//夸克网盘refresh
const refreshQuarkVideo = async () => {
  refreshData.value = { found: 0, toupdate: 0, updated: 0 };
  movieTvData.value = { movie: [], tv: [] };
  await getQuarkMovieTv(listData.value[0]);
  if (!movieTvData.value.movie.length && !movieTvData.value.tv.length) {
    refreshLoading.value = false;
    return;
  }
  console.log(movieTvData.value, "movieTvData");

  let movie = groupBySource(movieTvData.value.movie);
  let tv = groupBySource(movieTvData.value.tv);
  compareMovieTv(movie, "movie");
  compareMovieTv(tv, "tv");
  await setMovieTvImg(movie, "movie")
    .then((res) => {
      localMovieTvData.value.movie = res;
    })
    .catch(() => {
      refreshLoading.value = false;
      showDialog.value = true;
      uni.showToast({
        title: "请填写正确的api_key",
        icon: "none",
      });
    });
  localMovieTvData.value.tv = await setMovieTvImg(tv, "tv");
  refreshData.value.updated = refreshData.value.toupdate;
  refreshData.value.toupdate = 0;
  uni.setStorageSync("localMovieTvData", localMovieTvData.value);
  refreshLoading.value = false;
};

//查找天翼云盘中的名叫电影,电视剧的文件夹，按照此路径简单查询/我的视频/电影，/我的视频/电视剧，避免扫库有风险
const getQuarkMovieTv = async (obj) => {
  if (!obj.list?.length) return;
  refreshLoading.value = true;
  let myVideo = obj.list.find((i) => i.file_name == "我的视频");
  let res1 = await getQuarkFolder({ fid: myVideo.fid }, selectMedia.value);

  for (let item of res1.data.list) {
    if (item.file_name == "电影") {
      let movieResult = await getQuarkFolder({ fid: item.fid }, selectMedia.value);
      movieResult.data.list = movieResult.data.list.map((v) => {
        return { id: v.fid, name: v.file_name, path: "/我的视频/电影", provider: "Quark", size: v.size };
      });
      movieTvData.value.movie.push(...movieResult.data.list);
      refreshData.value.found += movieResult.data.list.length;
    }
    if (item.file_name == "电视剧") {
      let tvResult = await getQuarkFolder({ fid: item.fid }, selectMedia.value);

      tvResult.data.list = tvResult.data.list.map((v) => {
        return { id: v.fid, name: v.file_name, path: "/我的视频/电视剧", provider: "Quark", size: v.size };
      });
      movieTvData.value.tv.push(...tvResult.data.list);
      refreshData.value.found += tvResult.data.list.length;
    }
  }
  if (res1.data.list.every((i) => i.file_name != "电影" && i.file_name != "电视剧")) {
    uni.showToast({
      title: "请按照规则设置文件夹",
      icon: "none",
    });
  }
};

const refreshVideo = () => {
  if (selectType.value.type == "WebDAV") {
    refreshWebDavVideo();
  } else if (selectType.value.type == "天翼云盘") {
    refresh189Video();
  } else if (selectType.value.type == "夸克网盘") {
    refreshQuarkVideo();
  }
};

const onCancel = () => {
  showDialog.value = false;
  tmdbKey.value = "";
};

const onOk = async () => {
  showDialog.value = false;
  uni.setStorageSync("tmdbKey", tmdbKey.value);
  await setTmdbKey({ tmdbKey: tmdbKey.value });
  video_navbar.value.showProgress();
};

//获取应用更新信息
const getAppUpdateInfo = async () => {
  let res = await getUntokenDicts("app_version");
  return res;
};

//判断选择的是webdav还是天翼云盘还是夸克
const judgeSelect = () => {
  sourceList.value = uni.getStorageSync("sourceList");
  selectType.value =
    sourceList.value.find((item) => {
      let select = item.list.find((i) => i.active);
      if (select) {
        selectMedia.value.name && selectMedia.value.name != select.name ? uni.setStorageSync("historyPlay", []) : "";
        selectMedia.value = select;
        return true;
      } else {
        return false;
      }
    }) || {};
};

onShow(async () => {
  sourceList.value = uni.getStorageSync("sourceList");
  if (!sourceList.value) {
    sourceList.value = [
      { type: "WebDAV", list: [], img: webdavFileIcon },
      {
        type: "天翼云盘",
        list: [],
        img: "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/8c/87/69/8c8769f2-6bfa-19b2-53a4-9e10a555deb3/AppIcon-0-0-1x_U007emarketing-0-7-0-0-sRGB-85-220.png/350x350.png",
      },
      {
        type: "夸克网盘",
        list: [
          // {
          //   name: "13396921269",
          //   Cookie:
          //     "b-user-id=fb9edea3-84d9-c5a7-2568-231d5d3bf606; tfstk=g2Hqfl6ElKp2Z91R-u2NafCMdnFvfRo2R-D_jlmtXG40nRwZ_zoNGnFslbzZzzBbonU0b5rTms4gIPXuQP48Cmab54zikVrsGAoOQlmiWnU6D3ixDReMRewwdmnY2scIHHNcrTm8fOx7iPi2xWyMRe9WdmnYBR0X-rvf40480oqiSs4k4lrUSR40safuxz4gIVVGEuqUmlX0IlXk4lUuSR2iS0chImmGUkNDbuNdITfArezimzWGIx2TiPS0PuEoUoP4-pUPIlDz0SzncxgvKDEoFYPQNGTaEDhSouyeFs2n4f0EtVdCw-oiiVFrkUCzPbcSjPVhmt2qsqHaMjS9v02myXULiQL84xMQ_yFPu9zsHqMzTvYlUunSAxF-Qe7uWjZLEkiv3TynmljPZNEl8eDtgNfgiOZzR3-PD-axRn3Anp1O672L4ytbc1fGJ9B1gAtf61FuwuzBcr1..; isg=BHt7v3jTmEJKo6SdslLjdmdICV_l0I_SkU1g320513qRzJiu9KCwIoFF5uyCd-fK; __sdid=AATbhJoRI0wC9Sytdqbj65miEu/G7tpLFZYDqyzktsV/TxJJWHgE26u078znMadenWI=; _UP_A4A_11_=wb9c61d27a5d456882b09f54dceed023; _UP_D_=pc; __pus=6ace96b097c34b0b9844df0432db09fdAATZtLec06C6CRqHhk6XyEeSx3Kb5WK71A5F9rQ4Y2ltXZdBCzTBCqStFnVzW+p4GrKPAbCgi0k08RlP64m8N42S; __kp=b517b620-f57a-11ef-bff3-49922a837aa1; __kps=AASzysrcrHGhp/zjlNK1Fny/; __ktd=5zoFeN+pioKJnIL5MjA2hA==; __uid=AASzysrcrHGhp/zjlNK1Fny/; __puus=1bf55253e736f7aa526417e1b8b523b9AATQRt0EI9lB70lR9UJhHmCNZywV3iwCg1AWFAyQ+0oDehlNle8oa/Qd4KVMS6MX92OuXn/BgTvwXopVLIeVdY+t2cM+PqG3QDp2Zr9e7pnirVOeH1MDAH/szXLLao96f7f5TCResPUjb2mOUIZuzLox3AI4ecyXxwzMnZFjOXNnORBNHp7/rK+UhqgP8N12EhbHJp7+E2gSCACm84KOMN7M; xlly_s=1",
          // },
        ],
        img: "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/60/6f/e5/606fe5ab-3bfb-c5e4-5bed-08c9b2b5188f/AppIcon-0-0-1x_U007emarketing-0-7-0-0-85-220.png/350x350.png?",
      },
    ];
    uni.setStorageSync("sourceList", sourceList.value);
  }
  judgeSelect();
  tmdbKey.value = uni.getStorageSync("tmdbKey") || "";
  historyPlay.value = uni.getStorageSync("historyPlay") || [];
  webdavInfo.value = uni.getStorageSync("webdavInfo");
  localMovieTvData.value = uni.getStorageSync("localMovieTvData") || {};
  if (selectType.value.type == "WebDAV") {
    handleGx();
  } else if (selectType.value.type == "天翼云盘") {
    let isreload = uni.getStorageSync("isreload");
    if (isreload) {
      uni.removeStorageSync("isreload");
      let res = await get189Folder({ folderId: "-11" }, selectMedia.value);
      listData.value = [res.fileListAO];
      if (!uni.getStorageSync("tmdbKey")) {
        showDialog.value = true;
        return;
      } else {
        video_navbar.value.showProgress();
      }
    }
  } else if (selectType.value.type == "夸克网盘") {
    let isreload = uni.getStorageSync("isreload");
    if (isreload) {
      uni.removeStorageSync("isreload");
      let res = await getQuarkFolder({ fid: "0" }, selectMedia.value);
      listData.value = [res.data];
      if (!uni.getStorageSync("tmdbKey")) {
        showDialog.value = true;
        return;
      } else {
        video_navbar.value.showProgress();
      }
    }
  }
  //初始化资源库列表
});

onBeforeMount(async () => {
  judgeSelect();
  if (selectType.value.type == "WebDAV") {
    if (selectMedia.value.name) {
      let res1 = await loginUser(selectMedia.value);
      selectMedia.value.token = res1.data.token;
      uni.setStorageSync("sourceList", sourceList.value);

      let res = await getFolder({}, selectMedia.value);
      listData.value = res.data.content.map((item) => {
        if (item.type == "1") {
          item.leftIcon = Folder;
        }
        return item;
      });
    }
  } else if (selectType.value.type == "天翼云盘") {
    if (selectMedia.value.name) {
      let res = await get189Folder({ folderId: "-11" }, selectMedia.value);
      listData.value = [res.fileListAO];
    }
  } else if (selectType.value.type == "夸克网盘") {
    if (selectMedia.value.name) {
      let res = await getQuarkFolder({ fid: "0" }, selectMedia.value);
      listData.value = [res.data];
    }
  }
});
</script>

<style lang="scss" scoped>
page {
  width: 100%;
  height: 100%;
}

.video {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f6f7f8;
  box-sizing: border-box;

  .video-container {
    flex: 1;
    overflow: hidden;
    // padding: 0 12px;
    width: 100%;
    box-sizing: border-box;
    position: relative;
    z-index: 1;

    .video-container-scroll {
      width: 100%;
      height: 100%;

      .scroll-list {
        padding: 40rpx 24rpx;
        box-sizing: border-box;

        .hxList:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  .video-empty {
    width: 100%;
    flex: 1;
    position: relative;
    z-index: 1;
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .video-empty-logo {
      display: flex;
      flex-direction: column;
      align-items: center;

      image {
        width: 140rpx;
        height: 140rpx;
      }

      span {
        font-size: 36rpx;
        font-weight: bold;
        color: #000;
      }
    }

    .video-empty-tip {
      padding: 60rpx 0 40rpx 0;
      text-align: center;
    }

    ::v-deep .nut-button {
      border-radius: 12rpx;
    }

    // .nut-overlay{
    //   background: transparent;
    // }
    ::v-deep .nut-popup--center {
      background: #315ffd;

      .nut-dialog {
        background: #315ffd;

        .nut-dialog__header {
          color: #fff;
        }

        .nut-dialog__content {
          .nut-input {
            input {
              color: #000;
            }
          }
        }

        .nut-dialog__footer {
          .nut-dialog__footer-cancel {
            border: none;
            color: #000;
          }

          .nut-dialog__footer-ok {
            background: #27c530;
          }
        }
      }
    }
  }
}
</style>
