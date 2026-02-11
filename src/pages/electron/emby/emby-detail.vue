<template>
     <div class="detail">
        <div class="detail-background">
            <img :src="imgData.img">
            <div class="detail-background-overlay"></div>
        </div>
        <div class="detail-content">
            <wil-title :title="route.query.title"></wil-title>
            <div class="detail-info">
                <div class="detail-info-img">
                    <img :src="CONFIG.IMG_DOMAIN + '/t/p/w300_and_h450_bestv2' + nowMovieTv.poster">
                </div>
                <div class="detail-info-right">
                    <div class="detail-info-right__name">{{ imgData.title }}</div>
                    <div class="detail-info-right__mid">
                        <div class="mid-score">
                            <img src="@/static/star-fill.png">
                            <span>{{ imgData.score }}</span>
                        </div>
                        <div class="mid-date">
                            <img src="@/static/date-icon.png">
                            <span>{{ imgData.releaseTime }}</span>
                        </div>
                        <div class="mid-runtime">
                            <img src="@/static/clock-icon.png" v-if="routerParams.type == 'movie'"></img>
                            <span>{{ imgData.runtime }}</span>
                        </div>
                    </div>
                    <div class="detail-info-right__genre">
                        <span class="genre-value">{{ imgData.genres }}</span>
                        <span v-if="routerParams.type == 'movie'" class="genre-size">{{ selectSource.size }}</span>
                    </div>
                    <div class="detail-info-right__button">
                        <nut-button custom-color="#090909" @click="clickPlayButton">
                            <template #icon>
                                <image src="@/static/play.png" />
                            </template>
                            <span>{{ buttonText }}</span>
                        </nut-button>
                        <div class="button-more">
                            <img src="@/static/gengduo-white.png">
                        </div>
                    </div>
                    <div class="detail-info-right__overview">
                        {{ overview }}
                    </div>
                </div>
            </div>
            <div class="detail-container">
                <div class="detail-container-source">
                    <div :class="['source-item', item.provider + item.name == selectSource.provider + selectSource.name ? 'source-active' : '']"
                        v-for="item in sourceList" :key="item.provider + item.name" @click="changeSource(item)">
                        {{ item.sourceName }}
                    </div>
                </div>
                <div class="detail-container-tabs" v-if="route.query.type === 'tv'">
                    <div class="detail-container-tabs__list">
                        <nut-tabs v-model="activeSeason.season" :title-scroll="true" custom-color="#090909"
                            background="#fff" @change="changeTvSeason">
                            <nut-tab-pane :title="item.name" :pane-key="item.season"
                                v-for="item in selectSource.seasonArr" :key="item.season">
                            </nut-tab-pane>
                        </nut-tabs>
                    </div>
                    <div class="detail-container-tabs__arrow">
                        <div class="arrow-left" @click="slideTv('left')">
                            <img src="@/static/rect-leftblack.png">
                        </div>
                        <div class="arrow-right" @click="slideTv('right')">
                            <img src="@/static/rect-leftblack.png">
                        </div>
                    </div>
                </div>
                <div class="detail-container-tv">
                    <scroll-view class="tv-list" :scroll-with-animation="true" :scroll-into-view="scrollIntoView"
                        :scroll-x="true" style="width: 100%" :enhanced="true" :showScrollbar="false"
                        v-if="tvList.length">
                        <div class="tv-list-item" v-for="(item, index) in tvList" :id="'name' + (index + 1)"
                            :key="item.name" @click="toPlayVideo(item, index)">
                            <div class="item-img" :style="{ backgroundImage: `url(${item.poster})` }">
                                <img src="@/static/playVideo-button.png">
                                <span class="item-img-runtime" v-if="item.runtime">{{ item.runtime }}</span>
                                <div class="item-img-process"
                                    :style="{ width: Number(historyTv.initialTime) / (Number(parseTime(item.runtime)) * 0.6) + '%' }"
                                    v-if="index + 1 == historyTv.ji && item.runtime && activeSeason.path + '/' + historyTv.name == '/' + historyTv.path">
                                </div>
                            </div>
                            <div class="item-title">{{ index + 1 + '.' + (item.title || `第${index + 1}集`) }}</div>
                        </div>
                    </scroll-view>
                </div>
                <actor-list ref="actor_list" :routerParams="routerParams"
                    :selectSource="{ ...selectSource, size: routerParams.type == 'movie' ? selectSource.size : tvList[0]?.size }"
                    :imgData="imgData"></actor-list>

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type {ImgData,SourceItem,SeasonItem,TvEpisode,RouterParams,ActiveSeason,HistoryTv,ActorListInstance} from './types'
import { onLoad, onShow } from '@dcloudio/uni-app';

