<template>
  <div class="video-detail" :style="{overflow:showPopover?'hidden':'auto'}">
    <wil-navbar style="position: fixed;z-index: 999;" arrow-color="#fff">
      <template #right>
        <nut-icon name="more-x" custom-color="#fff" size="20" @click="showPopover=true"></nut-icon>
        <nut-transition :show="showPopover" name="fade" :duration="200">
          <div class="more-arrow"></div>
          <div class="more-popover">
            <div class="more-popover-item" @click="toSelect(item)" v-for="item in popoverArr" :key="item.text">
              <image :src="item.icon"></image>
              <span class="more-popover-item__text">{{ item.text }}</span>
            </div>
          </div>
        </nut-transition>
        <nut-overlay v-model:visible="showPopover" :z-index="2000" :lock-scroll="true"></nut-overlay>
      </template>
    </wil-navbar>
    <div class="video-detail-container">
      <div class="video-detail-container__img" :style="{backgroundImage:`url(${imgData.img})`}">
        <div class="img-container">
          <div class="img-title">{{ imgData.title }}</div>
          <div class="img-mid">
            <div class="img-mid-score">
              <image src="@/static/star-fill.png"></image>
              <span>{{ imgData.score }}</span>
            </div>
            <div class="img-mid-date">
              <image src="@/static/date-icon.png"></image>
              <span>{{ imgData.releaseTime }}</span>
            </div>
            <div class="img-mid-runtime">
              <image src="@/static/clock-icon.png" v-if="routerParams.type == 'movie'"></image>
              <span>{{ imgData.runtime }}</span>
            </div>
          </div>
          <div class="img-bottom">
            <span class="img-bottom-genres">{{ imgData.genres }}</span>
            <span v-if="routerParams.type == 'movie'" class="img-bottom-size">{{ selectSource.size }}</span>
          </div>
        </div>
      </div>
      <div class="video-detail-container__content">
        <nut-button custom-color="#090909" @click="clickPlayButton">
          <template #icon>
            <image src="/static/play.png" />
          </template>
          <span>{{ buttonText }}</span>
        </nut-button>
        <!-- 电影专用 -->
        <div class="movie-version" v-if="routerParams.type=='movie'">
          <div class="movie-version-title">影片版本</div>
          <scroll-view class="movie-version-scroll" :scroll-x="true" style="width: 100%" :enhanced="true" :showScrollbar="false">
            <div class="movie-version-list">
              <div :class="['movie-version-list__item',item.provider==selectSource.provider ? 'movie-version-list__active' : '']" v-for="item in sourceList"
                :key="item.provider" @click="changeSource(item)">
                {{ item.sourceName }}
              </div>
            </div>
          </scroll-view>
        </div>
        <!-- 电视专用 -->
        <div class="tv-version" v-if="routerParams.type=='tv'">
          <div class="tv-version-tabs">
            <nut-tabs v-model="activeTab" :title-scroll="true" custom-color="#090909" background="#fff" @change="changeTvSource">
              <nut-tab-pane :title="item.sourceName" :pane-key="item.provider" v-for="item in sourceList" :key="item.provider"></nut-tab-pane>
            </nut-tabs>
            <div class="tv-version-tabs__disabled" v-if="!tvList.length&&!showRehandleButton" @click="disabledTip"></div>
          </div>
          <scroll-view class="tv-version-scroll" :scroll-x="true" style="width: 100%" :enhanced="true" :showScrollbar="false">
            <div class="tv-version-list" v-if="tvList.length">
              <div class="tv-version-list__item" v-for="(item,index) in tvList" :key="item.name" @click="toPlayVideo(item,index)">
                <div class="item-img" :style="{backgroundImage:`url(${item.poster || imgData.img})`}">
                  <image src="/static/playVideo-button.png" />
                  <span class="item-img-runtime">{{ item.runtime }}</span>
                  <div class="item-img-process" :style="{width:Number(historyTv.initialTime)/(Number(parseTime(item.runtime))*0.6)+'%'}" v-if="index+1==historyTv.ji">
                  </div>
                </div>
                <div class="item-title">{{ index+1+'.'+item.title }}</div>
              </div>
            </div>
            <div class="tv-version-empty" v-else>
              <nut-button custom-color="#090909" v-if="showRehandleButton" @click="reHandleTv">重新加载</nut-button>
              <span v-else>加载中...</span>
            </div>
          </scroll-view>
        </div>
        <div class="story-introduction">
          <div class="story-introduction-title">剧情简介</div>
          <div class="story-introduction-text">{{ overview }}</div>
        </div>
        <div class="related-actors">
          <div class="related-actors-title">相关演员</div>
          <scroll-view class="related-actors-scroll" :scroll-x="true" style="width: 100%" :enhanced="true" :showScrollbar="false">
            <div class="related-actors-list">
              <div class="related-actors-list__item" v-if="director.name">
                <image class="item-avatar"
                  :src="director.profile_path ? 'https://media.themoviedb.org/t/p/w100_and_h100_bestv2' + director.profile_path : 'https://szrcapi.mouldsdata.com/minio/tzgcs/2024/06/13/6aab190d557c47ddb18f89755a3a7732.png'"
                  mode="aspectFill" />
                <div class="item-name">{{director.name}}</div>
                <div class="item-job">导演</div>
              </div>
              <div class="related-actors-list__item" v-for="item in actors" :key="item.name">
                <image class="item-avatar"
                  :src="item.profile_path?'https://media.themoviedb.org/t/p/w100_and_h100_bestv2'+item.profile_path :'https://szrcapi.mouldsdata.com/minio/tzgcs/2024/06/13/6aab190d557c47ddb18f89755a3a7732.png'"
                  mode="aspectFill" />
                <div class="item-name">{{item.name}}</div>
                <div class="item-role">饰 {{ item.character }}</div>
              </div>
            </div>
          </scroll-view>
        </div>
        <div class="tip-footer">
          <span class="tip-footer-name">{{ selectSource.name+' ' }}</span>
          <span class="tip-footer-webdav">路径：{{ selectSource.path }}</span>
          <div class="tip-footer-timesize">
            <span v-if="imgData.runtime">{{ imgData.runtime }}</span><span>{{ selectSource.sourceName }}</span><span
              v-if="routerParams.type=='movie' ? selectSource.size : tvList[0]?.size">{{ routerParams.type=='movie' ? selectSource.size : handleSize(tvList[0]?.size) }}</span>
          </div>
        </div>
      </div>
      <nut-popup v-model:visible="showTimePicker" round position="center">
        <nut-picker v-model="pickerVal" :columns="pickerColumns" :title="pickerTitle" @confirm="confirmPicker" @cancel="showTimePicker = false" />
      </nut-popup>
    </div>
  </div>
