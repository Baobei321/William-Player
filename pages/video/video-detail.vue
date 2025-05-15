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
          <div class="img-mid" v-if="imgData.releaseTime">
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
              <div :class="['movie-version-list__item',item.provider+item.name==selectSource.provider+selectSource.name ? 'movie-version-list__active' : '']"
                v-for="item in sourceList" :key="item.provider+item.name" @click="changeSource(item)">
                {{ item.sourceName }}
              </div>
            </div>
          </scroll-view>
        </div>
        <!-- 电视专用 -->
        <div class="tv-version" v-if="routerParams.type=='tv'">
          <div class="tv-version-tabs">
            <div class="tv-version-tabs__cloud">
              <div :class="['tv-version-tabs__cloud-item',item.provider+item.name==selectSource.provider+selectSource.name ? 'tv-version-tabs__cloud-active' : '']"
                v-for="item in sourceList" :key="item.provider+item.name" @click="changeTvSource(item)">
                {{ item.sourceName }}
              </div>
            </div>
            <nut-tabs v-model="activeSeason.season" :title-scroll="true" custom-color="#090909" background="#fff" @change="changeTvSeason">
              <nut-tab-pane :title="item.name" :pane-key="item.season" v-for="item in selectSource.seasonArr" :key="item.season">
              </nut-tab-pane>
            </nut-tabs>
            <div class="tv-version-tabs__disabled" v-if="!tvList.length&&!showRehandleButton" @click="disabledTip"></div>
          </div>
          <scroll-view class="tv-version-scroll" :scroll-with-animation="true" :scroll-into-view="scrollIntoView" :scroll-x="true" style="width: 100%" :enhanced="true"
            :showScrollbar="false" v-if="tvList.length">
            <div class="tv-version-list__item" v-for="(item,index) in tvList" :id="'name'+(index+1)" :key="item.name" @click="toPlayVideo(item,index)">
              <div class="item-img" :style="{backgroundImage:`url(${item.poster || imgData.img})`}">
                <image src="@/static/playVideo-button.png" />
                <span class="item-img-runtime" v-if="item.runtime">{{ item.runtime }}</span>
                <div class="item-img-process" :style="{width:Number(historyTv.initialTime)/(Number(parseTime(item.runtime))*0.6)+'%'}"
                  v-if="index+1==historyTv.ji && item.runtime && activeSeason.path + '/' + historyTv.name == '/' + historyTv.path">
                </div>
              </div>
              <div class="item-title">{{ index+1+'.'+(item.title||`第${index+1}集`) }}</div>
            </div>
          </scroll-view>
          <div class="tv-version-empty" v-else>
            <nut-button custom-color="#090909" v-if="showRehandleButton" @click="reHandleTv">重新加载</nut-button>
            <span v-else>加载中...</span>
          </div>
        </div>
        <div class="story-introduction" v-if="overview">
          <div class="story-introduction-title">剧情简介</div>
          <div class="story-introduction-text">{{ overview }}</div>
        </div>
        <div class="related-actors" v-if="actors.length">
          <div class="related-actors-title">相关演员</div>
          <scroll-view class="related-actors-scroll" :scroll-x="true" style="width: 100%" :enhanced="true" :showScrollbar="false">
            <div class="related-actors-list">
              <div class="related-actors-list__item" v-if="director.name">
                <image class="item-avatar" backgroundColor='#efefef'
                  :src="director.profile_path ? 'https://media.themoviedb.org/t/p/w100_and_h100_bestv2' + director.profile_path : 'https://storage.7x24cc.com/storage-server/presigned/ss1/a6-online-fileupload/newMediaImage/2AFA742_427A_user-avatar_20241225150546694newMediaImage.png'"
                  mode="aspectFill" />
                <div class="item-name">{{director.name}}</div>
                <div class="item-job">导演</div>
              </div>
              <div class="related-actors-list__item" v-for="item in actors" :key="item.name">
                <image class="item-avatar" backgroundColor='#efefef'
                  :src="item.profile_path?'https://media.themoviedb.org/t/p/w100_and_h100_bestv2'+item.profile_path :'https://storage.7x24cc.com/storage-server/presigned/ss1/a6-online-fileupload/newMediaImage/2AFA742_427A_user-avatar_20241225150546694newMediaImage.png'"
                  mode="aspectFill" />
                <div class="item-name">{{item.name}}</div>
                <div class="item-role">饰 {{ item.character }}</div>
              </div>
            </div>
          </scroll-view>
        </div>
        <div class="tip-footer">
          <span class="tip-footer-name">{{ handleSeasonName(selectSource.name,true)+'-' }}</span>
          <span class="tip-footer-webdav">路径：{{ selectSource.path }}</span>
          <div class="tip-footer-timesize">
            <span v-if="imgData.runtime">{{ imgData.runtime }}</span><span>{{ selectSource.sourceName }}</span>
            <span
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
import { onBeforeMount, ref, nextTick } from "vue";
import wilNavbar from "@/components/wil-navbar/index.vue";
import { useDict } from "../../utils/useDict";
import { loginUser, getFolder, get189Folder, getQuarkFolder, getTvSeason, getMovieTvById } from "../../utils/common";
import { parseTime, calTime, handleSecond, handleSeasonName, generateChineseNumberMapping } from "../../utils/scrape";
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

