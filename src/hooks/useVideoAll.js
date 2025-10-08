import { ref, nextTick, onMounted } from "vue";
import { onShow, onLoad } from "@dcloudio/uni-app";
import emptyBg from "@/static/empty_bg.png";
import { toStringfy } from "../pages/mobile/mine/common";
import { handleSeasonName, handleSecond, parseTime } from "@/utils/scrape.js";
import posterEmpty from "@/static/poster-empty.png";
import * as CONFIG from "@/utils/config";
import { getEmbyList, getGenresList } from "../utils/emby";
import dayjs from 'dayjs';

export function useVideoAll({ wil_list }) {
    const requestParams = ref({});
    const mapping = {
        "电影": "movie",
        "电视剧": "tv",
    };

    const routerParams = ref({});

    const selectType = ref({});
    const selectMedia = ref({});
    const tabList = ref([])
    const embyActiveTab = ref('')

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
        const firstDotIndex = item.name.indexOf(".");
        let name = firstDotIndex === -1 ? item.name : item.name.substring(0, firstDotIndex);
        name = handleSeasonName(name, true);
        if (name.length > 7) {
            name = name.slice(0, 6) + "...";
        }
        return name;
    };

    //设置emby图片
    const setEmbyImg = (item) => {
        if (item.ImageTags.Primary) {
            return `${selectMedia.value.protocol}://${selectMedia.value.address}:${selectMedia.value.port}/emby/Items/${item.Id}/Images/Primary?tag=${item.ImageTags.Primary}`
        } else if (item.PrimaryImageItemId) {
            return `${selectMedia.value.protocol}://${selectMedia.value.address}:${selectMedia.value.port}/emby/Items/${item.PrimaryImageItemId}/Images/Primary?tag=${item.PrimaryImageTag}`
        } else {
            return posterEmpty
        }
    }
    //emby获取剧集列表
    const getEmbyJjList = async (params) => {
        let embyObj = {
            ParentId: routerParams.value.embyParentId,
            EnableImageTypes: 'Primary,Backdrop,Thumb',
            Fields: 'BasicSyncInfo,CanDelete,Container,PrimaryImageAspectRatio,ProductionYear,Status,EndDate,Prefix',
            SortBy: 'SortName',
            SortOrder: 'Ascending',
            StartIndex: (params.pageNum - 1) * params.pageSize,
            Limit: params.pageSize,
            IncludeItemTypes: routerParams.value.embyIncludeItemTypes,
            Recursive: true,
            ImageTypeLimit: '1',
        }
        let res = await getEmbyList(embyObj, selectMedia.value)
        let arr = res.Items.map(i => {
            return {
                id: i.Id, name: i.Name, provider: 'Emby', releaseTime: dayjs(i.EndDate).format('YYYY-MM-DD'), type: i.Type,
                poster: setEmbyImg(i)
            }
        })
        return {
            code: "200",
            rows: arr,
            total: res.TotalRecordCount
        }
    }
    //emby获取流派列表
    const getEmbyGenreList = async (params) => {
        let embyObj = {
            ParentId: routerParams.value.embyParentId,
            EnableImageTypes: 'Primary,Backdrop,Thumb',
            Fields: 'BasicSyncInfo,CanDelete,Container,PrimaryImageAspectRatio,ProductionYear,Status,EndDate,Prefix',
            SortBy: 'SortName',
            SortOrder: 'Ascending',
            StartIndex: (params.pageNum - 1) * params.pageSize,
            Limit: params.pageSize,
            IncludeItemTypes: routerParams.value.embyIncludeItemTypes,
            Recursive: true,
            ImageTypeLimit: '1',
            userId: selectMedia.value.userId
        }
        let res = await getGenresList(embyObj, selectMedia.value)
        let arr = res.Items.map(i => {
            return {
                id: i.Id, name: i.Name, provider: 'Emby', notShowTime: true, type: i.Type,
                poster: setEmbyImg(i)
            }
        })
        return {
            code: "200",
            rows: arr,
            total: res.TotalRecordCount
        }
    }
    //获取流派下的影视列表
    const getGenreChildren = async (params, query) => {
        let embyObj = {
            ParentId: routerParams.value.embyParentId,
            EnableImageTypes: 'Primary,Backdrop,Thumb',
            Fields: 'BasicSyncInfo,CanDelete,Container,PrimaryImageAspectRatio,ProductionYear,Status,EndDate,Prefix',
            SortBy: 'SortName',
            SortOrder: 'Ascending',
            StartIndex: (params.pageNum - 1) * params.pageSize,
            Limit: params.pageSize,
            Recursive: true,
            ImageTypeLimit: '1',
            userId: selectMedia.value.userId,
            ...query
        }
        let res = await getEmbyList(embyObj, selectMedia.value)
        let arr = res.Items.map(i => {
            return {
                id: i.Id, name: i.Name, provider: 'Emby', releaseTime: dayjs(i.EndDate).format('YYYY-MM-DD'),
                poster: setEmbyImg(i), type: i.Type
            }
        })
        return {
            code: "200",
            rows: arr,
            total: res.TotalRecordCount
        }
    }
    //emby获取文件夹列表
    const getEmbyFolderList = async (params) => {
        let embyObj = {
            ParentId: routerParams.value.embyParentId,
            EnableImageTypes: 'Primary,Backdrop,Thumb',
            Fields: 'BasicSyncInfo,CanDelete,Container,PrimaryImageAspectRatio,ProductionYear,Status,EndDate,Prefix',
            SortBy: 'IsFolder,FileName',
            SortOrder: 'Ascending',
            StartIndex: (params.pageNum - 1) * params.pageSize,
            Limit: params.pageSize,
            Recursive: false,
            ImageTypeLimit: '1',
        }
        let res = await getEmbyList(embyObj, selectMedia.value)
        let arr = res.Items.map(i => {
            return {
                id: i.Id, name: i.Name, provider: 'Emby', notShowTime: true, type: i.Type,
                poster: setEmbyImg(i)
            }
        })
        return {
            code: "200",
            rows: arr,
            total: res.TotalRecordCount
        }
    }
    const getMovieTvList = async (params) => {
        if (routerParams.value.type == 'emby') {//如果是emby，通过请求接口分页加载
            if (routerParams.value.embyIncludeItemTypes == 'Series') {
                if (embyActiveTab.value == '剧集') {
                    return await getEmbyJjList(params)
                } else if (embyActiveTab.value == '流派') {
                    return await getEmbyGenreList(params)
                } else if (embyActiveTab.value == '文件夹') {
                    return await getEmbyFolderList(params)
                }
            } else if (routerParams.value.embyIncludeItemTypes == 'Movie') {
                if (embyActiveTab.value == '电影') {
                    return await getEmbyJjList(params)
                } else if (embyActiveTab.value == '流派') {
                    return await getEmbyGenreList(params)
                } else if (embyActiveTab.value == '文件夹') {
                    return await getEmbyFolderList(params)
                }
            } else if (routerParams.value.embyIncludeItemTypes == 'Genres') {
                if (routerParams.value.genreType == 'Series') {
                    return await getGenreChildren(params, { IncludeItemTypes: 'Series', GenreIds: routerParams.value.GenreIds })
                } else if (routerParams.value.genreType == 'Movie') {
                    return await getGenreChildren(params, { IncludeItemTypes: 'Movie,Series,Video', GenreIds: routerParams.value.GenreIds })
                }
            } else if (routerParams.value.embyIncludeItemTypes == 'Folder') {
                return await getEmbyFolderList(params)
            }
        } else {
            if (routerParams.value.title == "最近观看") {
                let res = uni.getStorageSync("historyPlay") || [];
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
                let res = uni.getStorageSync("localMovieTvData");
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
                let res = uni.getStorageSync("localMovieTvData") || {};
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
        }
    };

    const toVideoDetail = async (item) => {
        console.log(item, 'item111');
        if (routerParams.value.type == 'emby') {
            if (item.type == 'Genre') {
                uni.navigateTo({
                    url: `/pages/mobile/video/video-all?title=${item.name}&embyIncludeItemTypes=Genres&type=emby&GenreIds=${item.id}&embyParentId=${routerParams.value.embyParentId}&genreType=${routerParams.value.embyIncludeItemTypes}&isConnected1=true`
                })
            } else if (item.type == 'Folder') {
                uni.navigateTo({
                    url: `/pages/mobile/video/video-all?title=${item.name}&embyIncludeItemTypes=Folder&type=emby&embyParentId=${item.id}&isConnected1=true`
                })
            } else if (item.type == 'Series' || item.type == 'Movie') {//直接跳转到剧集或者电影的详情页
                uni.navigateTo({
                    url: `/pages/${CONFIG.PLATFORM === 'TV' ? 'tv' : 'mobile'}/video/emby/emby-detail?name=${handleSeasonName(item.name, true)}&type=${item.type == "Series" ? "tv" : "movie"}&movieTvId=${item.id}&isEmby=true`,
                });
            }
        } else {
            uni.navigateTo({
                url: `/pages/${CONFIG.PLATFORM === 'TV' ? 'tv' : 'mobile'}/video/video-detail?path=${item.path}&name=${handleSeasonName(item.name, true)}&type=${item.type == "1" ? "tv" : "movie"}&source=${JSON.stringify(item.source)}&movieTvId=${item.movieTvId}`,
            });
        }
    };

    const setEmptyImg = (poster) => {
        if (poster) {
            if (routerParams.value.type == 'emby') {
                return poster
            } else {
                return CONFIG.IMG_DOMAIN + "/t/p/w300_and_h450_bestv2" + poster;
            }
        } else {
            return posterEmpty;
        }
    };

    const changeItemFn = ref(() => { });
    const imgError = (item) => {
        changeItemFn.value = (v) => {
            v.loadImg = false;
        };
        nextTick(() => {
            wil_list.value.handleEdit(item.path);
        });
    };

    const imgLoad = (item) => {
        if (!routerParams.value.isConnected && !item.loadImg) return;
        // changeItemFn.value = (v) => {
        //     v.loadImg = true;
        // };
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
            lineNumber.value = Math.floor((windowWidth.value - 24) / 109);
            let remain = windowWidth.value - 24 - lineNumber.value * 109;
            if (remain < (lineNumber.value - 1) * 12) {
                lineNumber.value--;
            }
            lineHeight.value = (((windowWidth.value - uni.upx2px(24 * lineNumber.value + 24)) / lineNumber.value) * 160) / 109 / scale + "rpx";
        } else {
            lineNumber.value = 3;
            lineHeight.value = (((windowWidth.value - uni.upx2px(24 * lineNumber.value + 24)) / lineNumber.value) * 160) / 109 / scale + "rpx";
        }
    };

    const listItemStyle = (item) => {
        if (item.index % lineNumber.value == 0) {
            return { marginLeft: 0 };
        } else {
            return { marginLeft: "24rpx" };
        }
    };

    //emby切换tab
    const changeTab = async (title) => {
        embyActiveTab.value = title
        wil_list.value.reload();
    }

    onLoad((options) => {
        judgeSelect();
        routerParams.value = options;
        routerParams.value.isConnected = routerParams.value.isConnected1 == "true" ? true : false;
        if (options.embyIncludeItemTypes == 'Series') {
            embyActiveTab.value = '剧集'
            tabList.value = [
                { title: '剧集' },
                { title: '流派' },
                { title: '文件夹' }
            ]
        } else if (options.embyIncludeItemTypes == 'Movie') {
            embyActiveTab.value = '电影'
            tabList.value = [
                { title: '电影' },
                { title: '流派' },
                { title: '文件夹' }
            ]
        }
        setItemWidth();
        uni.setNavigationBarTitle({
            title: routerParams.value.title,
        });
    });

    return {
        routerParams, showPopover, mapping, changeSort, tabList, changeTab,
        getMovieTvList, requestParams, windowWidth, changeItemFn, listItemStyle, lineNumber, lineHeight, embyActiveTab,
        toVideoDetail, setEmptyImg, imgError, imgLoad, removeExtension
    }
}