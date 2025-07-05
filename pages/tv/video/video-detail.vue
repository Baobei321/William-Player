<template>
    <tv-page @keyCodeClick="keyCodeClick">
        <div class="video-detail" :style="{ backgroundImage: `url(${imgData.img})` }">
            <div class="video-detail-left"
                :style="{ background: showRightPopup ? 'rgba(0,0,0,0.4)' : 'linear-gradient(to right, black 0%, rgba(0, 0, 0, 0.7) 80%, rgba(0, 0, 0, 0) 100%)' }">
                <div class="left-title">{{ imgData.title }}</div>
                <div class="left-info">
                    <div class="left-info-date">
                        <image src="@/static/date-iconwhite.png"></image>
                        <span>{{ imgData.releaseTime }}</span>
                    </div>
                    <div class="left-info-score">
                        <image src="@/static/star-fill.png"></image>
                        <span>{{ imgData.score }}</span>
                    </div>
                    <div class="left-info-runtime">{{ imgData.runtime }}</div>
                </div>
                <div class="left-genres">{{ imgData.genres }}</div>
                <div class="left-overview">{{ overview }}</div>
                <operation-button ref="operation_button" :focusModel="focusModel"
                    @openPopup="openPopup"></operation-button>
            </div>
            <div class="video-detail-right"
                :style="{ backgroundColor: showRightPopup ? 'rgba(0,0,0,0.4)' : 'transparent' }">
                <nut-popup v-model:visible="showRightPopup" :overlay="false" position="right">
                    <cloud-list :list="sourceList" @backLeft="backLeft" ref="cloud_list"
                        v-if="focusModel === 'cloudList'">
                    </cloud-list>
                    <season-list :list="selectSource.seasonArr" @backLeft="backLeft" v-if="focusModel === 'seasonList'"
                        ref="season_list">
                    </season-list>
                    <tv-listd :list="tvList" ref="tv_list" v-if="focusModel === 'tvList'" @backLeft="backLeft">
                    </tv-listd>
                    <actor-list :routerParams="routerParams" ref="actor_list" v-if="focusModel === 'actorList'" @backLeft="backLeft"></actor-list>
                </nut-popup>
            </div>
        </div>
    </tv-page>
</template>

<script setup>
import { onBeforeMount, ref, nextTick } from "vue";
import { useDict } from "@/utils/useDict";
import { loginUser, getFolder, get189Folder, getQuarkFolder, getTvSeason, getMovieTvById } from "@/utils/common";
import { parseTime, calTime, handleSecond, handleSeasonName, generateChineseNumberMapping } from "@/utils/scrape";
import { onShow, onLoad } from "@dcloudio/uni-app";
import editIcon from "@/static/edit_icon.png";
import timeIcon from "@/static/time_icon.png";
import { toStringfy } from "@/pages/mobile/mine/common";
import * as CONFIG from "@/utils/config";
import operationButton from "./components/detail-component/operation-button.vue";
import tvPage from "@/components/tv/tv-page/index.vue";
import cloudList from "./components/detail-component/cloud-list.vue";
import seasonList from "./components/detail-component/season-list.vue";
import tvListd from "./components/detail-component/tv-list.vue"
import actorList from "./components/detail-component/actor-list.vue";

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

const actor_list = ref(null);

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

const lineNumber = ref(2);
const lineHeight = ref(0);

const focusModel = ref('operationButton')
const operation_button = ref(null)
const cloud_list = ref(null)
const season_list = ref(null)
const tv_list = ref(null)
const showRightPopup = ref(false)