</template>

<script setup>
import { onBeforeMount, ref } from "vue";
import wilNavbar from "@/components/wil-navbar/index.vue";
import { useDict } from "../../utils/useDict";
import { loginUser, getFolder, handleSecond, get189Folder, getQuarkFolder, parseTime, getTvSeason, calTime } from "./components/common";
import { onShow, onLoad } from "@dcloudio/uni-app";
import editIcon from "@/static/edit_icon.png";
import timeIcon from "@/static/time_icon.png";
import { toStringfy } from "../mine/common";

const { getUntokenDict } = useDict();
const showPopover = ref(false);
const popoverArr = ref([{ icon: editIcon, text: "手动编辑" }]);

const showTimePicker = ref(false);
const pickerTitle = ref("");
const pickerVal = ref(["0", "0"]);
const pickerColumns = ref([[], []]);

const imgData = ref({}); //图片内的信息
const overview = ref(""); //剧情简介

const sourceList = ref([]);
const selectSource = ref({}); //切换选中的来源

const director = ref({});
const actors = ref([]);

const activeTab = ref("");

const tvList = ref([]); //目前网盘所拥有的电视集数列表

const historyPlay = ref(uni.getStorageSync("historyPlay") || []); //历史播放
const buttonText = ref("播放");

const routerParams = ref({});
const selectMedia = ref({});
const selectType = ref({});
const nowSourceList = ref([]);

const showRehandleButton = ref(false);
const historyTv = ref({});

const localMovieTvData = ref({});

const toSelect = (item) => {
  if (item.text == "手动编辑") {
    showPopover.value = false;
    uni.navigateTo({
      url: `/pages/video/search-match?type=${routerParams.value.type}`,
    });
  } else if (item.text == "设置跳过片头时间") {
    let localMovieTvData = uni.getStorageSync("localMovieTvData");
    let nowTv = localMovieTvData.tv.find((i) => i.movieTvId == routerParams.value.movieTvId);
    if (nowTv.openingTime) {
      const minutes = String(Math.floor(nowTv.openingTime / 60)); // 取整分钟数
      const remainingSeconds = String(nowTv.openingTime % 60); // 剩余秒数
      pickerVal.value = [minutes, remainingSeconds];
    } else {
      pickerVal.value = ["0", "0"];
    }
    showPopover.value = false;
    pickerTitle.value = item.text;
    let arr1 = [];
    let arr2 = [];
    for (let i = 0; i <= 15; i++) {
      arr1.push({ text: String(i) + "分", value: String(i) });
    }
    for (let i = 0; i <= 59; i++) {
      arr2.push({ text: String(i) + "秒", value: String(i) });
    }
    pickerColumns.value[0] = arr1;
    pickerColumns.value[1] = arr2;
    showTimePicker.value = true;
  } else if (item.text == "设置跳过片尾时间") {
    let localMovieTvData = uni.getStorageSync("localMovieTvData");
    let nowTv = localMovieTvData.tv.find((i) => i.movieTvId == routerParams.value.movieTvId);
    if (nowTv.endTime) {
      const minutes = String(Math.floor(nowTv.endTime / 60)); // 取整分钟数
      const remainingSeconds = String(nowTv.endTime % 60); // 剩余秒数
      pickerVal.value = [minutes, remainingSeconds];
    } else {
      pickerVal.value = ["15", "0"];
    }
    showPopover.value = false;
    pickerTitle.value = item.text;
    let arr1 = [];
    let arr2 = [];
    for (let i = 15; i <= 180; i++) {
      arr1.push({ text: String(i) + "分", value: String(i) });
    }
    for (let i = 0; i <= 59; i++) {
      arr2.push({ text: String(i) + "秒", value: String(i) });
    }
    pickerColumns.value[0] = arr1;
    pickerColumns.value[1] = arr2;
    showTimePicker.value = true;
  }
};

