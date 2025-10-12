<template>
    <div class="video-player">
        <mpv-player :video-url="config.url"></mpv-player>
    </div>
</template>

<script setup>
import { onBeforeMount, reactive, ref } from 'vue';
import mpvPlayer from './components/mpv-player.vue';
import { useRoute } from 'vue-router';
import { getWebDAVUrl, get189VideoUrl, loginUser, getQuarkResolutionUrl, getQuarkVideoUrl, getFolder, getTvSeason, get189Folder, getQuarkFolder } from "@/utils/common";
import { calTime, handleSeasonName, generateChineseNumberMapping } from "@/utils/scrape";
import { addOperLog } from "@/network/apis";
import { IMG_DOMAIN } from "@/utils/config";

const route = useRoute()

const config = reactive({
    url: "",
    // 是否自动播放
    autoplay: true,
    //播放器预览背景图片，支持网络地址
    poster: "",
    //是否循环播放
    loop: false,
    //开始播放位置，单位：秒
    initialTime: 0,
    //是否是直播
    isLive: false,
    //是否静音播放
    muted: false,
    codec: "hardware",
    title: "",
    playStrategy: 0,
    cookieStr: "",
})
const uniPlatform = ref('')
const plateForm = ref('')
const settingData = ref({})
const historyObj = ref({
    initialTime: "0",
})
let sum = 0
let sourceList = []
let selectType = {}
let selectMedia = {}
let historyPlay = []
//判断选择的是webdav还是天翼云盘还是夸克
const judgeSelect = () => {
    sourceList = uni.getStorageSync("sourceList");
    selectType =
        sourceList.find((item) => {
            let select = item.list.find((i) => i.active);
            if (select) {
                selectMedia = select;
                return true;
            } else {
                return false;
            }
        }) || {};
}
const getVideoUrl = async () => {
    judgeSelect();
    if (selectType.type == "WebDAV") {
        if (selectMedia.name) {
            let res = await getWebDAVUrl(
                {
                    path: decodeURIComponent(route.query.path),
                },
                selectMedia
            );
            return res;
        }
    } else if (selectType.type == "天翼云盘") {
        if (selectMedia.name) {
            let res = await get189VideoUrl(
                {
                    folderFileId: route.query.folderFileId,
                },
                selectMedia
            );
            return res;
        }
    } else if (selectType.type == "夸克网盘") {
        if (selectMedia.name) {
            let res = await getQuarkResolutionUrl(
                {
                    folderFileId: route.query.folderFileId,
                },
                selectMedia
            );
            // let res = await getQuarkVideoUrl({ folderFileId: route.query.folderFileId }, selectMedia);
            return res;
        }
    } else if (selectType.type == 'Emby') {
        if (selectMedia.name) {
            let res = await getEmbyPlayerUrl(
                {
                    folderFileId: route.query.folderFileId,
                },
                selectMedia
            );
            // let res = await getQuarkVideoUrl({ folderFileId: route.query.folderFileId }, selectMedia);
            return res;
        }
    }
}
const setQuarkUrl = (res, num) => {
    if (num == 5) return;
    if (res.data.video_list[num].video_info?.url) {
        config.url = res.data.video_list[num].video_info.url;
    } else {
        num++;
        setQuarkUrl(res, num);
    }
}
const setUrl = async () => {
    let res = await getVideoUrl();
    if (selectType.type == "WebDAV") {
        config.url = res.data.raw_url;
        addOperLog({
            title: config.title.slice(0, 30),
            businessType: 10,
            operatorType: 2,
            operUrl: config.url,
        });
    } else if (selectType.type == "天翼云盘") {
        // config.url = res.normal.url;
        uni.request({
            url: res.normal.url,
            method: "HEAD",
            success: (res) => {
                resolve(res.data);
            },
        });
    } else if (selectType.type == "夸克网盘") {
        if (res.data.video_list[0].video_info?.url) {
            config.url = res.data.video_list[0].video_info.url;
            addOperLog({
                title: config.title.slice(0, 30),
                businessType: 10,
                operatorType: 2,
                operUrl: config.url,
            });
            // addOperLog({ title: config.title.slice(0, 30), businessType: 10, operatorType: 2, operUrl: res.data[0].download_url });
            // config.url = res.data[0].download_url;
        } else {
            let num = 1;
            uni.showToast({
                title: "不是88vip以上或者登录已过期",
                icon: "none",
            });
            setQuarkUrl(res, num);
        }
    }
}