const toSelect = (item) => {
    if (item.text == "手动编辑") {
        showPopover.value = false;
        //获取当前源里面的最大季数
        const maxSeasonArrLength = Math.max(...sourceList.value.map((v) => v.seasonArr.length));
        uni.navigateTo({
            url: `/pages/mobile/video/search-match?type=${routerParams.value.type}&maxSeasonLength=${maxSeasonArrLength}`,
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
            pickerVal.value = ["0", "0"];
        }
        showPopover.value = false;
        pickerTitle.value = item.text;
        let arr1 = [];
        let arr2 = [];
        for (let i = 0; i <= 180; i++) {
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

const keyCodeClick = (keyCode) => {
    if (!operation_button.value) return; //用于保证dom已加载完成
    let mapping = {
        "operationButton": operation_button.value,
        "cloudList": cloud_list.value,
        "seasonList": season_list.value,
        "tvList": tv_list.value,
        "actorList": actor_list.value
    };
    mapping[focusModel.value].evtMove(keyCode);
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
            if (a.name.match(regex) && b.name.match(regex)) {
                let aName = a.name.match(regex)[0];
                let bName = b.name.match(regex)[0];
                const numA = parseInt(aName.slice(-2), 10);
                const numB = parseInt(bName.slice(-2), 10);
                return numA - numB;
            } else if (a.name.match(regex1) && b.name.match(regex1)) {
                let aName = a.name.match(regex1)[0];
                let bName = b.name.match(regex1)[0];
                const numA = parseInt(aName.slice(-2), 10);
                const numB = parseInt(bName.slice(-2), 10);
                return numA - numB;
            }
            return a - b;
        });
        // imgData.value.runtime = `共${res1?.episodes?.length || 0}集（库中有${result?.data?.total || 0}集）`;
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
            if (a.name.match(regex) && b.name.match(regex)) {
                let aName = a.name.match(regex)[0];
                let bName = b.name.match(regex)[0];
                const numA = parseInt(aName.slice(-2), 10);
                const numB = parseInt(bName.slice(-2), 10);
                return numA - numB;
            } else if (a.name.match(regex1) && b.name.match(regex1)) {
                let aName = a.name.match(regex1)[0];
                let bName = b.name.match(regex1)[0];
                const numA = parseInt(aName.slice(-2), 10);
                const numB = parseInt(bName.slice(-2), 10);
                return numA - numB;
            }
            return a - b;
        });
        // imgData.value.runtime = `共${res1?.episodes?.length || 0}集（库中有${result.fileListAO.count || 0}集）`;
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

        // imgData.value.runtime = `共${res1.episodes.length}集（库中有${result.data.list?.length || 0}集）`;
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
        imgData.value.img = CONFIG.IMG_DOMAIN + "/t/p/w1920_and_h1080_bestv2" + res1.poster_path;
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
            v.poster = res1.episodes[vindex]?.still_path ? CONFIG.IMG_DOMAIN + "/t/p/w533_and_h300_bestv2" + res1.episodes[vindex]?.still_path : imgData.value.img;
            v.runtime = res1.episodes[vindex]?.runtime ? calTime(res1.episodes[vindex]?.runtime, "en") : "00:00";
            v.overview = res1.episodes[vindex]?.overview || "暂无简介";
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
    if (routerParams.value.type == "tv") {
        if (activeSeason.value.season != "1") {
            imgData.value.title = routerParams.value.name + " " + activeSeason.value.name;
        } else {
            imgData.value.title = routerParams.value.name;
        }
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
            img: CONFIG.IMG_DOMAIN + "/t/p/w1920_and_h1080_bestv2" + res.backdrop_path,
            score: res.vote_average.toFixed(1),
            releaseTime: res.release_date,
            runtime: calTime(res.runtime),
            runtimeEn: calTime(res.runtime, "en"),
            genres: res.genres.map((i) => i.name).join(" "),
            title: res.title,
        };
    } else if (routerParams.value.type == "tv") {
        seasonFirst.value.img = imgData.value.img = CONFIG.IMG_DOMAIN + "/t/p/w1920_and_h1080_bestv2" + res.backdrop_path;
        seasonFirst.value.overview = res.overview;
        imgData.value.score = res.vote_average.toFixed(1);
        imgData.value.genres = res.genres.map((i) => i.name).join(" ");
        imgData.value.releaseTime = res.first_air_date;
        imgData.value.runtime = `共${res.number_of_episodes || 0}集（库中有0集）`;
    }
    return res;
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
                    url: `/pages/mobile/video/video-player?path=${selectSource.value.path.slice(1)}&type=movie`,
                });
            } else {
                uni.navigateTo({
                    url: `/pages/mobile/video/video-player?path=${selectSource.value.path.slice(1)}&folderFileId=${selectSource.value.folderFileId}&type=movie`,
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
                sourceType: selectType.value.type, //这个播放记录归属于哪个类型，比如webdav，天翼云盘，夸克网盘
                sourceName: selectMedia.value.name, //这个播放记录再具体到某个类型下的哪一个
            };
            if (selectType.value.type == "WebDAV") {
                uni.navigateTo({
                    url: `/pages/mobile/video/video-player?path=${selectSource.value.path.slice(1)}&item=${encodeURIComponent(JSON.stringify(historyItem))}&type=movie`,
                });
            } else {
                historyItem.folderFileId = selectSource.value.folderFileId;
                uni.navigateTo({
                    url: `/pages/mobile/video/video-player?path=${selectSource.value.path.slice(1)}&folderFileId=${selectSource.value.folderFileId}&item=${JSON.stringify(historyItem)}&type=movie`,
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
                    url: `/pages/mobile/video/video-player?path=${activeSeason.value.path.slice(1)}/${history.name}&type=tv${toStringfy(openEndTime) ? "&" + toStringfy(openEndTime) : ""}`,
                });
            } else {
                uni.navigateTo({
                    url: `/pages/mobile/video/video-player?path=${activeSeason.value.path.slice(1)}/${history.name}&wjjId=${activeSeason.value.folderFileId}&folderFileId=${history.folderFileId}&type=tv${toStringfy(openEndTime) ? "&" + toStringfy(openEndTime) : ""}`,
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
                sourceType: selectType.value.type, //这个播放记录归属于哪个类型，比如webdav，天翼云盘，夸克网盘
                sourceName: selectMedia.value.name, //这个播放记录再具体到某个类型下的哪一个
            };
            let openEndTime = {};
            routerParams.value.movieTvId ? "" : (openEndTime.noSetHistory = 0);
            nowTv.openingTime >= 0 ? (openEndTime.openingTime = nowTv.openingTime) : "";
            nowTv.endTime >= 0 ? (openEndTime.endTime = nowTv.endTime) : "";
            if (selectType.value.type == "WebDAV") {
                uni.navigateTo({
                    url: `/pages/mobile/video/video-player?path=${activeSeason.value.path.slice(1)}/${tvList.value[0].name}&item=${encodeURIComponent(JSON.stringify(historyItem))}&type=tv${toStringfy(openEndTime) ? "&" + toStringfy(openEndTime) : ""}`,
                });
            } else {
                historyItem.folderFileId = tvList.value[0].id;
                uni.navigateTo({
                    url: `/pages/mobile/video/video-player?path=${activeSeason.value.path.slice(1)}/${tvList.value[0].name}&wjjId=${activeSeason.value.folderFileId}&folderFileId=${tvList.value[0].id}&item=${JSON.stringify(historyItem)}&type=tv${toStringfy(openEndTime) ? "&" + toStringfy(openEndTime) : ""
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
                url: `/pages/mobile/video/video-player?path=${activeSeason.value.path.slice(1)}/${item.name}&type=tv${toStringfy(openEndTime) ? "&" + toStringfy(openEndTime) : ""}`,
            });
        } else {
            uni.navigateTo({
                url: `/pages/mobile/video/video-player?path=${activeSeason.value.path.slice(1)}/${item.name}&wjjId=${activeSeason.value.folderFileId}&folderFileId=${item.id}&type=tv${toStringfy(openEndTime) ? "&" + toStringfy(openEndTime) : ""}`,
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
            sourceType: selectType.value.type, //这个播放记录归属于哪个类型，比如webdav，天翼云盘，夸克网盘
            sourceName: selectMedia.value.name, //这个播放记录再具体到某个类型下的哪一个
        };

        let openEndTime = {};
        routerParams.value.movieTvId ? "" : (openEndTime.noSetHistory = 0);
        nowTv.openingTime >= 0 ? (openEndTime.openingTime = nowTv.openingTime) : "";
        nowTv.endTime >= 0 ? (openEndTime.endTime = nowTv.endTime) : "";
        if (selectType.value.type == "WebDAV") {
            uni.navigateTo({
                url: `/pages/mobile/video/video-player?path=${activeSeason.value.path.slice(1)}/${item.name}&item=${encodeURIComponent(JSON.stringify(historyItem))}&type=tv${toStringfy(openEndTime) ? "&" + toStringfy(openEndTime) : ""}`,
            });
        } else {
            historyItem.folderFileId = item.id;
            uni.navigateTo({
                url: `/pages/mobile/video/video-player?path=${activeSeason.value.path.slice(1)}/${item.name}&wjjId=${activeSeason.value.folderFileId}&folderFileId=${item.id}&item=${JSON.stringify(historyItem)}&type=tv${toStringfy(openEndTime) ? "&" + toStringfy(openEndTime) : ""
                    }`,
            });
        }
    }
};

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
        let historyArr = uni.getStorageSync("historyPlay") || [];
        historyArr = historyArr.filter((v) => v.sourceType != selectType.value.type || v.sourceName != selectMedia.value.name);
        uni.setStorageSync("historyPlay", [...historyArr, ...historyPlay.value]);
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
            nowMovie.poster = CONFIG.IMG_DOMAIN + "/t/p/w300_and_h450_bestv2" + res.poster_path;
            nowMovie.releaseTime = res.release_date;
            nowMovie.type = "2";
            nowMovie.movieTvId = res.id;
            nowMovie.genre_ids = res.genres.map((i) => i.id);
            nowMovie.name = res.title;
        }
        imgData.value.title = resetMovieTv.name;
        uni.setStorageSync("localMovieTvData", localMovieTvData.value);
        actor_list.value.getActorList();
    }
};

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

//打开右侧弹窗
const openPopup = (val) => {
    showRightPopup.value = true
    focusModel.value = val
}

//回到左侧按钮
const backLeft = () => {
    showRightPopup.value = false
    focusModel.value = 'operationButton'
}

onBeforeMount(async () => {
    judgeSelect();
    // historyPlay.value = uni.getStorageSync('historyPlay') || []
    historyPlay.value = historyPlay.value.filter((v) => v.sourceType == selectType.value.type && v.sourceName == selectMedia.value.name);
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
    getMovieTvDetail();
    if (routerParams.value.type == "tv") {
        await handleTv();
    }
    nextTick(() => {
        historyTv.value.name ? (scrollIntoView.value = "name" + historyTv.value.ji) : "";
    });
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
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    position: relative;
    display: flex;
    align-items: center;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1;
        /* 半透明黑色遮罩 */
    }

    .video-detail-left {
        position: relative;
        z-index: 2;
        flex: 0 0 40%;
        height: 100%;
        padding: 30rpx 80rpx 30rpx 80rpx;
        box-sizing: border-box;
        background: linear-gradient(to right, black 0%, rgba(0, 0, 0, 0.7) 80%, rgba(0, 0, 0, 0) 100%);
        display: flex;
        flex-direction: column;

        .left-title {
            color: #fff;
            font-size: 70rpx;
        }

        .left-info {
            display: flex;
            align-items: center;
            padding-top: 20rpx;

            .left-info-date {
                display: flex;
                align-items: center;

                image {
                    width: 30rpx;
                    height: 30rpx;
                }

                span {
                    font-size: 28rpx;
                    color: #fff;
                    padding-left: 10rpx;
                }

            }

            .left-info-score {
                display: flex;
                align-items: center;
                padding-left: 14rpx;

                image {
                    width: 30rpx;
                    height: 30rpx;
                }

                span {
                    font-size: 28rpx;
                    color: #fff;
                    padding-left: 10rpx;
                }
            }

            .left-info-runtime {
                color: #fff;
                padding: 0 14rpx;

            }
        }

        .left-genres {
            padding-top: 20rpx;
            color: #fff;
            font-size: 32rpx;

        }

        .left-overview {
            margin-top: 20rpx;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #c2c5c6;
        }
    }

    .video-detail-right {
        flex: 1;
        height: 100%;
        position: relative;

        ::v-deep .nut-popup {
            width: 100%;
            height: 100%;
            position: absolute;
            background: transparent !important;
            padding: 40rpx;
        }
    }
}
</style>