const activeSeason = ref("");
const seasonFirst = ref({});

const tvList = ref([]); //目前网盘所拥有的电视集数列表

const historyPlay = ref(uni.getStorageSync("historyPlay") || []); //历史播放
const buttonText = ref("播放");
const firstEnter = ref(true);

const routerParams = ref({});
const selectMedia = ref({});
const selectType = ref({});
const nowSourceList = ref([]);

const showRehandleButton = ref(false);
const historyTv = ref({});

const localMovieTvData = ref({});
const scrollIntoView = ref("");

const toSelect = (item) => {
  if (item.text == "手动编辑") {
    showPopover.value = false;
    //获取当前源里面的最大季数
    const maxSeasonArrLength = Math.max(...sourceList.value.map((v) => v.seasonArr.length));
    uni.navigateTo({
      url: `/pages/video/search-match?type=${routerParams.value.type}&maxSeasonLength=${maxSeasonArrLength}`,
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
  } else if (pickerTitle.value == "设置跳过片尾时间") {
    nowTv.endTime = time;
  }
  uni.setStorageSync("localMovieTvData", localMovieTvData);
  showTimePicker.value = false;
};

//获取演员表
const getActorById = (data, type) => {
  let url = "";
  let obj = JSON.parse(JSON.stringify(data));
  if (!data.movieTvId || !obj.movieTvId) return Promise.reject();
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
const handleTv = async (seasonData1 = null) => {
  showRehandleButton.value = false;
  let season = "";
  season = activeSeason.value.season;
  if (localMovieTvData.value.tv) {
    season = localMovieTvData.value.tv.find((i) => i.movieTvId == routerParams.value.movieTvId).season;
    season = season != "1" ? season : activeSeason.value.season;
  } else {
    const numberMapping = generateChineseNumberMapping(40, "string");
    const match = imgData.value.title.match(/第([一二三四五六七八九十\d]+)季/);
    if (match) {
      if (!isNaN(Number(match[1])) && match[1].trim() !== "") {
        season = match[1];
      } else {
        season = numberMapping[match[1]];
      }
    } else {
      if (imgData.value.title.indexOf("特别篇") > -1) {
        season = "0";
      } else {
        season = "1";
      }
    }
    season = season != "1" ? season : activeSeason.value.season;
  }
  let result = {};
  let videoFormat = ["mp4", "mkv", "m2ts", "avi", "mov", "ts", "m3u8", "iso"];
  if (selectType.value.type == "WebDAV") {
    // imgData.value.releaseTime = res1.air_date;
    // imgData.value.runtime ? "" : (imgData.value.runtime = `共${res1?.episodes?.length || 0}集（库中有0集）`);
    try {
      result = await getFolder(
        {
          path: activeSeason.value.path,
        },
        selectMedia.value
      );
    } catch (error) {
      showRehandleButton.value = true;
      return;
    }
    result.data.content = result.data.content.filter((h) => {
      return videoFormat.some((v) => h.name.includes(v));
    });
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
    // imgData.value.runtime = `共${res1?.episodes?.length || 0}集（库中有${tvList.value?.length || 0}集）`;
  } else if (selectType.value.type == "天翼云盘") {
    // imgData.value.releaseTime = res1.air_date;
    // imgData.value.runtime ? "" : (imgData.value.runtime = `共${res1?.episodes?.length || 0}集（库中有0集）`);
    try {
      result = await get189Folder(
        {
          folderId: activeSeason.value.folderFileId,
        },
        selectMedia.value
      );
    } catch (error) {
      showRehandleButton.value = true;
      return;
    }
    result.fileListAO.fileList = result.fileListAO.fileList.filter((h) => {
      return videoFormat.some((v) => h.name.includes(v));
    });
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
    // imgData.value.runtime = `共${res1?.episodes?.length || 0}集（库中有${tvList.value?.length || 0}集）`;
  } else if (selectType.value.type == "夸克网盘") {
    // imgData.value.releaseTime = res1.air_date;
    // imgData.value.runtime ? "" : (imgData.value.runtime = `共${res1.episodes.length}集（库中有0集）`);
    try {
      result = await getQuarkFolder(
        {
          fid: activeSeason.value.folderFileId,
        },
        selectMedia.value
      );
    } catch (error) {
      showRehandleButton.value = true;
      return;
    }
    result.data.list = result.data.list.filter((h) => {
      return videoFormat.some((v) => h.file_name.includes(v));
    });
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

    // imgData.value.runtime = `共${res1.episodes.length}集（库中有${tvList.value?.length || 0}集）`;
  }
  let res1 = {};
  if (!seasonData1) {
    if (routerParams.value.movieTvId) {
      res1 = await getTvSeason({ movieTvId: routerParams.value.movieTvId, season: season });
    }
  } else {
    res1 = seasonData1;
  }
  imgData.value.releaseTime = res1.air_date;
  imgData.value.runtime = `共${res1?.episodes?.length || 0}集（库中有${tvList.value?.length || 0}集）`;
  if (season != "1") {
    imgData.value.img = "https://media.themoviedb.org/t/p/w1920_and_h1080_bestv2" + res1.poster_path;
    overview.value = res1.overview;
  } else {
    imgData.value.img = seasonFirst.value.img;
    overview.value = seasonFirst.value.overview;
  }
  let seasonData = { _id: res1._id, air_date: res1.air_date, name: res1.name, overview: res1.overview, id: res1.id, poster_path: res1.poster_path, season_number: res1.season_number, vote_average: res1.vote_average };
  uni.setStorageSync("seasonData", seasonData);
  season != "1" && res1.overview ? (overview.value = res1.overview) : "";

  //处理现有的集数，将tmdb的封面，时长都设置进去，还有每一集的标题
  tvList.value.forEach((v, vindex) => {
    if (res1.episodes) {
      v.title = res1.episodes[vindex]?.name || "暂无标题";
      v.poster = res1.episodes[vindex]?.still_path ? "https://media.themoviedb.org/t/p/w533_and_h300_bestv2" + res1.episodes[vindex]?.still_path : "";
      v.runtime = res1.episodes[vindex]?.runtime ? calTime(res1.episodes[vindex]?.runtime, "en") : "00:00";
    } else {
      v.title = `第${vindex + 1}集`;
    }
  });
  nextTick(() => {
    historyTv.value.name ? (scrollIntoView.value = "name" + historyTv.value.ji) : "";
  });
};

const getMovieTvDetail = async () => {
  if (!routerParams.value.movieTvId) {
    imgData.value.title = routerParams.value.name;
    return false;
  }
  let res = await getMovieTvById(
    {
      movieTvId: routerParams.value.movieTvId,
    },
    routerParams.value.type
  );
  overview.value = res.overview;
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
    if (activeSeason.value.season != "1") {
      imgData.value.title = routerParams.value.name + " " + activeSeason.value.name;
    } else {
      imgData.value.title = routerParams.value.name;
    }
    seasonFirst.value.img = imgData.value.img = "https://media.themoviedb.org/t/p/w1920_and_h1080_bestv2" + res.backdrop_path;
    seasonFirst.value.overview = res.overview;
    imgData.value.score = res.vote_average.toFixed(1);
    imgData.value.genres = res.genres.map((i) => i.name).join(" ");
  }
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
const changeTvSource = async (obj) => {
  selectSource.value = sourceList.value.find((i) => i.provider + i.name == obj.provider + obj.name);
  let obj1 = selectSource.value.seasonArr.find((i) => i.season == historyTv.value.season);
  if (obj1) {
    activeSeason.value = { ...obj1 };
  } else {
    activeSeason.value = { ...selectSource.value.seasonArr[0] };
  }
  setButtonText();
  await handleTv();
  nextTick(() => {
    historyTv.value.name ? (scrollIntoView.value = "name" + historyTv.value.ji) : (scrollIntoView.value = "name1");
  });
};

//切换不同季
const changeTvSeason = async (obj) => {
  activeSeason.value = { ...selectSource.value.seasonArr.find((i) => i.season == obj.paneKey) };
  if (activeSeason.value.season != "1") {
    imgData.value.title = routerParams.value.name + " " + activeSeason.value.name;
  } else {
    imgData.value.title = routerParams.value.name;
  }
  setButtonText();
  await handleTv();
  nextTick(() => {
    historyTv.value.name ? (scrollIntoView.value = "name" + historyTv.value.ji) : (scrollIntoView.value = "name1");
  });
};

//电视集数还在加载中，点击提示
const disabledTip = () => {
  uni.showToast({
    title: "等待加载完成后，再继续操作",
    icon: "none",
  });
};

//点击播放按钮
const clickPlayButton = () => {
  if (routerParams.value.type == "movie") {
    const lastIndex = routerParams.value.path.lastIndexOf("/");
    let name = routerParams.value.path.substring(lastIndex + 1);
    let history = historyPlay.value?.find((i) => i.name == name);
    if (history && selectSource.value.path == "/" + history.path) {
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
        movieTvId: routerParams.value.movieTvId,
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
    let nowTv = {};
    if (routerParams.value.movieTvId) {
      nowTv = localMovieTvData.tv.find((i) => i.movieTvId == routerParams.value.movieTvId);
    } else {
      nowTv = localMovieTvData.tv.find((i) => i.path == routerParams.value.path);
    }
    let history = historyPlay.value?.find((i) => i.titlePlay == imgData.value.title);
    if (history && activeSeason.value.path + "/" + history.name == "/" + history.path) {
      let openEndTime = {};
      routerParams.value.movieTvId ? "" : (openEndTime.noSetHistory = 0);
      nowTv.openingTime >= 0 ? (openEndTime.openingTime = nowTv.openingTime) : "";
      nowTv.endTime >= 0 ? (openEndTime.endTime = nowTv.endTime) : "";
      if (selectType.value.type == "WebDAV") {
        uni.navigateTo({
          url: `/pages/video/video-player?path=${activeSeason.value.path.slice(1)}/${history.name}&type=tv${toStringfy(openEndTime) ? "&" + toStringfy(openEndTime) : ""}`,
        });
      } else {
        uni.navigateTo({
          url: `/pages/video/video-player?path=${activeSeason.value.path.slice(1)}/${history.name}&wjjId=${activeSeason.value.folderFileId}&folderFileId=${history.folderFileId}&type=tv${toStringfy(openEndTime) ? "&" + toStringfy(openEndTime) : ""}`,
        });
      }
    } else {
      let historyItem = {
        path: `${activeSeason.value.path.slice(1)}/${tvList.value[0].name}`,
        titlePlay: imgData.value.title,
        ji: "1",
        poster: tvList.value[0].poster || imgData.value.img,
        type: "tv",
        name: tvList.value[0].name,
        runtime: tvList.value[0].runtime,
        title: tvList.value[0].title,
        initialTime: "0",
        movieTvId: routerParams.value.movieTvId,
        season: activeSeason.value.season,
      };
      let openEndTime = {};
      routerParams.value.movieTvId ? "" : (openEndTime.noSetHistory = 0);
      nowTv.openingTime >= 0 ? (openEndTime.openingTime = nowTv.openingTime) : "";
      nowTv.endTime >= 0 ? (openEndTime.endTime = nowTv.endTime) : "";
      if (selectType.value.type == "WebDAV") {
        uni.navigateTo({
          url: `/pages/video/video-player?path=${activeSeason.value.path.slice(1)}/${tvList.value[0].name}&item=${JSON.stringify(historyItem)}&type=tv${toStringfy(openEndTime) ? "&" + toStringfy(openEndTime) : ""}`,
        });
      } else {
        historyItem.folderFileId = tvList.value[0].id;
        uni.navigateTo({
          url: `/pages/video/video-player?path=${activeSeason.value.path.slice(1)}/${tvList.value[0].name}&wjjId=${activeSeason.value.folderFileId}&folderFileId=${tvList.value[0].id}&item=${JSON.stringify(historyItem)}&type=tv${
            toStringfy(openEndTime) ? "&" + toStringfy(openEndTime) : ""
          }`,
        });
      }
    }
  }
};

//播放电视
const toPlayVideo = (item, index) => {
  uni.setStorageSync("tvList", tvList.value);
  let localMovieTvData = uni.getStorageSync("localMovieTvData");
  let nowTv = {};
  if (routerParams.value.movieTvId) {
    nowTv = localMovieTvData.tv.find((i) => i.movieTvId == routerParams.value.movieTvId);
  } else {
    nowTv = localMovieTvData.tv.find((i) => i.path == routerParams.value.path);
  }
  let history = historyPlay.value?.find((i) => i.titlePlay == handleSeasonName(selectSource.value.name + (activeSeason.value.name == "第一季" ? "" : " " + activeSeason.value.name), true) && item.name == i.name);
  if (history && activeSeason.value.path + "/" + history.name == "/" + history.path && activeSeason.value.season == history.season) {
    //存在历史记录，同一路径的片源，同一季
    let openEndTime = {};
    routerParams.value.movieTvId ? "" : (openEndTime.noSetHistory = 0);
    nowTv.openingTime >= 0 ? (openEndTime.openingTime = nowTv.openingTime) : "";
    nowTv.endTime >= 0 ? (openEndTime.endTime = nowTv.endTime) : "";
    if (selectType.value.type == "WebDAV") {
      uni.navigateTo({
        url: `/pages/video/video-player?path=${activeSeason.value.path.slice(1)}/${item.name}&type=tv${toStringfy(openEndTime) ? "&" + toStringfy(openEndTime) : ""}`,
      });
    } else {
      uni.navigateTo({
        url: `/pages/video/video-player?path=${activeSeason.value.path.slice(1)}/${item.name}&wjjId=${activeSeason.value.folderFileId}&folderFileId=${item.id}&type=tv${toStringfy(openEndTime) ? "&" + toStringfy(openEndTime) : ""}`,
      });
    }
  } else {
    let historyItem = {
      path: `${activeSeason.value.path.slice(1)}/${item.name}`,
      titlePlay: imgData.value.title,
      ji: String(index + 1),
      poster: item.poster || imgData.value.img,
      type: "tv",
      name: item.name,
      runtime: item.runtime,
      title: item.title,
      initialTime: "0",
      movieTvId: routerParams.value.movieTvId,
      season: activeSeason.value.season,
    };

    let openEndTime = {};
    routerParams.value.movieTvId ? "" : (openEndTime.noSetHistory = 0);
    nowTv.openingTime >= 0 ? (openEndTime.openingTime = nowTv.openingTime) : "";
    nowTv.endTime >= 0 ? (openEndTime.endTime = nowTv.endTime) : "";
    if (selectType.value.type == "WebDAV") {
      uni.navigateTo({
        url: `/pages/video/video-player?path=${activeSeason.value.path.slice(1)}/${item.name}&item=${JSON.stringify(historyItem)}&type=tv${toStringfy(openEndTime) ? "&" + toStringfy(openEndTime) : ""}`,
      });
    } else {
      historyItem.folderFileId = item.id;
      uni.navigateTo({
        url: `/pages/video/video-player?path=${activeSeason.value.path.slice(1)}/${item.name}&wjjId=${activeSeason.value.folderFileId}&folderFileId=${item.id}&item=${JSON.stringify(historyItem)}&type=tv${
          toStringfy(openEndTime) ? "&" + toStringfy(openEndTime) : ""
        }`,
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
    let history = historyPlay.value?.find((i) => handleSeasonName(i.name, true) == handleSeasonName(selectSource.value.name, true));
    if (history && selectSource.value.path == "/" + history.path) {
      buttonText.value = "播放 " + handleSecond(history.initialTime);
    } else {
      buttonText.value = "播放";
    }
  } else if (routerParams.value.type == "tv") {
    let history = historyPlay.value?.find((i) => {
      if (activeSeason.value.season == "1") {
        return i.titlePlay == handleSeasonName(selectSource.value.name, true);
      } else {
        return i.titlePlay == handleSeasonName(selectSource.value.name, true) + " " + activeSeason.value.name;
      }
    });
    historyTv.value = history || {};
    if (history && activeSeason.value.path + "/" + history.name == "/" + history.path && history.season == activeSeason.value.season) {
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

//重新设置影片信息
const resetMovieTvData = async () => {
  let resetMovieTv = uni.getStorageSync("resetMovieTv");
  if (resetMovieTv) {
    judgeSelect();
    let oldMovieTvId = routerParams.value.movieTvId;
    // let oldName = imgData.value.title;
    let oldPath = routerParams.value.path;
    routerParams.value.type = resetMovieTv.type;
    routerParams.value.movieTvId = resetMovieTv.movieTvId;
    routerParams.value.name = resetMovieTv.name;
    uni.removeStorageSync("resetMovieTv");
    selectSource.value = sourceList.value[0];
    activeSeason.value = { ...selectSource.value.seasonArr[0] };
    setButtonText();
    nextTick(() => {
      historyTv.value.name ? (scrollIntoView.value = "name" + historyTv.value.ji) : "";
    });
    historyPlay.value = historyPlay.value.filter((i) => i.titlePlay != imgData.value.title);
    uni.setStorageSync("historyPlay", historyPlay.value);
    selectSource.value.name = resetMovieTv.name;
    localMovieTvData.value = uni.getStorageSync("localMovieTvData") || {};

    if (resetMovieTv.type == "tv") {
      let nowTv = localMovieTvData.value.tv.find((i) => i.movieTvId == oldMovieTvId && i.path == oldPath);
      let selectSource1 = nowTv.source.find((i) => i.path == selectSource.value.path);
      selectSource1.name = resetMovieTv.name;
      const numberMapping = generateChineseNumberMapping(40, "string");
      const match = selectSource.value.name.match(/第([一二三四五六七八九十\d]+)季/);
      if (match) {
        if (!isNaN(Number(match[1])) && match[1].trim() !== "") {
          nowTv.season = match[1];
        } else {
          nowTv.season = numberMapping[match[1]];
        }
      } else {
        if (selectSource.value.name.indexOf("特别篇") > -1) {
          nowTv.season = "0";
        } else {
          nowTv.season = "1";
        }
      }
      nowTv.movieTvId = routerParams.value.movieTvId;
      let res = await getMovieTvDetail();
      nowTv.type = "1";
      nowTv.genre_ids = res.genres.map((i) => i.id);
      nowTv.backdrop = res.backdrop_path;
      nowTv.voteAverage = res.vote_average; //评分
      nowTv.name = resetMovieTv.name;
      let res1 = await getTvSeason({ movieTvId: routerParams.value.movieTvId, season: nowTv.season });
      handleTv(res1);
      nowTv.poster = res1.poster_path;
      nowTv.releaseTime = res1.air_date;
      nowTv.overview = res1.overview;
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
};

onBeforeMount(async () => {
  judgeSelect();
  // historyPlay.value = uni.getStorageSync('historyPlay') || []
  let dict = [
    { value: "189CloudPC", label: "天翼云盘" },
    { value: "Quark", label: "夸克网盘" },
  ];
  let source = JSON.parse(routerParams.value.source);
  sourceList.value = source.map((i) => {
    if (source.filter((v) => v.provider == i.provider).length > 1) {
      let label = dict.find((v) => v.value == i.provider).label;
      i.sourceName = label ? label + `(${i.name})` : i.provider;
    } else {
      i.sourceName = dict.find((v) => v.value == i.provider).label || i.provider;
    }
    return i;
  });
  selectSource.value = sourceList.value[0];
  historyTv.value =
    historyPlay.value?.find((i) => {
      if (i.season == "1") {
        let sameSource = sourceList.value.find((v) => handleSeasonName(v.name, true) == i.titlePlay && v.seasonArr.find((h) => h.path + "/" + i.name == "/" + i.path));
        if (sameSource) {
          selectSource.value = sameSource;
          return true;
        } else {
          selectSource.value = sourceList.value[0];
          return false;
        }
      } else {
        const chineseNumber = generateChineseNumberMapping(40, "number");
        let sameSource = sourceList.value.find((v) => i.titlePlay == handleSeasonName(v.name, true) + ` 第${chineseNumber[i.season]}季` && v.seasonArr.find((h) => h.path + "/" + i.name == "/" + i.path));
        if (sameSource) {
          selectSource.value = sameSource;
          return true;
        } else {
          selectSource.value = sourceList.value[0];
          return false;
        }
      }
    }) || {};
  let obj1 = selectSource.value.seasonArr.find((i) => i.season == historyTv.value.season);
  if (obj1) {
    activeSeason.value = { ...obj1 };
  } else {
    activeSeason.value = { ...selectSource.value.seasonArr[0] };
  }
  setButtonText();
  await getMovieTvDetail();
  if (routerParams.value.type == "tv") {
    await handleTv();
  }
  nextTick(() => {
    historyTv.value.name ? (scrollIntoView.value = "name" + historyTv.value.ji) : "";
  });
  getActorList();
});

onShow(() => {
  setTimeout(() => {
    setButtonText();
    if (!firstEnter.value) {
      nextTick(() => {
        historyTv.value.name ? (scrollIntoView.value = "name" + historyTv.value.ji) : "";
      });
    }
    firstEnter.value = false;
  }, 800); //为什么加延迟，因为上一个页面setStorageSync的时候，不加延迟返回这个页面获取不到最新的storage
  //重新设置影片信息
  resetMovieTvData();
});

onLoad((options) => {
  routerParams.value = options;
  if (options.movieTvId == "undefined") {
    routerParams.value.movieTvId = undefined;
  }
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
        .tv-version-tabs__cloud {
          display: flex;
          align-items: center;
          flex-wrap: nowrap;
          width: 100%;
          overflow: auto;
          .tv-version-tabs__cloud-item {
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
          .tv-version-tabs__cloud-active {
            color: #315ffd;
            border: 2rpx solid #315ffd;
          }
        }
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
          width: 100%;
          height: 100%;
          overflow: hidden;
          ::v-deep .uni-scroll-view-content {
            display: flex;
            flex-direction: row;
            align-items: center;
            flex-wrap: nowrap;
            width: 100%;
            height: 230rpx;
          }
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