const setHistory = (event) => {
    if (route.query.noSetHistory == 0) return;
    if (!route.query.type) return;
    if (plateForm.value == "ios") {
        sum += 1;
        if (sum == 5) {
            sum = 0;
            historyObj.value.initialTime = Math.round(event.detail.currentTime);
            let index = null;
            if (route.query.type == "tv") {
                index = historyPlay.findIndex((i) => i.type == route.query.type && i.movieTvId == historyObj.value.movieTvId && handleSeasonName(i.titlePlay) == handleSeasonName(historyObj.value.titlePlay));
            } else if (route.query.type == "movie") {
                index = historyPlay.findIndex((i) => i.type == route.query.type && handleSeasonName(i.name, true) == handleSeasonName(historyObj.value.name, true));
            }
            if (index > -1) {
                historyPlay.splice(index, 1);
                historyPlay.unshift(historyObj.value);
            } else {
                if (historyObj.value.type) {
                    historyPlay.unshift(historyObj.value);
                }
            }
        }
    } else if (plateForm == "android") {
        historyObj.value.initialTime = Math.round(event.detail.currentTime);
        historyObj.value.wjjId = route.query.wjjId;
        let index = null;
        if (route.query.type == "tv") {
            index = historyPlay.findIndex((i) => i.type == route.query.type && i.movieTvId == historyObj.value.movieTvId && handleSeasonName(i.titlePlay) == handleSeasonName(historyObj.value.titlePlay));
        } else if (route.query.type == "movie") {
            index = historyPlay.findIndex((i) => i.type == route.query.type && handleSeasonName(i.name) == handleSeasonName(historyObj.value.name));
        }
        if (index > -1) {
            historyPlay.splice(index, 1);
            historyPlay.unshift(historyObj.value);
        } else {
            if (historyObj.value.type) {
                historyPlay.unshift(historyObj.value);
            }
        }
    }
    arriveTimeNext();
}
//初始化进入的时候，设置从哪儿开始播放
const setInitialTime = () => {
    if (!decodeURIComponent(route.query.path)) return;
    const lastIndex = decodeURIComponent(route.query.path).lastIndexOf("/");
    let obj = {};
    if (route.query.type == "movie") {
        let name = decodeURIComponent(route.query.path).substring(lastIndex + 1);
        obj = historyPlay?.find((i) => i.name == name) || {};
    } else if (route.query.type == "tv") {
        let name = decodeURIComponent(route.query.path).substring(lastIndex + 1);
        const secondLastSlashIndex = decodeURIComponent(route.query.path).lastIndexOf("/", lastIndex - 1);
        // let titlePlay = handleSeasonName(route.query.titlePlay, true);
        let titlePlay = handleSeasonName(decodeURIComponent(route.query.path).substring(secondLastSlashIndex + 1, lastIndex), true);
        obj = historyPlay?.find((i) => i.name == name && i.path == route.query.path) || {};
    }
    if (route.query.item) {
        historyObj.value = JSON.parse(decodeURIComponent(route.query.item));
        config.poster = historyObj.value.poster;
        config.initialTime = route.query.openingTime ? +route.query.openingTime : 0;
    } else {
        if (route.query.type) {
            historyObj.value = obj;
            config.poster = historyObj.value.poster;
        } else {
            config.initialTime = 0;
            config.title = decodeURIComponent(route.query.path).substring(lastIndex + 1);
            historyObj.value = {};
            return;
        }
        config.initialTime = Number(historyObj.value.initialTime) || 0;
    }

    if (route.query.type == "movie") {
        config.title = handleSeasonName(historyObj.value.title, true);
    } else {
        if (historyObj.value.titlePlay) {
            config.title = historyObj.value.titlePlay + " " + "第" + historyObj.value.ji + "集 " + historyObj.value.title;
        } else {
            config.title = decodeURIComponent(route.query.path).substring(lastIndex + 1);
        }
    }
}
onBeforeMount(() => {
    judgeSelect();
    let systemInfo = uni.getSystemInfoSync();
    plateForm.value = systemInfo.platform;
    uniPlatform.value = systemInfo.uniPlatform;
    settingData.value = uni.getStorageSync("settingData");
    historyPlay = uni.getStorageSync("historyPlay") || [];
    historyPlay = historyPlay.filter((v) => v.sourceType == selectType.type && v.sourceName == selectMedia.name);
    setInitialTime();
    if (route.query.videoUrl) {
        config.url = decodeURIComponent(route.query.videoUrl);
        config.title = route.query.liveTitle;
        return;
    }
    console.log(route.query,'route.query');
    setUrl();
})
</script>

<style lang="scss" scoped>
.video-player {
    width: 100%;
    height: 100%;
    background: #000;
}
</style>
