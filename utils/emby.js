//emby的接口封装
import { toStringfy, toParse } from "@/pages/mobile/mine/common";
import { dayjs } from "@/uni_modules/iRainna-dayjs/js_sdk/dayjs.min.js";
import { classifyList } from '@/utils/scrape'

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
                'X-Emby-Authorization': `Emby UserId="${apiInfo.userId}" Client="William Player", Device="Android", DeviceId="123456789", Version="1.4.2"`,
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
                'X-Emby-Authorization': `Emby Client="William Player", Device="Android", DeviceId="123456789", Version="1.4.2"`,
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
        release_date: dayjs(res.EndDate).format('YYYY-MM-DD'),
        runtime: res.runtime,//电影专用
        genres: res.GenreItems.map(item => {
            let obj = classifyList.find(v => v.labelEn == item.Name || v.label == item.Name) || { label: item.Name, id: item.Id }
            console.log(obj,'obj');
            
            return { name: obj.label, id: obj.id }
        }),
        backdrop_path: `${selectMedia.protocol}://${selectMedia.address}:${selectMedia.port}/emby/Items/${res.Id}/Images/Backdrop?tag=${res.BackdropImageTags[0]}`,
        number_of_episodes: res.UserData.UnplayedItemCount,
        poster_path: `${selectMedia.protocol}://${selectMedia.address}:${selectMedia.port}/emby/Items/${res.Id}/Images/Primary?tag=${res.ImageTags.Primary}`,
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


export { loginEmby, getEmbyInfo, getMainView, getEmbyList, getEmbyNewList, getGenresList, getEmbyMovieTv, getEmbySeasonList }
