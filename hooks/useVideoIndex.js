import { ref, onBeforeMount } from "vue";
import { setTmdbKey, getUntokenDicts, addOperLog } from "@/network/apis";
import { loginUser, getFolder, getTvSeason, get189Folder, getQuarkFolder, getCutContent } from "@/utils/common";
import { handleSeasonName, handleNameYear, generateChineseNumberMapping, recursionMovie, recursionTv } from "@/utils/scrape";
import { toStringfy } from "@/pages/mobile/mine/common";
import { onShow, onUnload } from "@dcloudio/uni-app";
import { chineseToPinYin } from "@/utils/pinyin.js";
import * as CONFIG from "@/utils/config";
import Folder from "@/static/folder.png";
import webdavFileIcon from "@/static/webdav-fileIcon.png";

export function useVideoIndex() {
    const video_navbar = ref(null);
    const listData = ref([]);
    const sourceList = ref([]);
    const refreshData = ref({ found: 0, toupdate: 0, updated: 0, success: 0, fail: 0 });
    const refreshLoading = ref(false);
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
    const settingData = ref({}); //设置的数据

    //通过tmdb接口获取更详细的信息
    const searchMovieTv = (data, type) => {
        let url = "";
        if (type == "movie") {
            url = "https://api.tmdb.org/3/search/movie";
            data.primary_release_year = data.first_air_date_year;
            delete data.first_air_date_year;
        } else if (type == "tv") {
            url = "https://api.tmdb.org/3/search/tv";
        }
        return new Promise((resolve, reject) => {
            uni.request({
                url: url,
                data: {
                    ...data,
                    language: "zh-CN",
                    page: 1,
                    api_key: uni.getStorageSync("settingData").tmdbKey,
                },
                timeout: 10000,
                method: "GET",
                header: { "Content-Type": "application/json" },
                success: (res) => {
                    resolve(res.data);
                },
                fail: (error) => {
                    reject(error);
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
        const chineseNumber = generateChineseNumberMapping(40, "number");
        const map = new Map();
        let arr1 = arr.sort((a, b) => {
            const nameA = chineseToPinYin(a.name).toLowerCase().slice(0, 1);
            const nameB = chineseToPinYin(b.name).toLowerCase().slice(0, 1);
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        });
        arr1.forEach((item) => {
            if (!map.has(handleSeasonName(item.name, true))) {
                let deleteProp = ["created", "hash_info", "hashinfo", "is_dir", "modified", "sign"];
                deleteProp.forEach((v) => {
                    delete item[v];
                });
                map.set(handleSeasonName(item.name, true), {
                    ...item,
                    provider: null,
                    source: [],
                });
            }
            let source = map.get(handleSeasonName(item.name, true)).source;
            if (!source.length) {
                source.push({
                    provider: item.provider,
                    size: handleSize(item.size) || 0,
                    path: item.path,
                    folderFileId: item.id, //电影的folderFileId放在这个层级
                    name: item.name,
                    seasonArr: [{ name: `第${chineseNumber[item.season]}季`, path: item.seasonPath, season: String(item.season), folderFileId: item.folderFileId }], //电视剧的folderFileId放在这个层级
                });
            } else {
                let nowSource = source.find((v) => v.name == item.name && v.path == item.path);
                if (nowSource) {
                    nowSource.seasonArr.push({ name: `第${chineseNumber[item.season]}季`, path: item.seasonPath, season: String(item.season), folderFileId: item.folderFileId });
                    nowSource.seasonArr = nowSource.seasonArr.sort((a, b) => {
                        return Number(a.season) - Number(b.season);
                    });
                } else {
                    source.push({
                        provider: item.provider,
                        size: handleSize(item.size) || 0,
                        path: item.path,
                        folderFileId: item.id,
                        name: item.name,
                        seasonArr: [{ name: `第${chineseNumber[item.season]}季`, path: item.seasonPath, season: String(item.season) }],
                    });
                }
            }
        });
        const result = Array.from(map.values());
        return result;
    };

    const refreshWebDavVideo = async () => {
        refreshData.value = { found: 0, toupdate: 0, updated: 0, success: 0, fail: 0 };
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
            wil_modal.value.showModal({
                title: "温馨提示",
                content: "未刮削出海报墙，是否要查看教程？",
                confirmColor: "#ff6701",
                confirm: async () => {
                    let query = {
                        url: CONFIG.BASE_URL.split(":4040")[0] + ":8080/app-webview",
                        title: "问题与反馈",
                    };
                    uni.navigateTo({
                        url: "/pages/mobile/backend/index" + "?" + toStringfy(query),
                    });
                },
            });
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
                uni.showToast({
                    title: "请填写正确的api_key",
                    icon: "none",
                });
            });
        localMovieTvData.value.tv = await setMovieTvImg(tv, "tv");
        refreshData.value.updated = refreshData.value.toupdate;
        refreshData.value.toupdate = 0;
        refreshData.value.success = localMovieTvData.value.movie.length + localMovieTvData.value.tv.length;
        uni.setStorageSync("localMovieTvData", localMovieTvData.value);
        refreshLoading.value = false;
        addOperLog({ title: "WebDAV生成海报墙", businessType: 11, operatorType: 2 });
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
            let videoFormat = ["mp4", "mkv", "m2ts", "avi", "mov", "ts", "m3u8", "iso"];
            for (let item of arr) {
                if (item.type != "1") continue;
                if (item.name == "电影") {
                    let movieResult = await getFolder({ path: path + "电影" }, selectMedia.value);
                    movieResult.data.content ? "" : (movieResult.data.content = []);
                    await Promise.allSettled(
                        movieResult.data.content.map(async (v) => {
                            v.path = path + "电影/" + v.name;
                            v.provider = movieResult.data.provider;
                            if (v.type == "1") {
                                await recursionMovie(v, movieTvData.value.movie, selectType.value, selectMedia.value, refreshData.value);
                            } else {
                                if (videoFormat.some((i) => v.name.includes(i))) {
                                    movieTvData.value.movie.push(v);
                                    refreshData.value.found++;
                                }
                            }
                        })
                    );
                }
                if (item.name == "电视剧") {
                    let tvResult = await getFolder({ path: path + "电视剧" }, selectMedia.value);
                    tvResult.data.content ? "" : (tvResult.data.content = []);
                    await Promise.allSettled(
                        tvResult.data.content.map(async (v) => {
                            v.path = path + "电视剧/" + v.name;
                            v.provider = tvResult.data.provider;
                            if (v.type == "1") {
                                await recursionTv(v, {}, movieTvData.value.tv, selectType.value, selectMedia.value, refreshData.value);
                            }
                        })
                    );
                }
                if (item.name != "电影" && item.name != "电视剧") {
                    let otherResult = await getFolder({ path: path + item.name }, selectMedia.value);
                    await handleMovieTv(otherResult.data?.content, path + item.name + "/");
                }
            }
        };
        await handleMovieTv(arr1, path1);
    };
    //将网盘中的电影等都设置详细信息
    const setMovieTvImg = async (arr, type) => {
        const processedItems = await Promise.allSettled(
            arr.map(async (item) => {
                try {
                    const numberMapping = generateChineseNumberMapping(40, "string");
                    const match = item.name.match(/第([一二三四五六七八九十\d]+)季/);
                    let season = "";
                    if (match) {
                        if (!isNaN(Number(match[1])) && match[1].trim() !== "") {
                            season = match[1];
                        } else {
                            season = numberMapping[match[1]];
                        }
                    } else {
                        if (item.name.indexOf("特别篇") > -1) {
                            season = "0";
                        } else {
                            season = "1";
                        }
                    }
                    //刮削的时候查询这个影片名是不是在本地已经有了，本地有了的话，就不用去tmdb查了
                    let exitMovieTv = null;
                    let localMovieTvData = uni.getStorageSync("localMovieTvData") || {};
                    if (type == "movie") {
                        exitMovieTv = localMovieTvData.movie?.find((i) => i.path == item.path) || null;
                    } else if (type == "tv") {
                        exitMovieTv = localMovieTvData.tv?.find((i) => i.path == item.path) || null;
                    }
                    let res = {};
                    let data = {};
                    if (!exitMovieTv) {
                        //本地不存在已有的影片，就去查tmdb
                        res = await searchMovieTv({ query: handleSeasonName(item.name), first_air_date_year: handleNameYear(item.name) }, type);
                        if (res.results.length == 1) {
                            data = res.results[0];
                        } else if (res.results.length > 1) {
                            data = res.results.find((vitem) => vitem.name?.includes(handleSeasonName(item.name)) || vitem.title?.includes(handleSeasonName(item.name)));
                        } else {
                            data = { name: handleSeasonName(item.name) };
                        }
                    } else {
                        data = exitMovieTv;
                        item.name = data.name;
                        type == "movie" ? (data.release_date = data.releaseTime) : (data.first_air_date = data.releaseTime);
                        data.id = data.movieTvId;
                        data.poster_path = data.poster;
                        data.backdrop_path = data.backdrop;
                        data.vote_average = data.voteAverage || 0;
                    }
                    if (data) {
                        let newItem = { ...item };
                        newItem.poster = data.poster_path;
                        newItem.backdrop = data.backdrop_path;
                        let seasonRes = null;
                        if (season != "1" && !exitMovieTv) {
                            seasonRes = await getTvSeason({
                                movieTvId: data.id,
                                season: season,
                            });
                            newItem.poster = seasonRes.poster_path;
                        }
                        if (type == "movie") {
                            newItem.releaseTime = data.release_date;
                            newItem.type = "2";
                        } else if (type == "tv") {
                            newItem.season = season;
                            newItem.releaseTime = seasonRes ? seasonRes.air_date : data.first_air_date;
                            newItem.type = "1";
                        }
                        newItem.movieTvId = data.id;
                        newItem.genre_ids = data.genre_ids;
                        newItem.overview = data.overview;
                        newItem.voteAverage = data.vote_average; //评分
                        data.openingTime ? (newItem.openingTime = data.openingTime) : ""; //本地刮削的重新设置片头时间
                        data.endTime ? (newItem.endTime = data.endTime) : ""; //本地刮削的重新设置片头时间
                        return newItem;
                    } else {
                        refreshData.value.fail++;
                        return null;
                    }
                } catch (error) {
                    refreshData.value.fail++;
                    return null;
                }
            })
        );
        return processedItems.filter((item) => item.value !== null && item.status === "fulfilled").map((item) => item.value);
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
                    listData.value = res.data.content.map((item) => {
                        if (item.type == "1") {
                            item.leftIcon = Folder;
                        }
                        return item;
                    });
                }
            }
            if (uni.getStorageSync("settingData").tmdbKey) {
                video_navbar.value.showProgress();
            }
        }
    };

    //天翼云盘refresh
    const refresh189Video = async () => {
        refreshData.value = { found: 0, toupdate: 0, updated: 0, success: 0, fail: 0 };
        movieTvData.value = { movie: [], tv: [] };
        await get189MovieTv(listData.value[0]);
        if (!movieTvData.value.movie.length && !movieTvData.value.tv.length) {
            refreshLoading.value = false;
            wil_modal.value.showModal({
                title: "温馨提示",
                content: "未刮削出海报墙，是否要查看教程？",
                confirmColor: "#ff6701",
                confirm: async () => {
                    let query = {
                        url: CONFIG.BASE_URL.split(":4040")[0] + ":8080/app-webview",
                        title: "问题与反馈",
                    };
                    uni.navigateTo({
                        url: "/pages/mobile/backend/index" + "?" + toStringfy(query),
                    });
                },
            });
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
        refreshData.value.success = localMovieTvData.value.movie.length + localMovieTvData.value.tv.length;
        uni.setStorageSync("localMovieTvData", localMovieTvData.value);
        refreshLoading.value = false;
        addOperLog({ title: "天翼云盘生成海报墙", businessType: 11, operatorType: 2 });
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
                let videoFormat = ["mp4", "mkv", "m2ts", "avi", "mov", "ts", "m3u8", "iso"];
                let movieArr = movieResult.fileListAO.fileList.filter((v) => {
                    v.path = "/我的视频/电影/" + v.name;
                    v.provider = "189CloudPC";
                    return videoFormat.some((i) => v.name.includes(i));
                });
                refreshData.value.found += movieArr.length;
                movieTvData.value.movie.push(...movieArr);
                await Promise.allSettled(
                    movieResult.fileListAO.folderList.map(async (v) => {
                        v.path = "/我的视频/电影/" + v.name;
                        v.provider = "189CloudPC";
                        await recursionMovie(v, movieTvData.value.movie, selectType.value, selectMedia.value, refreshData.value);
                    })
                );
            }
            if (item.name == "电视剧") {
                let tvResult = await get189Folder({ folderId: item.id }, selectMedia.value);
                tvResult.fileListAO.folderList ? "" : (tvResult.fileListAO.folderList = []);
                await Promise.allSettled(
                    tvResult.fileListAO.folderList.map(async (v) => {
                        v.path = "/我的视频/电视剧/" + v.name;
                        v.provider = "189CloudPC";
                        await recursionTv(v, {}, movieTvData.value.tv, selectType.value, selectMedia.value, refreshData.value);
                    })
                );
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
        refreshData.value = { found: 0, toupdate: 0, updated: 0, success: 0, fail: 0 };
        movieTvData.value = { movie: [], tv: [] };
        await getQuarkMovieTv(listData.value[0]);
        if (!movieTvData.value.movie.length && !movieTvData.value.tv.length) {
            refreshLoading.value = false;
            wil_modal.value.showModal({
                title: "温馨提示",
                content: "未刮削出海报墙，是否要查看教程？",
                confirmColor: "#ff6701",
                confirm: async () => {
                    let query = {
                        url: CONFIG.BASE_URL.split(":4040")[0] + ":8080/app-webview",
                        title: "问题与反馈",
                    };
                    uni.navigateTo({
                        url: "/pages/mobile/backend/index" + "?" + toStringfy(query),
                    });
                },
            });
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
        refreshData.value.success = localMovieTvData.value.movie.length + localMovieTvData.value.tv.length;
        uni.setStorageSync("localMovieTvData", localMovieTvData.value);
        refreshLoading.value = false;
        addOperLog({ title: "夸克网盘生成海报墙", businessType: 11, operatorType: 2 });
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
                await Promise.allSettled(
                    movieResult.data.list.map(async (v) => {
                        v.id = v.fid;
                        v.name = v.file_name;
                        v.path = "/我的视频/电影/" + v.file_name;
                        v.provider = "Quark";
                        if (v.file_type == "0") {
                            await recursionMovie(v, movieTvData.value.movie, selectType.value, selectMedia.value, refreshData.value);
                        } else {
                            let videoFormat = ["mp4", "mkv", "m2ts", "avi", "mov", "ts", "m3u8", "iso"];
                            if (videoFormat.some((i) => v.name.includes(i))) {
                                movieTvData.value.movie.push(v);
                                refreshData.value.found++;
                            }
                        }
                    })
                );
            }
            if (item.file_name == "电视剧") {
                let tvResult = await getQuarkFolder({ fid: item.fid }, selectMedia.value);
                tvResult.data.list ? "" : (tvResult.data.list = []);
                tvResult.data.list = tvResult.data.list.map((v) => {
                    return { id: v.fid, name: v.file_name, path: "/我的视频/电视剧/" + v.file_name, provider: "Quark", size: v.size, file_type: v.file_type };
                });
                await Promise.allSettled(
                    tvResult.data.list.map(async (v) => {
                        if (v.file_type == "0") {
                            await recursionTv(v, {}, movieTvData.value.tv, selectType.value, selectMedia.value, refreshData.value);
                        }
                    })
                );
            }
        }
        if (res1.data.list.every((i) => i.file_name != "电影" && i.file_name != "电视剧")) {
            uni.showToast({
                title: "请按照规则设置文件夹",
                icon: "none",
            });
        }
    };

    const refreshVideo = async () => {
        if (selectType.value.type == "WebDAV") {
            await refreshWebDavVideo();
        } else if (selectType.value.type == "天翼云盘") {
            await refresh189Video();
        } else if (selectType.value.type == "夸克网盘") {
            await refreshQuarkVideo();
        }
        historyPlay.value = uni.getStorageSync("historyPlay") || [];
        historyPlay.value = historyPlay.value.filter((v) => v.sourceType == selectType.value.type && v.sourceName == selectMedia.value.name);
        historyPlay.value = historyPlay.value.filter((item) => {
            return (
                localMovieTvData.value.movie?.some((v) => handleSeasonName(v.name, true) == handleSeasonName(item.name, true) && v.movieTvId == item.movieTvId) ||
                localMovieTvData.value.tv?.some((v) => {
                    if (item.season != "1") {
                        return handleSeasonName(v.name, true) == handleSeasonName(item.titlePlay) && v.movieTvId == item.movieTvId;
                    } else {
                        return handleSeasonName(v.name, true) == item.titlePlay && v.movieTvId == item.movieTvId;
                    }
                })
            );
        });
        let historyArr = uni.getStorageSync("historyPlay") || [];
        historyArr = historyArr.filter((v) => v.sourceType != selectType.value.type || v.sourceName != selectMedia.value.name);
        uni.setStorageSync("historyPlay", [...historyArr, ...historyPlay.value]);
    };
    //判断选择的是webdav还是天翼云盘还是夸克
    const judgeSelect = () => {
        sourceList.value = uni.getStorageSync("sourceList");
        selectType.value =
            sourceList.value.find((item) => {
                let select = item.list.find((i) => i.active);
                if (select) {
                    // selectMedia.value.name && selectMedia.value.name != select.name ? uni.setStorageSync("historyPlay", []) : "";
                    selectMedia.value = select;
                    return true;
                } else {
                    return false;
                }
            }) || {};
    };

    onShow(async () => {
        sourceList.value = uni.getStorageSync("sourceList");
        settingData.value = uni.getStorageSync("settingData");
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
                    list: [],
                    img: "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/60/6f/e5/606fe5ab-3bfb-c5e4-5bed-08c9b2b5188f/AppIcon-0-0-1x_U007emarketing-0-7-0-0-85-220.png/350x350.png?",
                },
            ];
            uni.setStorageSync("sourceList", sourceList.value);
        }
        judgeSelect();
        localMovieTvData.value = uni.getStorageSync("localMovieTvData") || {};
        tmdbKey.value = uni.getStorageSync("settingData").tmdbKey || "";
        if (uni.getStorageSync("secondPage") == "videoPlayer") {
            setTimeout(() => {
                historyPlay.value = uni.getStorageSync("historyPlay") || [];
                historyPlay.value = historyPlay.value.filter((v) => v.sourceType == selectType.value.type && v.sourceName == selectMedia.value.name);
                historyPlay.value = historyPlay.value.filter((item) => {
                    return (
                        localMovieTvData.value.movie?.some((v) => handleSeasonName(v.name, true) == handleSeasonName(item.name, true) && v.movieTvId == item.movieTvId) ||
                        localMovieTvData.value.tv?.some((v) => {
                            if (item.season != "1") {
                                return handleSeasonName(v.name, true) == handleSeasonName(item.titlePlay) && v.movieTvId == item.movieTvId;
                            } else {
                                return handleSeasonName(v.name, true) == item.titlePlay && v.movieTvId == item.movieTvId;
                            }
                        })
                    );
                });
                let historyArr = uni.getStorageSync("historyPlay") || [];
                historyArr = historyArr.filter((v) => v.sourceType != selectType.value.type || v.sourceName != selectMedia.value.name);
                uni.setStorageSync("historyPlay", [...historyArr, ...historyPlay.value]);
            }, 800); //为什么加延迟，因为上一个页面setStorageSync的时候，不加延迟返回这个页面获取不到最新的storage
        } else {
            historyPlay.value = [];
            if (!uni.getStorageSync("isreload")) {
                historyPlay.value = uni.getStorageSync("historyPlay") || [];
                historyPlay.value = historyPlay.value.filter((v) => v.sourceType == selectType.value.type && v.sourceName == selectMedia.value.name);
                historyPlay.value = historyPlay.value.filter((item) => {
                    return (
                        localMovieTvData.value.movie?.some((v) => handleSeasonName(v.name, true) == handleSeasonName(item.name) && v.movieTvId == item.movieTvId) ||
                        localMovieTvData.value.tv?.some((v) => {
                            if (item.season != "1") {
                                return handleSeasonName(v.name, true) == handleSeasonName(item.titlePlay) && v.movieTvId == item.movieTvId;
                            } else {
                                return handleSeasonName(v.name, true) == item.titlePlay && v.movieTvId == item.movieTvId;
                            }
                        })
                    );
                });
                let historyArr = uni.getStorageSync("historyPlay") || [];
                historyArr = historyArr.filter((v) => v.sourceType != selectType.value.type || v.sourceName != selectMedia.value.name);
                uni.setStorageSync("historyPlay", [...historyArr, ...historyPlay.value]);
            }
        }
        uni.removeStorageSync("secondPage");
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        if (selectType.value.type == "WebDAV") {
            handleGx();
        } else if (selectType.value.type == "天翼云盘") {
            let isreload = uni.getStorageSync("isreload");
            if (isreload || prevPage == "pages/mobile/backend/data-sync") {
                uni.removeStorageSync("isreload");
                let res = await get189Folder({ folderId: "-11" }, selectMedia.value);
                listData.value = [res.fileListAO];
                if (uni.getStorageSync("settingData").tmdbKey) {
                    video_navbar.value.showProgress();
                }
            }
        } else if (selectType.value.type == "夸克网盘") {
            let isreload = uni.getStorageSync("isreload");
            if (isreload || prevPage == "pages/mobile/backend/data-sync") {
                uni.removeStorageSync("isreload");
                let res = await getQuarkFolder({ fid: "0" }, selectMedia.value);
                listData.value = [res.data];
                if (uni.getStorageSync("settingData").tmdbKey) {
                    video_navbar.value.showProgress();
                }
            }
        }
        //初始化资源库列表
    });

    onBeforeMount(async () => {
        // setTmdbImgDomain();
        judgeSelect();
        localMovieTvData.value = uni.getStorageSync("localMovieTvData") || {};
        historyPlay.value = uni.getStorageSync("historyPlay") || [];
        historyPlay.value = historyPlay.value.filter((v) => v.sourceType == selectType.value.type && v.sourceName == selectMedia.value.name);
        historyPlay.value = historyPlay.value.filter((item) => {
            return (
                localMovieTvData.value.movie?.some((v) => handleSeasonName(v.name, true) == handleSeasonName(item.name, true) && v.movieTvId == item.movieTvId) ||
                localMovieTvData.value.tv?.some((v) => {
                    if (item.season != "1") {
                        return handleSeasonName(v.name, true) == handleSeasonName(item.titlePlay) && v.movieTvId == item.movieTvId;
                    } else {
                        return handleSeasonName(v.name, true) == item.titlePlay && v.movieTvId == item.movieTvId;
                    }
                })
            );
        });
        let historyArr = uni.getStorageSync("historyPlay") || [];
        historyArr = historyArr.filter((v) => v.sourceType != selectType.value.type || v.sourceName != selectMedia.value.name);
        uni.setStorageSync("historyPlay", [...historyArr, ...historyPlay.value]);
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
    return {
        video_navbar, refreshData, refreshLoading, movieTvData, localMovieTvData, tmdbKey,
        historyPlay, settingData, refreshVideo
    }
}