const imgData = ref<ImgData | null>(null);
const overview = ref(""); //剧情简介
const actor_list = ref(null);
const activeSeason = ref<ActiveSeason|null>(null);
const seasonFirst = ref({});
const tvList = ref<TvEpisode[]>([]); //目前Emby所拥有的电视集数列表
const historyPlay = ref(uni.getStorageSync("historyPlay") || []); //历史播放
const buttonText = ref("播放");
const firstEnter = ref(true);
const routerParams = ref({});
const selectMedia = ref({});
const selectType = ref({});
const nowSourceList = ref([]);
const showRehandleButton = ref(false);
const historyTv = ref({});
const scrollIntoView = ref("");
const seasonArr = ref([]) //季的数组
const actorArr = ref([]) //emby获取到的演员列表
const showActor = ref(false) //显示演员列表组件

const allDetail = ref({}) //如果电视剧有很多季,这个参数就存放总的电视剧的详情，用于初始化

//判断选择的是哪个Emby
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

//获取影片详情
const getMovieTvDetail = async (type = 'all') => {
  if (!routerParams.value.movieTvId) {
    imgData.value.title = routerParams.value.name;
    return false;
  }
  if (routerParams.value.type == "tv") {
    if (activeSeason.value.season != "1") {
      imgData.value.title = routerParams.value.name + " " + activeSeason.value.name;
    } else {
      imgData.value.title = routerParams.value.name;
    }
  }
  let res = {}
  if (type == 'all') {
    res = await getEmbyMovieTv({ movieTvId: routerParams.value.movieTvId }, selectMedia.value)
    allDetail.value = res
  } else if (type == 'season') {
    res = await getEmbyMovieTv({ movieTvId: activeSeason.value.id }, selectMedia.value)
  }
  res.overview ? overview.value = res.overview : overview.value = allDetail.value.overview;
  actorArr.value = res.actors
  showActor.value = true
  let copyImgData = imgData.value
  if (routerParams.value.type == "movie") {
    imgData.value = { //如果季接口返回的值不存在，就用imgData原来的
      title: res.name || copyImgData.title,
      img: res.backdrop_path || copyImgData.img,
      score: res.vote_average.toFixed(1) || copyImgData.score,
      releaseTime: res.release_date || copyImgData.releaseTime,
      runtime: calTime(res.runtime) || copyImgData.runtime,
      runtimeEn: calTime(res.runtime, "en") || copyImgData.runtimeEn,
      genres: res.genres.map((i) => i.name).join(" ") || copyImgData.genres,
      size: res.size || copyImgData.size,
      poster: res.poster_path || copyImgData.poster,
      tmdbId: res.tmdbId || copyImgData.tmdbId,
      production_companies: res.production_companies || copyImgData.production_companies,
      overview: res.overview || copyImgData.overview,
      path: res.path || copyImgData.path,
    };
  } else if (routerParams.value.type == "tv") {
    seasonFirst.value.img = res.backdrop_path;
    if ((type == 'all' && seasonArr.value.length == 1) || (type == 'season' && seasonArr.value.length > 1)) {
      res.backdrop_path ? imgData.value.img = res.backdrop_path : ''
    }
    seasonFirst.value.overview = res.overview;
    res.vote_average ? imgData.value.score = res.vote_average.toFixed(1) : '';
    res.genres?.length ? imgData.value.genres = res.genres.map((i) => i.name).join(" ") : '';
    res.release_date ? imgData.value.releaseTime = res.release_date : '';
    res.poster_path ? imgData.value.poster = res.poster_path : '';
    res.tmdbId ? imgData.value.tmdbId = res.tmdbId : '';
    res.production_companies ? imgData.value.production_companies = res.production_companies : '';
    res.overview ? imgData.value.overview = res.overview : '';
    res.path ? imgData.value.path = res.path : '';
    res.number_of_episodes ? imgData.value.runtime = `共${res.number_of_episodes || 0}集（库中有${res.number_of_episodes || 0}集）` : '';
  }
  return res;
};

//切换第几季
const changeTvSeason = async (obj) => {
  activeSeason.value = { ...seasonArr.value.find(v => v.name == obj.title) }
  if (activeSeason.value.season != "1") {
    imgData.value.title = routerParams.value.name + " " + activeSeason.value.name;
  } else {
    imgData.value.title = routerParams.value.name;
  }
  getMovieTvDetail('season')
  handleTv()
}