const confirmPicker = ({ selectedValue, selectedOptions }) => {
  let time = Number(selectedValue[0]) * 60 + Number(selectedValue[1]);
  let localMovieTvData = uni.getStorageSync("localMovieTvData");
  let nowTv = localMovieTvData.tv.find((i) => i.movieTvId == routerParams.value.movieTvId);
  if (pickerTitle.value == "设置跳过片头时间") {
    nowTv.openingTime = time;
    console.log(selectedValue, "片头事件");
  } else if (pickerTitle.value == "设置跳过片尾时间") {
    nowTv.endTime = time;
  }
  uni.setStorageSync("localMovieTvData", localMovieTvData);
  showTimePicker.value = false;
};

//通过tmdb接口获取更详细的信息
const getMovieTvById = (data, type) => {
  let url = "";
  let obj = JSON.parse(JSON.stringify(data));
  if (type == "movie") {
    url = `https://api.tmdb.org/3/movie/${obj.movieTvId}`;
  } else if (type == "tv") {
    url = `https://api.tmdb.org/3/tv/${obj.movieTvId}`;
  }
  delete obj.movieTvId;
  return new Promise((resolve) => {
    uni.request({
      url: url,
      data: {
        ...obj,
        language: "zh-CN",
        api_key: uni.getStorageSync("settingData").tmdbKey,
      },
      method: "GET",
      header: {
        "Content-Type": "application/json",
      },
      success: (res) => {
        resolve(res.data);
      },
    });
  });
};

//获取演员表
const getActorById = (data, type) => {
  let url = "";
  let obj = JSON.parse(JSON.stringify(data));
  if (type == "movie") {
    url = `https://api.tmdb.org/3/movie/${obj.movieTvId}/credits`;
  } else if (type == "tv") {
    url = `https://api.tmdb.org/3/tv/${obj.movieTvId}/credits`;
  }
  return new Promise((resolve) => {
    uni.request({
      url: url,
      data: {
        language: "zh-CN",
        api_key: uni.getStorageSync("settingData").tmdbKey,
      },
      method: "GET",
      header: {
        "Content-Type": "application/json",
      },
      success: (res) => {
        resolve(res.data);
      },
    });
  });
};

//处理电视的详情和剧集等
const handleTv = async () => {
  showRehandleButton.value = false;
  let season = "";
  if (localMovieTvData.value.tv) {
    season = localMovieTvData.value.tv.find((i) => i.movieTvId == routerParams.value.movieTvId).season;
  } else {
    const numberMapping = {
      "一": "1",
      "二": "2",
      "三": "3",
      "四": "4",
      "五": "5",
      "六": "6",
      "七": "7",
      "八": "8",
    };
    const match = imgData.value.title.match(/第(.*?)季/);
    season = match ? numberMapping[match[1]] : "1";
  }
  let res1 = await getTvSeason({
    movieTvId: routerParams.value.movieTvId,
    season: season,
  });
  let result = {};
  if (selectType.value.type == "WebDAV") {
    imgData.value.releaseTime = res1.air_date;
    imgData.value.runtime ? "" : (imgData.value.runtime = `共${res1.episodes.length}集（库中有0集）`);
    try {
      result = await getFolder(
        {
          path: selectSource.value.path,
        },
        selectMedia.value
      );
    } catch (error) {
      showRehandleButton.value = true;
      return;
    }
    //对电视进行排序
    tvList.value = result.data.content.sort((a, b) => {
      const regex = /S\d{2}E\d{2}/;
      const regex1 = /\d+/;
      if (a.name.match(regex)) {
        let aName = a.name.match(regex)[0];
        let bName = b.name.match(regex)[0];
        const numA = parseInt(aName.slice(-2), 10);
        const numB = parseInt(bName.slice(-2), 10);
        return numA - numB;
      } else if (a.name.match(regex1)) {
        let aName = a.name.match(regex1)[0];
        let bName = b.name.match(regex1)[0];
        const numA = parseInt(aName.slice(-2), 10);
        const numB = parseInt(bName.slice(-2), 10);
        return numA - numB;
      }
    });
    imgData.value.runtime = `共${res1.episodes.length}集（库中有${result.data.total || 0}集）`;
  } else if (selectType.value.type == "天翼云盘") {
    imgData.value.releaseTime = res1.air_date;
    imgData.value.runtime ? "" : (imgData.value.runtime = `共${res1.episodes.length}集（库中有0集）`);
    try {
      result = await get189Folder(
        {
          folderId: selectSource.value.folderFileId,
        },
        selectMedia.value
      );
    } catch (error) {
      showRehandleButton.value = true;
      return;
    }
    //对电视进行排序
    tvList.value = result.fileListAO.fileList.sort((a, b) => {
      const regex = /S\d{2}E\d{2}/;
      const regex1 = /\d+/;
      if (a.name.match(regex)) {
        let aName = a.name.match(regex)[0];
        let bName = b.name.match(regex)[0];
        const numA = parseInt(aName.slice(-2), 10);
        const numB = parseInt(bName.slice(-2), 10);
        return numA - numB;
      } else if (a.name.match(regex1)) {
        let aName = a.name.match(regex1)[0];
        let bName = b.name.match(regex1)[0];
        const numA = parseInt(aName.slice(-2), 10);
        const numB = parseInt(bName.slice(-2), 10);
        return numA - numB;
      }
    });
    imgData.value.runtime = `共${res1.episodes.length}集（库中有${result.fileListAO.count || 0}集）`;
  } else if (selectType.value.type == "夸克网盘") {
    imgData.value.releaseTime = res1.air_date;
    imgData.value.runtime ? "" : (imgData.value.runtime = `共${res1.episodes.length}集（库中有0集）`);
    try {
      result = await getQuarkFolder(
        {
          fid: selectSource.value.folderFileId,
        },
        selectMedia.value
      );
    } catch (error) {
      showRehandleButton.value = true;
      return;
    }
    //对电视进行排序
    tvList.value = result.data.list
      .sort((a, b) => {
        const regex = /S\d{2}E\d{2}/;
        const regex1 = /\d+/;
        if (a.file_name.match(regex)) {
          let aName = a.file_name.match(regex)[0];
          let bName = b.file_name.match(regex)[0];
          const numA = parseInt(aName.slice(-2), 10);
          const numB = parseInt(bName.slice(-2), 10);
          return numA - numB;
        } else if (a.file_name.match(regex1)) {
          let aName = a.file_name.match(regex1)[0];
          let bName = b.file_name.match(regex1)[0];
          const numA = parseInt(aName.slice(-2), 10);
          const numB = parseInt(bName.slice(-2), 10);
          return numA - numB;
        }
      })
      .map((i) => {
        return {
          id: i.fid,
          name: i.file_name,
          path: "/我的视频/电视剧",
          provider: "Quark",
        };
      });

    imgData.value.runtime = `共${res1.episodes.length}集（库中有${result.data.list?.length || 0}集）`;
  }
  //处理现有的集数，将tmdb的封面，时长都设置进去，还有每一集的标题
  tvList.value.forEach((v, vindex) => {
    v.title = res1.episodes[vindex]?.name || "暂无标题";
    v.poster = res1.episodes[vindex]?.still_path ? "https://media.themoviedb.org/t/p/w533_and_h300_bestv2" + res1.episodes[vindex]?.still_path : "";
    v.runtime = res1.episodes[vindex]?.runtime ? calTime(res1.episodes[vindex]?.runtime, "en") : "00:00";
  });
};

