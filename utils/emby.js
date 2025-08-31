//emby的接口封装
import { toStringfy, toParse } from "@/pages/mobile/mine/common";
import { dayjs } from "@/uni_modules/iRainna-dayjs/js_sdk/dayjs.min.js";
import { classifyList, formatNanoseconds } from '@/utils/scrape'
import posterEmpty from "@/static/poster-empty.png";

//处理内存大小
const handleSize = (size) => {
    if (size == 0) return "0";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(size) / Math.log(1024));
    const formatted = parseFloat((size / Math.pow(1024, i)).toFixed(2));
    return formatted + " " + sizes[i];
};
const setEmbyImg = (item, selectMedia, emptyImg = posterEmpty) => {
    if (item?.ImageTags?.Primary) {
        return `${selectMedia.protocol}://${selectMedia.address}:${selectMedia.port}/emby/Items/${item.Id}/Images/Primary?tag=${item.ImageTags.Primary}`
    } else if (item.PrimaryImageItemId) {
        if (item.PrimaryImageTag) {
            return `${selectMedia.protocol}://${selectMedia.address}:${selectMedia.port}/emby/Items/${item.PrimaryImageItemId}/Images/Primary?tag=${item.PrimaryImageTag}`
        } else {
            return emptyImg
        }
    } else {
        return emptyImg
    }
}
//通用方法请求emby接口
const getEmby = (data, apiInfo) => {
    return new Promise((resolve, reject) => {
        uni.request({
            url: apiInfo.protocol + "://" + apiInfo.address + ":" + apiInfo.port + '/emby' + apiInfo.url,
            timeout: 10000,
            method: apiInfo.method,
            data: data || {},
            header: {
                "Content-Type": 'application/json',
                'X-Emby-Authorization': `Emby UserId="${apiInfo.userId}" Client="William Player", Device="Android", DeviceId="123456789", Version="1.4."`,
                'X-Emby-Token': apiInfo.token
            },
            success: (res) => {
                resolve(res.data);
            },
            fail: (error) => {
                reject(error);
            },
        });
    });
}

//用户登录
const loginEmby = (selectMedia) => {
    return new Promise((resolve, reject) => {
        uni.request({
            url: selectMedia.protocol + "://" + selectMedia.address + ":" + selectMedia.port + '/emby/Users/AuthenticateByName',
            timeout: 10000,
            method: 'POST',
            data: JSON.stringify({ Username: selectMedia.Username, Pw: selectMedia.Pw }),
            header: {
                "Content-Type": 'application/json',
                'X-Emby-Authorization': `Emby Client="William Player", Device="Android", DeviceId="123456789", Version="1.4.3"`,
            },
            success: (res) => {
                resolve(res.data);
            },
            fail: (error) => {
                reject(error);
            },
        });
    });
}

//获取emby库信息
const getEmbyInfo = (selectMedia) => {
    const apiInfo = {
        url: '/System/Info',
        method: 'GET',
        ...selectMedia
    };
    return getEmby({}, apiInfo)
}

//获取主视图
const getMainView = (selectMedia) => {
    const apiInfo = {
        url: `/Users/${selectMedia.userId}/Views?IncludeExternalContent=false`,
        method: 'GET',
        ...selectMedia
    }
    return getEmby({}, apiInfo)
}

//分页获取影片列表，用于video-all页面
const getEmbyList = (data, selectMedia) => {
    const apiInfo = {
        url: `/Users/${selectMedia.userId}/Items?${toStringfy(data)}`,
        method: 'GET',
        ...selectMedia
    }
    return getEmby({}, apiInfo)
}

//分页获取最新的影片列表，用于首页展示
const getEmbyNewList = (data, selectMedia) => {
    const apiInfo = {
        url: `/Users/${selectMedia.userId}/Items/Latest?${toStringfy(data)}`,
        method: 'GET',
        ...selectMedia
    }
    return getEmby({}, apiInfo)
}

//获取流派列表
const getGenresList = (data, selectMedia) => {
    const apiInfo = {
        url: `/Genres?${toStringfy(data)}`,
        method: 'GET',
        ...selectMedia
    }
    return getEmby({}, apiInfo)
}