//设置电视剧文件夹
const handleTv = async () => {
  let result = {}
  try {
    if (seasonArr.value.length == 1) {
      let embyObj = {
        ParentId: routerParams.value.movieTvId,
        IsFolder: false,
        EnableImageTypes: 'Primary,Backdrop,Thumb',
        Fields: 'BasicSyncInfo,CanDelete,CanDownload,PrimaryImageAspectRatio,Overview,PremiereDate,ProductionYear,RunTimeTicks,SpecialEpisodeNumbers',
        StartIndex: 0,
        Limit: 1000,
        EnableTotalRecordCount: false,
        Recursive: true,
        IsStandaloneSpecial: false,
      }
      result = await getEmbyList(embyObj, selectMedia.value)
    } else if (seasonArr.value.length > 1) {
      let embyObj = {
        SeasonId: activeSeason.value.id,
        folderFileId: routerParams.value.movieTvId
      }
      result = await getSeasonTvList(embyObj, selectMedia.value)
    }

  } catch (error) {
    showRehandleButton.value = true;
    return;
  }
  tvList.value = result.Items
    .map((i) => {
      return {
        id: i.Id,
        name: i.Name,
        title: i.Name,
        provider: "Emby",
        poster: setEmbyImg(i, selectMedia.value)
      };
    });
  console.log(tvList.value, '电视剧列表');
}

//设置按钮文字
const setButtonText = () => {
  historyPlay.value = uni.getStorageSync("historyPlay") || [];
  historyPlay.value = historyPlay.value.filter((v) => v.sourceType == selectType.value.type && v.sourceName == selectMedia.value.name);
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

//点击播放按钮
const clickPlayButton = () => {
  uni.setStorageSync('overviewData', imgData.value)
  if (routerParams.value.type == "movie") {
    uni.navigateTo({
      url: `/pages/mobile/video/emby/emby-player?folderFileId=${routerParams.value.movieTvId}&type=movie&movieName=${imgData.value.title}`,
    });
  } else if (routerParams.value.type == "tv") {
    uni.setStorageSync("tvList", tvList.value);
    let openEndTime = {};
    routerParams.value.movieTvId ? "" : (openEndTime.noSetHistory = 0);
    uni.navigateTo({
      url: `/pages/mobile/video/emby/emby-player?folderFileId=${tvList.value[0].id}&type=tv`,
    });
  }
};

//电视剧点击某一集进行播放
const toPlayVideo = (item, index) => {
  uni.setStorageSync('overviewData', imgData.value)
  if (routerParams.value.type == 'movie') {
    uni.navigateTo({
      url: `/pages/mobile/video/emby/emby-player?folderFileId=${routerParams.value.movieTvId}&type=movie&movieName=${imgData.value.title}`,
    });
  } else if (routerParams.value.type == 'tv') {
    uni.setStorageSync("tvList", tvList.value);//用于给视频播放器页面显示集数
    uni.navigateTo({
      url: `/pages/mobile/video/emby/emby-player?folderFileId=${item.id}&type=tv`,
    });
  }
}

//从接口获取该剧集有多少个季
const getSeasonArr = async () => {
  const seasonInfo = {
    movieTvId: routerParams.value.movieTvId,
    UserId: selectMedia.value.userId,
    Fields: 'BasicSyncInfo,CanDelete,CanDownload,PrimaryImageAspectRatio,Overview',
  }
  let res = await getEmbySeasonList(seasonInfo, selectMedia.value)
  seasonArr.value = res.Items.map(v => {
    return { name: v.Name, season: String(v.IndexNumber), id: v.Id }
  })
  activeSeason.value = { ...seasonArr.value[0] }
}
const setItemWidth = () => {
  let sysinfo = uni.getSystemInfoSync(); // 获取设备系统对象
  let windowWidth = sysinfo.windowWidth;
  if (windowWidth > 700) {
    lineNumber.value = Math.floor((windowWidth - 24) / 169.5);
    let remain = windowWidth - 24 - lineNumber.value * 169.5;
    if (remain < (lineNumber.value - 1) * 10) {
      lineNumber.value--;
    }
  }
  const scale = uni.upx2px(100) / 100; // 获取1rpx对应的px比例
  lineHeight.value = (((windowWidth - uni.upx2px(24 * lineNumber.value + 24)) / lineNumber.value) * 170) / 339 / scale + "rpx";
};
setItemWidth();
onBeforeMount(async () => {
  judgeSelect();
  if (routerParams.value.type == 'tv') {
    await getSeasonArr()
  }
  if (routerParams.value.type == "tv") {
    handleTv();
  }
  if (seasonArr.value.length > 1) {
    await getMovieTvDetail()
    getMovieTvDetail('season')
  } else {
    getMovieTvDetail()
  }
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
});

onLoad((options) => {
  routerParams.value = options;
  if (options.movieTvId == "undefined") {
    routerParams.value.movieTvId = undefined;
  }
  if (options.isEmby == 'true') {
    routerParams.value.isEmby = true;
  } else {
    routerParams.value.isEmby = false;
  }
});
</script>

<style lang="scss" scoped></style>