const getMovieTvDetail = async () => {
  let res = await getMovieTvById(
    {
      movieTvId: routerParams.value.movieTvId,
    },
    routerParams.value.type
  );
  if (routerParams.value.type == "movie") {
    imgData.value = {
      img: "https://media.themoviedb.org/t/p/w1920_and_h1080_bestv2" + res.backdrop_path,
      score: res.vote_average.toFixed(1),
      releaseTime: res.release_date,
      runtime: calTime(res.runtime),
      runtimeEn: calTime(res.runtime, "en"),
      genres: res.genres.map((i) => i.name).join(" "),
      title: res.title,
    };
  } else if (routerParams.value.type == "tv") {
    imgData.value.title = routerParams.value.name;
    handleTv();
    imgData.value.img = "https://media.themoviedb.org/t/p/w1920_and_h1080_bestv2" + res.backdrop_path;
    imgData.value.score = res.vote_average.toFixed(1);
    imgData.value.genres = res.genres.map((i) => i.name).join(" ");
  }
  overview.value = res.overview;
  return res;
};

const getActorList = async () => {
  let res = await getActorById(
    {
      movieTvId: routerParams.value.movieTvId,
    },
    routerParams.value.type
  );
  director.value = res.crew[0] || {};
  actors.value = res.cast.slice(0, 20);
};

//切换电影视频源
const changeSource = (item) => {
  selectSource.value = item;
  setButtonText();
};

//切换电视视频源
const changeTvSource = (obj) => {
  selectSource.value = sourceList.value.find((i) => i.provider == obj.paneKey);
  handleTv();
};

//电视集数还在加载中，点击提示
const disabledTip = () => {
  uni.showToast({
    title: "等待加载完成后，再继续操作",
    icon: "none",
  });
};

//裁剪格式获取电影名
const getMovieName = (val) => {
  const lastDotIndex = val.lastIndexOf(".");
  let name = lastDotIndex === -1 ? val : val.substring(0, lastDotIndex);
  return name;
};