//获取影片详情，对齐getMovieTvById
const getEmbyMovieTv = async (data, selectMedia) => {
    const apiInfo = {
        url: `/Users/${selectMedia.userId}/Items/${data.movieTvId}`,
        method: 'GET',
        ...selectMedia
    }
    let res = await getEmby({}, apiInfo)
    return {
        id: res.Id,
        overview: res.Overview,
        vote_average: res.CommunityRating,
        name: res.Name,
        release_date: dayjs(res.EndDate).format('YYYY-MM-DD'),
        runtime: formatNanoseconds(res.RunTimeTicks),//电影专用
        size: handleSize(res.Size),
        actors: res.People.map(item => {
            return {
                name: item.Name, character: item.Role, profile_path: setEmbyImg({ PrimaryImageItemId: item.Id, PrimaryImageTag: item.PrimaryImageTag },
                    selectMedia, 'https://storage.7x24cc.com/storage-server/presigned/ss1/a6-online-fileupload/newMediaImage/2AFA742_427A_user-avatar_20241225150546694newMediaImage.png')
            }
        }),
        genres: res.GenreItems.map(item => {
            let obj = classifyList.find(v => v.labelEn == item.Name || v.label == item.Name) || { label: item.Name, id: item.Id }
            return { name: obj.label, id: obj.id }
        }),
        backdrop_path: res.BackdropImageTags.length ? `${selectMedia.protocol}://${selectMedia.address}:${selectMedia.port}/emby/Items/${res.Id}/Images/Backdrop?tag=${res.BackdropImageTags[0]}` : `${selectMedia.protocol}://${selectMedia.address}:${selectMedia.port}/emby/Items/${res.Id}/Images/Primary?tag=${res.ImageTags.Primary}`,
        number_of_episodes: res.UserData.UnplayedItemCount + res.UserData.PlayCount,
        poster_path: `${selectMedia.protocol}://${selectMedia.address}:${selectMedia.port}/emby/Items/${res.Id}/Images/Primary?tag=${res.ImageTags.Primary}`,
        tmdbId: res.ProviderIds.Tmdb,
        production_companies: res.Studios.map(item => {
            return { id: item.Id, name: item.Name }
        }),
        path: res.Path,
    }
}

//获取季信息列表
const getEmbySeasonList = (data, selectMedia) => {
    let movieTvId = data.movieTvId
    delete data.movieTvId
    const apiInfo = {
        url: `/Shows/${movieTvId}/Seasons?${toStringfy(data)}`,
        method: 'GET',
        ...selectMedia
    }
    return getEmby({}, apiInfo)
}

//获取视频播放链接
const getEmbyPlayerUrl = (data, selectMedia) => {
    let params = {
        UserId: selectMedia.userId,
        StartTimeTicks: 0,
        IsPlayback: false,
        AutoOpenLiveStream: false,
        ...data
    }
    delete params.folderFileId
    const apiInfo = {
        url: `/Items/${data.folderFileId}/PlaybackInfo?${toStringfy(params)}`,
        method: 'POST',
        ...selectMedia
    }
    return getEmby({}, apiInfo)
}

//获取第几季下的剧集列表
const getSeasonTvList = (data, selectMedia) => {
    let params = {
        UserId: selectMedia.userId,
        ImageTypeLimit: 1,
        Fields: 'Overview,PrimaryImageAspectRatio,PremiereDate,ProductionYear',
        Limit: 1000,
        ...data
    }
    delete params.folderFileId
    const apiInfo = {
        url: `/Shows/${data.folderFileId}/Episodes?${toStringfy(params)}`,
        method: 'GET',
        ...selectMedia
    }
    return getEmby({}, apiInfo)
}

//设置历史播放记录
const setHistoryPlay = (data, selectMedia) => {
    const apiInfo = {
        url: `/Sessions/Playing/Stopped`,
        method: 'POST',
        ...selectMedia
    }
    console.log("去请求");
    
    return getEmby(data, apiInfo)
}


export {
    setEmbyImg, loginEmby, getEmbyInfo, getMainView, getEmbyList, getEmbyNewList,
    getGenresList, getEmbyMovieTv, getEmbySeasonList, getEmbyPlayerUrl, getSeasonTvList, setHistoryPlay
}
