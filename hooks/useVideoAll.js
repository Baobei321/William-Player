import { ref, nextTick, onMounted } from "vue";
import { onShow, onLoad } from "@dcloudio/uni-app";
import emptyBg from "@/static/empty_bg.png";
import { toStringfy } from "../pages/mobile/mine/common";
import { handleSeasonName, handleSecond, parseTime } from "@/utils/scrape.js";
import posterEmpty from "@/static/poster-empty.png";
import * as CONFIG from "@/utils/config";

export function useVideoAll({ wil_list, wil_modal }) {
    const requestParams = ref({});
    const mapping = {
        "电影": "movie",
        "电视剧": "tv",
    };

    const routerParams = ref({});
    const recentSelect = ref([]);
    const isSelect = ref(false);
    const isClearAll = ref(false);

    const selectType = ref({});
    const selectMedia = ref({});

    const showPopover = ref(false);

    const lineNumber = ref(3);
    const lineHeight = ref("");

    const windowWidth = ref(375);
    const changeSort = () => {
        wil_list.value.reload();
    };
    //判断选择的是webdav还是天翼云盘还是夸克
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
    const removeExtension = (item) => {
        if (routerParams.value.title == "最近观看") {
            if (item.type == "tv") {
                item.name1 = `${item.titlePlay} 第${item.ji}集 ${item.title || '第' + item.ji + '集'}`;
                const firstDotIndex = item.name1.indexOf(".");
                let name = firstDotIndex === -1 ? item.name1 : item.name1.substring(0, firstDotIndex);
                if (name.length > 12) {
                    name = name.slice(0, 11) + "...";
                }
                return name;
            } else if (item.type == "movie") {
                const firstDotIndex = item.name.indexOf(".");
                let name = firstDotIndex === -1 ? item.name : item.name.substring(0, firstDotIndex);
                if (name.length > 7) {
                    name = name.slice(0, 6) + "...";
                }
                return name;
            }
        }
        const firstDotIndex = item.name.indexOf(".");
        let name = firstDotIndex === -1 ? item.name : item.name.substring(0, firstDotIndex);
        name = handleSeasonName(name, true);
        if (name.length > 7) {
            name = name.slice(0, 6) + "...";
        }
        return name;
    };
    const getMovieTvList = async (params) => {
        let res = null;
        if (routerParams.value.title == "最近观看") {
            res = uni.getStorageSync("historyPlay");
            res = res.filter((v) => v.sourceType == selectType.value.type && v.sourceName == selectMedia.value.name);
            res.forEach((item) => {
                item.loadImg = true;
            });
            return {
                code: "200",
                rows: res.slice((params.pageNum - 1) * params.pageSize, params.pageNum * params.pageSize),
                total: res.length,
            };
        } else if (routerParams.value.title == "电视剧" || routerParams.value.title == "电影") {
            res = uni.getStorageSync("localMovieTvData");
            let arr = res[mapping[routerParams.value.title]];
            arr.forEach((item) => {
                item.loadImg = true;
            });
            return {
                code: "200",
                rows: arr.slice((params.pageNum - 1) * params.pageSize, params.pageNum * params.pageSize),
                total: arr.length,
            };
        } else {
            res = uni.getStorageSync("localMovieTvData");
            let arr = [];
            arr.push(...res.movie.filter((i) => i.genre_ids?.indexOf(+routerParams.value.genreId) > -1));
            arr.push(...res.tv.filter((i) => i.genre_ids?.indexOf(+routerParams.value.genreId) > -1));
            arr.forEach((item) => {
                item.loadImg = true;
            });
            return {
                code: "200",
                rows: arr.slice((params.pageNum - 1) * params.pageSize, params.pageNum * params.pageSize),
                total: arr.length,
            };
        }
    };

    //裁剪格式获取电影名
    const getMovieName = (val) => {
        const lastDotIndex = val.lastIndexOf(".");
        let name = lastDotIndex === -1 ? val : val.substring(0, lastDotIndex);
        return name;
    };
    //将点击了的视频放置到数组的第一个去
    const setItemFirst = (item) => {
        let historyPlay = uni.getStorageSync("historyPlay");
        let historyArr1 = historyPlay.filter((v) => v.sourceType != selectType.value.type || v.sourceName != selectMedia.value.name);
        let historyArr2 = historyPlay.filter((v) => v.sourceType == selectType.value.type && v.sourceName == selectMedia.value.name);
        let index = null;
        if (item.type == "tv") {
            index = historyArr2.findIndex((i) => i.type == item.type && i.titlePlay == item.titlePlay);
        } else if (item.type == "movie") {
            index = historyArr2.findIndex((i) => i.type == item.type && getMovieName(i.name) == getMovieName(item.name));
        }
        if (index > -1) {
            historyArr2.splice(index, 1);
            historyArr2.unshift(item);
        } else {
            historyArr2.unshift(item);
        }
        uni.setStorageSync("historyPlay", [...historyArr1, ...historyArr2]);
    };
    const toVideoDetail = async (item) => {
        //最近观看在选择状态下
        if (isSelect.value) {
            changeItemFn.value = (vitem) => {
                vitem.select ? (vitem.select = false) : (vitem.select = true);
            };
            if (item.select) {
                recentSelect.value = recentSelect.value.filter((i) => i.titlePlay != item.titlePlay);
            } else {
                recentSelect.value.push(item);
            }
            nextTick(() => {
                wil_list.value.handleEdit(item.path);
            });
        } else {
            if (routerParams.value.title != "最近观看") {
                uni.navigateTo({
                    url: `/pages/${CONFIG.PLATFORM === 'TV' ? 'tv' : 'mobile'}/video/video-detail?path=${item.path}&name=${handleSeasonName(item.name, true)}&type=${item.type == "1" ? "tv" : "movie"}&source=${JSON.stringify(item.source)}&movieTvId=${item.movieTvId}`,
                });
            } else {
                if (item.type == "movie") {
                    if (selectType.value.type == "WebDAV") {
                        uni.navigateTo({
                            url: `/pages/${CONFIG.PLATFORM === 'TV' ? 'tv' : 'mobile'}/video/video-player?path=${item.path}&type=movie`,
                            success: () => {
                                setItemFirst(item);
                            },
                        });
                    } else {
                        uni.navigateTo({
                            url: `/pages/${CONFIG.PLATFORM === 'TV' ? 'tv' : 'mobile'}/video/video-player?path=${item.path}&folderFileId=${item.folderFileId}&type=movie`,
                            success: () => {
                                setItemFirst(item);
                            },
                        });
                    }
                } else if (item.type == "tv") {
                    let localMovieTvData = uni.getStorageSync("localMovieTvData") || {};
                    const lastIndex = item.path.lastIndexOf("/");
                    let nowTv = localMovieTvData.tv.find((i) => i.name == item.titlePlay && i.path == "/" + item.path.slice(0, lastIndex));
                    let openEndTime = {};
                    nowTv.openingTime >= 0 ? (openEndTime.openingTime = nowTv.openingTime) : "";
                    nowTv.endTime >= 0 ? (openEndTime.endTime = nowTv.endTime) : "";
                    if (selectType.value.type == "WebDAV") {
                        uni.navigateTo({
                            url: `/pages/${CONFIG.PLATFORM === 'TV' ? 'tv' : 'mobile'}/video/video-player?path=${item.path}&titlePlay=${item.titlePlay}&type=tv&${toStringfy(openEndTime)}`,
                            success: () => {
                                setItemFirst(item);
                            },
                        });
                    } else {
                        uni.navigateTo({
                            url: `/pages/${CONFIG.PLATFORM === 'TV' ? 'tv' : 'mobile'}/video/video-player?path=${item.path}&folderFileId=${item.folderFileId}&titlePlay=${item.titlePlay}&type=tv&${toStringfy(openEndTime)}`,
                        });
                    }
                }
            }
        }
    };
    const setRecentImg = (poster) => {
        if (poster) {
            return poster
        } else {
            return emptyBg;
        }
    }
    const setEmptyImg = (poster) => {
        if (poster) {
            return CONFIG.IMG_DOMAIN + "/t/p/w300_and_h450_bestv2" + poster;
        } else {
            return posterEmpty;
        }
    };

    const longPress = (item) => {
        if (routerParams.value.title != "最近观看" || isSelect.value) return;
        isSelect.value = true;
        changeItemFn.value = (vitem) => {
            vitem.select ? (vitem.select = false) : (vitem.select = true);
        };
        if (item.select) {
            recentSelect.value = recentSelect.value.filter((i) => i.titlePlay != item.titlePlay);
        } else {
            recentSelect.value.push(item);
        }
        nextTick(() => {
            wil_list.value.handleEdit(item.path);
        });
    };

    const editHistory = () => {
        isSelect.value = !isSelect.value;
        changeItemFn.value = (item) => {
            item.select = false;
        };
        recentSelect.value = [];
        nextTick(() => {
            let historyPlay = uni.getStorageSync("historyPlay");
            historyPlay.forEach((item) => {
                wil_list.value.handleEdit(item.path);
            });
        });
    };

    const clearAll = () => {
        wil_modal.value.showModal({
            title: "温馨提示",
            content: "是否清空全部播放记录？",
            confirmColor: "#ff6701",
            confirm: async () => {
                recentSelect.value = [];
                isClearAll.value = true;
                isSelect.value = false;
                let historyArr = uni.getStorageSync("historyPlay");
                historyArr = historyArr.filter((v) => v.sourceType != selectType.value.type || v.sourceName != selectMedia.value.name);
                uni.setStorageSync("historyPlay", historyArr);
            },
        });
    };

    const clearPart = () => {
        let historyPlay = uni.getStorageSync("historyPlay");
        if (recentSelect.value.length == historyPlay.length) {
            recentSelect.value = [];
            isClearAll.value = true;
            isSelect.value = false;
            historyPlay = historyPlay.filter((v) => v.sourceType != selectType.value.type || v.sourceName != selectMedia.value.name);
            uni.setStorageSync("historyPlay", historyPlay);
        } else {
            let historyArr = historyPlay.filter((v) => v.sourceType == selectType.value.type && v.sourceName == selectMedia.value.name);
            historyArr = historyArr.filter((item) => {
                return recentSelect.value.every((v) => v.path != item.path);
            });
            historyPlay = historyPlay.filter((v) => v.sourceType != selectType.value.type || v.sourceName != selectMedia.value.name);
            recentSelect.value.forEach((item) => {
                wil_list.value.handleDelete(item.path);
            });
            recentSelect.value = [];
            isSelect.value = false;
            uni.setStorageSync("historyPlay", [...historyPlay, ...historyArr]);
        }
    };
    const changeItemFn = ref(() => { });
    const imgError = (item) => {
        changeItemFn.value = (item) => {
            item.loadImg = false;
        };
        nextTick(() => {
            wil_list.value.handleEdit(item.path);
        });
    };

    const imgLoad = (item) => {
        if (!routerParams.value.isConnected && !item.loadImg) return;
        changeItemFn.value = (item) => {
            item.loadImg = true;
        };
        nextTick(() => {
            wil_list.value.handleEdit(item.path);
        });
    };

    //设置平板的宽高
    const setItemWidth = () => {
        let sysinfo = uni.getSystemInfoSync(); // 获取设备系统对象
        windowWidth.value = sysinfo.windowWidth;
        const scale = uni.upx2px(100) / 100; // 获取1rpx对应的px比例
        if (windowWidth.value > 700) {
            if (routerParams.value.title != "最近观看") {
                lineNumber.value = Math.floor((windowWidth.value - 24) / 109);
                let remain = windowWidth.value - 24 - lineNumber.value * 109;
                if (remain < (lineNumber.value - 1) * 12) {
                    lineNumber.value--;
                }
                lineHeight.value = (((windowWidth.value - uni.upx2px(24 * lineNumber.value + 24)) / lineNumber.value) * 160) / 109 / scale + "rpx";
            } else {
                lineNumber.value = Math.floor((windowWidth.value - 24) / 169.5);
                let remain = windowWidth.value - 24 - lineNumber.value * 169.5;
                if (remain < (lineNumber.value - 1) * 12) {
                    lineNumber.value--;
                }
                lineHeight.value = (((windowWidth.value - uni.upx2px(24 * lineNumber.value + 24)) / lineNumber.value) * 90) / 169.5 / scale + "rpx";
            }
        } else {
            if (routerParams.value.title != "最近观看") {
                lineNumber.value = 3;
                lineHeight.value = (((windowWidth.value - uni.upx2px(24 * lineNumber.value + 24)) / lineNumber.value) * 160) / 109 / scale + "rpx";
            } else {
                lineNumber.value = 2;
                lineHeight.value = (((windowWidth.value - uni.upx2px(24 * lineNumber.value + 24)) / lineNumber.value) * 90) / 169.5 / scale + "rpx";
            }
        }
    };

    const listItemStyle = (item) => {
        if (item.index % lineNumber.value == 0) {
            return { marginLeft: 0 };
        } else {
            return { marginLeft: "24rpx" };
        }
    };

    onLoad((options) => {
        judgeSelect();
        routerParams.value = options;
        routerParams.value.isConnected = routerParams.value.isConnected1 == "true" ? true : false;
        setItemWidth();
        uni.setNavigationBarTitle({
            title: routerParams.value.title,
        });
    });

    return {
        routerParams, showPopover, editHistory, isSelect, mapping, changeSort, isClearAll,
        getMovieTvList, requestParams, windowWidth, changeItemFn, listItemStyle, lineNumber, lineHeight,
        toVideoDetail, longPress, setRecentImg, setEmptyImg, imgError, imgLoad, removeExtension, clearAll, recentSelect, clearPart
    }
}