//点击播放按钮
const clickPlayButton = () => {
  if (routerParams.value.type == "movie") {
    let history = historyPlay.value?.find((i) => getMovieName(i.name) == getMovieName(imgData.value.title));
    if (history) {
      if (selectType.value.type == "WebDAV") {
        uni.navigateTo({
          url: `/pages/video/video-player?path=${selectSource.value.path.slice(1)}&type=movie`,
        });
      } else {
        uni.navigateTo({
          url: `/pages/video/video-player?path=${selectSource.value.path.slice(1)}&folderFileId=${selectSource.value.folderFileId}&type=movie`,
        });
      }
    } else {
      let historyItem = {
        path: `${selectSource.value.path.slice(1)}`,
        poster: imgData.value.img,
        type: "movie",
        name: selectSource.value.name,
        runtime: imgData.value.runtimeEn,
        title: selectSource.value.name,
        initialTime: "0",
      };
      if (selectType.value.type == "WebDAV") {
        uni.navigateTo({
          url: `/pages/video/video-player?path=${selectSource.value.path.slice(1)}&item=${JSON.stringify(historyItem)}&type=movie`,
        });
      } else {
        historyItem.folderFileId = selectSource.value.folderFileId;
        uni.navigateTo({
          url: `/pages/video/video-player?path=${selectSource.value.path.slice(1)}&folderFileId=${selectSource.value.folderFileId}&item=${JSON.stringify(historyItem)}&type=movie`,
        });
      }
    }
  } else if (routerParams.value.type == "tv") {
    if (!tvList.value.length) {
      uni.showToast({
        title: "请查看网盘是否登录或者webdav是否已经开启！",
        icon: "none",
      });
      return;
    }
    uni.setStorageSync("tvList", tvList.value);
    let localMovieTvData = uni.getStorageSync("localMovieTvData");
    let nowTv = localMovieTvData.tv.find((i) => i.movieTvId == routerParams.value.movieTvId);
    let history = historyPlay.value?.find((i) => i.titlePlay == imgData.value.title);
    if (history) {
      let openEndTime = {};
      nowTv.openingTime >= 0 ? (openEndTime.openingTime = nowTv.openingTime) : "";
      nowTv.endTime >= 0 ? (openEndTime.endTime = nowTv.endTime) : "";
      if (selectType.value.type == "WebDAV") {
        uni.navigateTo({
          url: `/pages/video/video-player?path=${selectSource.value.path.slice(1)}/${history.name}&type=tv${toStringfy(openEndTime) ? "&" + toStringfy(openEndTime) : ""}`,
        });
      } else {
        uni.navigateTo({
          url: `/pages/video/video-player?path=${selectSource.value.path.slice(1)}/${history.name}&folderFileId=${history.folderFileId}&type=tv${toStringfy(openEndTime) ? "&" + toStringfy(openEndTime) : ""}`,
        });
      }
    } else {
      let historyItem = {
        path: `${selectSource.value.path.slice(1)}/${tvList.value[0].name}`,
        titlePlay: imgData.value.title,
        ji: "1",
        poster: tvList.value[0].poster || imgData.value.img,
        type: "tv",
        name: tvList.value[0].name,
        runtime: tvList.value[0].runtime,
        title: tvList.value[0].title,
        initialTime: "0",
      };
      let openEndTime = {};
      nowTv.openingTime >= 0 ? (openEndTime.openingTime = nowTv.openingTime) : "";
      nowTv.endTime >= 0 ? (openEndTime.endTime = nowTv.endTime) : "";
      if (selectType.value.type == "WebDAV") {
        uni.navigateTo({
          url: `/pages/video/video-player?path=${selectSource.value.path.slice(1)}/${tvList.value[0].name}&item=${JSON.stringify(historyItem)}&type=tv${toStringfy(openEndTime) ? "&" + toStringfy(openEndTime) : ""}`,
        });
      } else {
        historyItem.folderFileId = tvList.value[0].id;
        uni.navigateTo({
          url: `/pages/video/video-player?path=${selectSource.value.path.slice(1)}/${tvList.value[0].name}&folderFileId=${tvList.value[0].id}&item=${JSON.stringify(historyItem)}&type=tv${toStringfy(openEndTime) ? "&" + toStringfy(openEndTime) : ""}`,
        });
      }
    }
  }
};

//播放电视
const toPlayVideo = (item, index) => {
  uni.setStorageSync("tvList", tvList.value);
  let localMovieTvData = uni.getStorageSync("localMovieTvData");
  let nowTv = localMovieTvData.tv.find((i) => i.movieTvId == routerParams.value.movieTvId);
  let history = historyPlay.value?.find((i) => i.titlePlay == selectSource.value.name && item.name == i.name);
  if (history) {
    let openEndTime = {};
    nowTv.openingTime >= 0 ? (openEndTime.openingTime = nowTv.openingTime) : "";
    nowTv.endTime >= 0 ? (openEndTime.endTime = nowTv.endTime) : "";
    if (selectType.value.type == "WebDAV") {
      uni.navigateTo({
        url: `/pages/video/video-player?path=${selectSource.value.path.slice(1)}/${item.name}&type=tv${toStringfy(openEndTime) ? "&" + toStringfy(openEndTime) : ""}`,
      });
    } else {
      uni.navigateTo({
        url: `/pages/video/video-player?path=${selectSource.value.path.slice(1)}/${item.name}&folderFileId=${item.id}&type=tv${toStringfy(openEndTime) ? "&" + toStringfy(openEndTime) : ""}`,
      });
    }
  } else {
    let historyItem = {
      path: `${selectSource.value.path.slice(1)}/${item.name}`,
      titlePlay: imgData.value.title,
      ji: String(index + 1),
      poster: item.poster || imgData.value.img,
      type: "tv",
      name: item.name,
      runtime: item.runtime,
      title: item.title,
      initialTime: "0",
    };
    let openEndTime = {};
    nowTv.openingTime >= 0 ? (openEndTime.openingTime = nowTv.openingTime) : "";
    nowTv.endTime >= 0 ? (openEndTime.endTime = nowTv.endTime) : "";
    if (selectType.value.type == "WebDAV") {
      console.log(toStringfy(openEndTime), "asd");

      uni.navigateTo({
        url: `/pages/video/video-player?path=${selectSource.value.path.slice(1)}/${item.name}&item=${JSON.stringify(historyItem)}&type=tv${toStringfy(openEndTime) ? "&" + toStringfy(openEndTime) : ""}`,
      });
    } else {
      historyItem.folderFileId = item.id;
      uni.navigateTo({
        url: `/pages/video/video-player?path=${selectSource.value.path.slice(1)}/${item.name}&folderFileId=${item.id}&item=${JSON.stringify(historyItem)}&type=tv${toStringfy(openEndTime) ? "&" + toStringfy(openEndTime) : ""}`,
      });
    }
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

//设置按钮文字
const setButtonText = () => {
  historyPlay.value = uni.getStorageSync("historyPlay") || [];
  if (routerParams.value.type == "movie") {
    let history = historyPlay.value?.find((i) => i.name == selectSource.value.name);
    if (history) {
      buttonText.value = "播放 " + handleSecond(history.initialTime);
    } else {
      buttonText.value = "播放";
    }
  } else if (routerParams.value.type == "tv") {
    let history = historyPlay.value?.find((i) => i.titlePlay == selectSource.value.name);
    historyTv.value = history || {};
    if (history) {
      let time = handleSecond(history.initialTime);
      buttonText.value = `第${history.ji}集 ${time}`;
    } else {
      buttonText.value = "播放";
    }
  }
};

//判断选择的是webdav还是天翼云盘还是夸克
const judgeSelect = () => {
  nowSourceList.value = uni.getStorageSync("sourceList");
  selectType.value = nowSourceList.value.find((item) => {
    let select = item.list.find((i) => i.active);
    if (select) {
      selectMedia.value = select;
      return true;
    } else {
      return false;
    }
  });
};

//重新加载电视剧集数
const reHandleTv = async () => {
  if (selectType.value.type == "WebDAV") {
    let res1 = await loginUser(selectMedia.value);
    selectMedia.value.token = res1.data.token;
    uni.setStorageSync("sourceList", nowSourceList.value);
    handleTv();
  } else {
    uni.showToast({
      title: "请重新登录网盘",
      icon: "none",
    });
  }
};

onBeforeMount(() => {
  judgeSelect();
  // historyPlay.value = uni.getStorageSync('historyPlay') || []
  getUntokenDict("online_storage_source")
    .then(async (res) => {
      sourceList.value = JSON.parse(routerParams.value.source).map((i) => {
        i.sourceName = res.online_storage_source.find((v) => v.value == i.provider).label;
        return i;
      });
      selectSource.value = sourceList.value[0];
      activeTab.value = selectSource.value.provider;
      setButtonText();
      await getMovieTvDetail();
    })
    .catch(async (error) => {
      let dict = [
        { value: "189CloudPC", label: "天翼云盘" },
        { value: "Quark", label: "夸克网盘" },
      ];
      sourceList.value = JSON.parse(routerParams.value.source).map((i) => {
        i.sourceName = dict.find((v) => v.value == i.provider).label;
        return i;
      });
      selectSource.value = sourceList.value[0];
      activeTab.value = selectSource.value.provider;
      setButtonText();
      await getMovieTvDetail();
    });
  getActorList();
});

onShow(async () => {
  setTimeout(() => {
    setButtonText();
  }, 800);
  let resetMovieTv = uni.getStorageSync("resetMovieTv");
  if (resetMovieTv) {
    judgeSelect();
    let oldMovieTvId = routerParams.value.movieTvId;
    let oldName = imgData.value.title;
    routerParams.value.type = resetMovieTv.type;
    routerParams.value.movieTvId = resetMovieTv.movieTvId;
    uni.removeStorageSync("resetMovieTv");
    selectSource.value = sourceList.value[0];
    activeTab.value = selectSource.value.provider;
    setButtonText();
    historyPlay.value = historyPlay.value.filter((i) => i.titlePlay != imgData.value.title);
    uni.setStorageSync("historyPlay", historyPlay.value);
    selectSource.value.name = resetMovieTv.name;
    localMovieTvData.value = uni.getStorageSync("localMovieTvData") || {};

    if (resetMovieTv.type == "tv") {
      let nowTv = localMovieTvData.value.tv.find((i) => i.movieTvId == oldMovieTvId && i.name == oldName);
      const numberMapping = {
        "一": "1",
        "二": "2",
        "三": "3",
        "四": "4",
        "五": "5",
        "六": "6",
        "七": "7",
      };
      const match = selectSource.value.name.match(/第(.*?)季/);
      nowTv.season = match ? numberMapping[match[1]] : "1";
      nowTv.movieTvId = routerParams.value.movieTvId;
      let res = await getMovieTvDetail();
      nowTv.poster = "https://media.themoviedb.org/t/p/w300_and_h450_bestv2" + res.poster_path;
      nowTv.releaseTime = res.first_air_date;
      nowTv.type = "1";
      nowTv.genre_ids = res.genres.map((i) => i.id);
      nowTv.overview = res.overview;
      nowTv.backdrop = "https://media.themoviedb.org/t/p/w1920_and_h1080_bestv2" + res.backdrop_path;;
      nowTv.voteAverage = res.vote_average; //评分
      nowTv.name = resetMovieTv.name;
    } else if (resetMovieTv.type == "movie") {
      let nowMovie = localMovieTvData.value.movie.find((i) => i.movieTvId == oldMovieTvId);
      let res = await getMovieTvDetail();
      nowMovie.poster = "https://media.themoviedb.org/t/p/w300_and_h450_bestv2" + res.poster_path;
      nowMovie.releaseTime = res.release_date;
      nowMovie.type = "2";
      nowMovie.movieTvId = res.id;
      nowMovie.genre_ids = res.genres.map((i) => i.id);
      nowMovie.name = res.title;
    }
    imgData.value.title = resetMovieTv.name;
    uni.setStorageSync("localMovieTvData", localMovieTvData.value);
    getActorList();
  }
});

onLoad((options) => {
  routerParams.value = options;
  if (routerParams.value.type == "movie") {
    popoverArr.value = [{ icon: editIcon, text: "手动编辑" }];
  } else if (routerParams.value.type == "tv") {
    popoverArr.value = [
      { icon: editIcon, text: "手动编辑" },
      { icon: timeIcon, text: "设置跳过片头时间" },
      { icon: timeIcon, text: "设置跳过片尾时间" },
    ];
  }
});
</script>

<style lang="scss" scoped>
page {
  width: 100%;
  height: 100%;
}

.video-detail {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background: #fff;
  ::v-deep .wil-navbar {
    .nut-navbar {
      overflow: visible;
      .nut-navbar__right {
        display: block;
        position: absolute;
        right: 0;
        display: flex;
        align-items: center;
        .nut-transition {
          position: absolute;
          top: 25px;
          right: 25%;
          z-index: 3000;
          .more-arrow {
            width: 0;
            height: 0;
            position: absolute;
            right: 14rpx;
            transform: translateY(-100%);
            border-left: 12rpx solid transparent;
            border-right: 12rpx solid transparent;
            border-bottom: 16rpx solid #fff;
          }
          .more-popover {
            width: 360rpx;
            background: #fff;
            border-radius: 16rpx;
            .more-popover-item {
              display: flex;
              align-items: center;
              padding: 16rpx 24rpx;
              image {
                width: 40rpx;
                height: 40rpx;
              }
              .more-popover-item__text {
                flex: 1;
                padding-left: 15rpx;
                color: #000;
              }
            }
          }
        }
        .nut-overlay {
          position: fixed;
          top: 0px;
          left: 0px;
          top: 0;
          left: 0;
          background: transparent;
        }
      }
    }
  }

  .video-detail-container {
    height: 100%;

    .video-detail-container__img {
      width: 100%;
      height: 840rpx;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      box-sizing: border-box;
      position: relative;

      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.1);
        z-index: 1;
      }

      .img-container {
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 100%);
        padding: 0 24rpx 30rpx 24rpx;

        .img-title {
          position: relative;
          z-index: 2;
          color: #fff;
          font-size: 42rpx;
          font-weight: bold;
        }

        .img-mid {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          padding: 30rpx 0 10px 0;

          .img-mid-score {
            display: flex;
            align-items: center;
            padding: 0 14rpx;
            padding-left: 0;
            height: 40rpx;
            position: relative;

            &::after {
              position: absolute;
              content: "";
              width: 2rpx;
              height: 24rpx;
              background-color: #c2c5c6;
              right: 0;
              top: 50%;
              transform: translateY(-50%);
            }

            image {
              width: 32rpx;
              height: 32rpx;
            }

            span {
              font-size: 28rpx;
              line-height: 15px;
              color: #c2c5c6;
              padding-left: 10rpx;
            }
          }

          .img-mid-date {
            display: flex;
            align-items: center;
            padding: 0 14rpx;
            height: 40rpx;
            position: relative;

            &::after {
              position: absolute;
              content: "";
              width: 2rpx;
              height: 24rpx;
              background-color: #c2c5c6;
              right: 0;
              top: 50%;
              transform: translateY(-50%);
            }

            image {
              width: 28rpx;
              height: 28rpx;
            }

            span {
              font-size: 28rpx;
              color: #c2c5c6;
              padding-left: 10rpx;
            }
          }

          .img-mid-runtime {
            display: flex;
            align-items: center;
            padding: 0 14rpx;
            height: 40rpx;

            image {
              width: 28rpx;
              height: 28rpx;
            }

            span {
              font-size: 28rpx;
              color: #c2c5c6;
              padding-left: 10rpx;
            }
          }
        }
      }

      .img-bottom {
        position: relative;
        z-index: 2;
        display: flex;
        align-items: baseline;

        .img-bottom-genres {
          padding: 0 14rpx;
          font-size: 28rpx;
          color: #c2c5c6;
          display: block;
          padding-left: 0;
        }

        .img-bottom-size {
          position: relative;
          padding: 0 14rpx;
          font-size: 28rpx;
          color: #c2c5c6;
          display: block;

          &::before {
            position: absolute;
            display: block;
            content: "";
            width: 3rpx;
            height: 24rpx;
            background-color: #c2c5c6;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
          }
        }
      }
    }

    .video-detail-container__content {
      padding: 24rpx 24rpx 0 24rpx;
      padding-bottom: 100rpx;

      ::v-deep .nut-button {
        width: 100%;
        border-radius: 16rpx;
        height: 100rpx;

        .nut-button__wrap {
          image {
            width: 30rpx;
            height: 30rpx;
          }

          .nut-button__text {
            margin-left: 16rpx;
          }
        }
      }

      .movie-version {
        margin-top: 50rpx;

        .movie-version-title {
          font-size: 32rpx;
          font-weight: bold;
          color: #000;
          padding-bottom: 20rpx;
        }

        .movie-version-scroll {
          .movie-version-list {
            display: flex;
            align-items: center;
            flex-wrap: nowrap;

            .movie-version-list__item {
              font-size: 28rpx;
              color: #000;
              font-weight: bold;
              padding: 12rpx 24rpx;
              border-radius: 8rpx;
              border: 2rpx solid #c2c5c6;
              margin-left: 12rpx;
              white-space: nowrap;

              &:first-child {
                margin-left: 0;
              }
            }

            .movie-version-list__active {
              color: #315ffd;
              border: 2rpx solid #315ffd;
            }
          }
        }
      }

      .tv-version {
        margin-top: 20rpx;

        ::v-deep .nut-tabs {
          &__titles {
            .nut-tabs__list {
              .nut-tabs__titles-item {
                // width: 92px;
                // flex: 0 0 92px;
                flex: 0 0 auto;
                min-width: auto;
                width: auto;
                margin-left: 30rpx;

                &:first-child {
                  margin-left: 0;
                }
              }

              .nut-tabs-active {
                color: #090909;

                .nut-tabs__titles-item__line {
                  width: 100%;
                  border-radius: 8rpx;
                  bottom: 12%;
                }
              }
            }
          }

          &__content {
            display: none;
          }
        }
        .tv-version-tabs {
          position: relative;
          .tv-version-tabs__disabled {
            position: absolute;
            width: 100%;
            height: 100%;
            left: 0;
            top: 0;
            z-index: 99;
          }
        }
        .tv-version-scroll {
          .tv-version-list {
            display: flex;
            align-items: center;
            flex-wrap: nowrap;
            width: 100%;
            height: 230rpx;
            .tv-version-list__item {
              margin-left: 24rpx;
              flex: 0 0 calc((100% - 24rpx) / 2);
              overflow: hidden;

              &:first-child {
                margin-left: 0;
              }

              .item-img {
                width: 100%;
                height: 170rpx;
                background: rgb(212, 212, 212);
                background-position: center;
                background-repeat: no-repeat;
                background-size: cover;
                border-radius: 16rpx;
                position: relative;
                overflow: hidden;

                image {
                  width: 60rpx;
                  height: 60rpx;
                  position: absolute;
                  left: 50%;
                  top: 50%;
                  transform: translate(-50%, -50%);
                }

                .item-img-runtime {
                  position: absolute;
                  right: 10rpx;
                  bottom: 10rpx;
                  background: rgba(0, 0, 0, 0.5);
                  color: #fff;
                  font-size: 24rpx;
                  border-radius: 8rpx;
                  padding: 4rpx 8rpx;
                }
                .item-img-process {
                  height: 7rpx;
                  background: #ff6701;
                  position: absolute;
                  bottom: 0;
                  left: 0;
                }
              }

              .item-title {
                font-size: 28rpx;
                color: #000;
                font-weight: bold;
                padding-top: 12rpx;
                width: 100%;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }
          }
          .tv-version-empty {
            width: 100%;
            height: 230rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            ::v-deep .nut-button {
              height: initial;
              width: initial;
            }
          }
        }
      }

      .story-introduction {
        margin-top: 50rpx;

        .story-introduction-title {
          font-size: 32rpx;
          font-weight: bold;
          color: #000;
          padding-bottom: 20rpx;
        }

        .story-introduction-text {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 28rpx;
          color: #000;
        }
      }

      .related-actors {
        margin-top: 50rpx;

        .related-actors-title {
          font-size: 32rpx;
          font-weight: bold;
          color: #000;
          padding-bottom: 20rpx;
        }

        .related-actors-scroll {
          .related-actors-list {
            display: flex;
            align-items: center;
            flex-wrap: nowrap;

            .related-actors-list__item {
              margin-left: 12rpx;
              display: flex;
              flex-direction: column;
              align-items: center;
              flex: 0 0 140rpx;
              overflow: hidden;

              &:first-child {
                margin-left: 0;
              }

              .item-avatar {
                width: 120rpx;
                height: 120rpx;
                border-radius: 50%;
              }

              .item-name {
                font-size: 28rpx;
                color: #000;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                text-align: center;
                width: 100%;
              }

              .item-job {
                padding: 4rpx 6rpx;
                border: 2rpx solid #c2c5c6;
                font-size: 20rpx;
                color: #c2c5c6;
                border-radius: 6rpx;
                height: 35rpx;
                box-sizing: border-box;
              }

              .item-role {
                height: 35rpx;
                line-height: 35rpx;
                font-size: 24rpx;
                color: #c2c5c6;
                width: 100%;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                text-align: center;
              }
            }
          }
        }
      }

      .tip-footer {
        margin-top: 50rpx;
        padding-top: 20rpx;
        border-top: 2rpx solid #c2c5c6;

        .tip-footer-name {
          font-size: 24rpx;
          color: #c2c5c6;
        }

        .tip-footer-webdav {
          font-size: 24rpx;
          color: #c2c5c6;
          padding-top: 20rpx;
        }

        .tip-footer-timesize {
          font-size: 24rpx;
          color: #acacac;
          font-weight: bold;
          display: flex;
          align-items: center;
          padding-top: 20rpx;

          span:nth-child(2) {
            padding-left: 10rpx;
          }

          span:last-child {
            padding-left: 10rpx;
          }
        }
      }
    }
  }
}
</style>