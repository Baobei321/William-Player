<template>
  <div class="video-detail">
    <wil-navbar style="position: fixed;z-index: 999;" arrow-color="#fff"></wil-navbar>
    <div class="video-detail-container">
      <div class="video-detail-container__img" :style="{backgroundImage:`url(${imgData.img})`}">
        <div class="img-container">
          <div class="img-title">{{ imgData.title }}</div>
          <div class="img-mid">
            <div class="img-mid-score">
              <nut-icon name="star-fill-n" size="14" custom-color="#c2c5c6"></nut-icon>
              <span>{{ imgData.score }}</span>
            </div>
            <div class="img-mid-date">
              <nut-icon name="date" size="14" custom-color="#c2c5c6"></nut-icon>
              <span>{{ imgData.releaseTime }}</span>
            </div>
            <div class="img-mid-runtime">
              <nut-icon name="clock" size="14" custom-color="#c2c5c6" v-if="routerParams.type == 'movie'"></nut-icon>
              <span>{{ imgData.runtime }}</span>
            </div>
          </div>
          <div class="img-bottom">
            <span>{{ imgData.genres }}</span>
            <span v-if="routerParams.type == 'movie'">{{ selectSource.size }}</span>
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
              <div :class="['movie-version-list__item',item.provider==selectSource.provider ? 'movie-version-list__active' : '']" v-for="item in sourceList" :key="item.provider"
                @click="changeSource(item)">
                {{ item.sourceName }}
              </div>
            </div>
          </scroll-view>
        </div>
        <!-- 电视专用 -->
        <div class="tv-version" v-if="routerParams.type=='tv'">
          <nut-tabs v-model="activeTab" :title-scroll="true" custom-color="#090909" background="#fff" @change="changeTvSource">
            <nut-tab-pane :title="item.sourceName" :pane-key="item.provider" v-for="item in sourceList" :key="item.provider"></nut-tab-pane>
          </nut-tabs>
          <scroll-view class="tv-version-scroll" :scroll-x="true" style="width: 100%" :enhanced="true" :showScrollbar="false">
            <div class="tv-version-list">
              <div class="tv-version-list__item" v-for="(item,index) in tvList" :key="item.name" @click="toPlayVideo(item,index)">
                <div class="item-img" :style="{backgroundImage:`url(${item.poster || imgData.img})`}">
                  <image src="/static/playVideo-button.png" />
                  <span class="item-img-runtime">{{ item.runtime }}</span>
                </div>
                <div class="item-title">{{ index+1+'.'+item.title }}</div>
              </div>
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
                <img class="item-avatar"
                  :src="director.profile_path?'https://media.themoviedb.org/t/p/w100_and_h100_bestv2'+director.profile_path:'https://szrcapi.mouldsdata.com/minio/tzgcs/2024/06/13/6aab190d557c47ddb18f89755a3a7732.png'"
                  mode="aspectFill">
                <div class="item-name">{{director.name}}</div>
                <div class="item-job">导演</div>
              </div>
              <div class="related-actors-list__item" v-for="item in actors" :key="item.name">
                <img class="item-avatar"
                  :src="item.profile_path?'https://media.themoviedb.org/t/p/w100_and_h100_bestv2'+item.profile_path :'https://szrcapi.mouldsdata.com/minio/tzgcs/2024/06/13/6aab190d557c47ddb18f89755a3a7732.png'"
                  mode="aspectFill">
                <div class="item-name">{{item.name}}</div>
                <div class="item-role">饰 {{ item.character }}</div>
              </div>
            </div>
          </scroll-view>
        </div>
        <div class="tip-footer">
          <span class="tip-footer-name">{{ selectSource.name }}</span>
          <span class="tip-footer-webdav">WebDAV：{{ selectSource.path }}</span>
          <div class="tip-footer-timesize">
            <span v-if="imgData.runtime">{{ imgData.runtime }}</span><span>{{ selectSource.sourceName }}</span><span
              v-if="routerParams.type=='movie' ? selectSource.size : handleSize(tvList[0]?.size)">{{ routerParams.type=='movie' ? selectSource.size : handleSize(tvList[0]?.size) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeMount, ref } from 'vue'
import wilNavbar from '@/components/wil-navbar/index.vue'
import { useDict } from '../../utils/useDict';
import { getFolder, handleSecond } from './components/common'
import { onShow, onLoad } from '@dcloudio/uni-app';


const { getUntokenDict } = useDict()

const imgData = ref({}) //图片内的信息
const overview = ref('') //剧情简介


const sourceList = ref([])
const selectSource = ref({}) //切换选中的来源

const director = ref({})
const actors = ref([])

const activeTab = ref('')

const tvList = ref([]) //目前网盘所拥有的电视集数列表

const historyPlay = ref(uni.getStorageSync('historyPlay') || []) //历史播放
const buttonText = ref('播放')
const webdavInfo = ref(uni.getStorageSync('webdavInfo'))

const routerParams = ref({})
const selectMedia = ref({});
const selectType = ref({});
const nowSourceList = ref([])

//通过tmdb接口获取更详细的信息
const getMovieTvById = (data, type) => {
  let url = ''
  let obj = JSON.parse(JSON.stringify(data))
  if (type == 'movie') {
    url = `https://api.tmdb.org/3/movie/${obj.movieTvId}`
  } else if (type == 'tv') {
    url = `https://api.tmdb.org/3/tv/${obj.movieTvId}`
  }
  delete obj.movieTvId
  return new Promise(resolve => {
    uni.request({
      url: url,
      data: { ...obj, language: 'zh-CN', api_key: uni.getStorageSync('tmdbKey') },
      method: 'GET',
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        resolve(res.data)
      }
    })
  });
}

//获取第几季的详情
const getTvSeason = (data) => {
  return new Promise(resolve => {
    uni.request({
      url: `https://api.tmdb.org/3/tv/${data.movieTvId}/season/${data.season}`,
      data: { language: 'zh-CN', api_key: uni.getStorageSync('tmdbKey') },
      method: 'GET',
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        resolve(res.data)
      }
    })
  });
}

//获取演员表
const getActorById = (data, type) => {
  let url = ''
  let obj = JSON.parse(JSON.stringify(data))
  if (type == 'movie') {
    url = `https://api.tmdb.org/3/movie/${obj.movieTvId}/credits`
  } else if (type == 'tv') {
    url = `https://api.tmdb.org/3/tv/${obj.movieTvId}/credits`
  }
  return new Promise(resolve => {
    uni.request({
      url: url,
      data: { language: 'zh-CN', api_key: uni.getStorageSync('tmdbKey') },
      method: 'GET',
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        resolve(res.data)
      }
    })
  });
}


//计算时间
const calTime = (val, type = 'cn') => {
  if (type == 'cn') {
    if (val > 60) {
      let hours = Math.floor(val / 60);
      let mins = val % 60;
      return `${hours}小时${mins}分钟`;
    } else {
      return `${val}分钟`;
    }
  } else if (type == 'en') {
    if (val > 60) {
      let hours = Math.floor(val / 60);
      let mins = val % 60;
      mins = mins >= 10 ? mins : '0' + mins
      return `${hours}:${mins}:00`;
    } else {
      return `${val}:00`;
    }
  }
}


//处理电视的详情和剧集等
const handleTv = async () => {
  let result = await getFolder({ path: selectSource.value.path + '/' + selectSource.value.name },selectMedia.value)
  const numberMapping = { '一': '1', '二': '2', '三': '3', '四': '4', '五': '5', '六': '6', '七': '7' }
  const match = selectSource.value.name.match(/第(.*?)季/)
  let season = ''
  season = match ? numberMapping[match[1]] : '1'
  let res1 = await getTvSeason({ movieTvId: routerParams.value.movieTvId, season: season })
  //对电视进行排序
  tvList.value = result.data.content.sort((a, b) => {
    const regex = /S\d{2}E\d{2}/;
    const regex1 = /\d+/;
    if (a.name.match(regex)) {
      let aName = a.name.match(regex)[0]
      let bName = b.name.match(regex)[0]
      const numA = parseInt(aName.slice(-2), 10);
      const numB = parseInt(bName.slice(-2), 10);
      return numA - numB;
    } else if (a.name.match(regex1)) {
      let aName = a.name.match(regex1)[0]
      let bName = b.name.match(regex1)[0]
      const numA = parseInt(aName.slice(-2), 10);
      const numB = parseInt(bName.slice(-2), 10);
      return numA - numB;
    }
  })
  //处理现有的集数，将tmdb的封面，时长都设置进去，还有每一集的标题
  tvList.value.forEach((v, vindex) => {
    v.title = res1.episodes[vindex]?.name || '暂无标题'
    v.poster = res1.episodes[vindex]?.still_path ? 'https://media.themoviedb.org/t/p/w533_and_h300_bestv2' + res1.episodes[vindex]?.still_path : ''
    v.runtime = res1.episodes[vindex]?.runtime ? calTime(res1.episodes[vindex]?.runtime, 'en') : '00:00'
  })

  imgData.value.releaseTime = res1.air_date
  imgData.value.runtime = result.data.total + '集'
}

const getMovieTvDetail = async () => {
  let res = await getMovieTvById({ movieTvId: routerParams.value.movieTvId }, routerParams.value.type)
  if (routerParams.value.type == 'movie') {
    imgData.value = {
      img: 'https://media.themoviedb.org/t/p/w1920_and_h1080_bestv2' + res.backdrop_path,
      score: res.vote_average.toFixed(1),
      releaseTime: res.release_date,
      runtime: calTime(res.runtime),
      runtimeEn: calTime(res.runtime, 'en'),
      genres: res.genres.map(i => i.name).join(' '),
      title: res.title
    }
  } else if (routerParams.value.type == 'tv') {
    handleTv()
    imgData.value.img = 'https://media.themoviedb.org/t/p/w1920_and_h1080_bestv2' + res.backdrop_path
    imgData.value.score = res.vote_average.toFixed(1)
    imgData.value.genres = res.genres.map(i => i.name).join(' ')
    imgData.value.title = selectSource.value.name
  }
  overview.value = res.overview
}

const getActorList = async () => {
  let res = await getActorById({ movieTvId: routerParams.value.movieTvId }, routerParams.value.type)
  director.value = res.crew[0] || {}
  actors.value = res.cast.slice(0, 20)
}

//切换电影视频源
const changeSource = (item) => {
  selectSource.value = item
  setButtonText()
}

//切换电视视频源
const changeTvSource = (obj) => {
  selectSource.value = sourceList.value.find(i => i.provider == obj.paneKey)
  handleTv()
}

//裁剪格式获取电影名
const getMovieName = (val) => {
  const lastDotIndex = val.lastIndexOf('.');
  let name = lastDotIndex === -1 ? val : val.substring(0, lastDotIndex);
  return name
}

//点击播放按钮
const clickPlayButton = () => {
  if (buttonText.value.indexOf('跳转浏览器播放') > -1) {
    let history = {}
    if (routerParams.value.type == 'movie') {
      history = historyPlay.value?.find(i => getMovieName(i.name) == getMovieName(selectSource.value.name))
    } else if (routerParams.value.type == 'tv') {
      history = historyPlay.value?.find(i => i.titlePlay == selectSource.value.name)
    }
    return
  }
  if (routerParams.value.type == 'movie') {
    let history = historyPlay.value?.find(i => getMovieName(i.name) == getMovieName(selectSource.value.name))
    if (history) {
      uni.navigateTo({
        url: `/pages/video/video-player?path=${selectSource.value.path.slice(1)}/${selectSource.value.name}&type=movie`
      })
    } else {
      let historyItem = { path: `${selectSource.value.path.slice(1)}/${selectSource.value.name}`, poster: imgData.value.img, type: 'movie', name: selectSource.value.name, runtime: imgData.value.runtimeEn, title: selectSource.value.name, initialTime: '0' }
      uni.navigateTo({
        url: `/pages/video/video-player?path=${selectSource.value.path.slice(1)}/${selectSource.value.name}&item=${JSON.stringify(historyItem)}&type=movie`
      })
    }
  } else if (routerParams.value.type == 'tv') {
    let history = historyPlay.value?.find(i => i.titlePlay == selectSource.value.name)
    if (history) {
      uni.navigateTo({
        url: `/pages/video/video-player?path=${selectSource.value.path.slice(1)}/${selectSource.value.name}/${history.name}&type=tv`
      })
    } else {
      let historyItem = { path: `${selectSource.value.path.slice(1)}/${selectSource.value.name}/${tvList.value[0].name}`, titlePlay: selectSource.value.name, ji: '1', poster: tvList.value[0].poster || imgData.value.img, type: 'tv', name: tvList.value[0].name, runtime: tvList.value[0].runtime, title: tvList.value[0].title, initialTime: '0' }
      uni.navigateTo({
        url: `/pages/video/video-player?path=${selectSource.value.path.slice(1)}/${selectSource.value.name}/${tvList.value[0].name}&item=${JSON.stringify(historyItem)}&type=tv`
      })
    }
  }
}


//播放电视
const toPlayVideo = (item, index) => {
  let history = historyPlay.value?.find(i => i.titlePlay == selectSource.value.name && item.name == i.name)
  if (history) {
    uni.navigateTo({
      url: `/pages/video/video-player?path=${selectSource.value.path.slice(1)}/${selectSource.value.name}/${item.name}&type=tv`
    })
  } else {
    let historyItem = { path: `${selectSource.value.path.slice(1)}/${selectSource.value.name}/${item.name}`, titlePlay: selectSource.value.name, ji: String(index + 1), poster: item.poster || imgData.value.img, type: 'tv', name: item.name, runtime: item.runtime, title: item.title, initialTime: '0' }
    uni.navigateTo({
      url: `/pages/video/video-player?path=${selectSource.value.path.slice(1)}/${selectSource.value.name}/${item.name}&item=${JSON.stringify(historyItem)}&type=tv`
    })
  }
}
//处理内存大小
const handleSize = (size) => {
  if (size == 0) return '0';
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(size) / Math.log(1024));
  const formatted = parseFloat((size / Math.pow(1024, i)).toFixed(2));
  return formatted + ' ' + sizes[i];
}

//设置按钮文字
const setButtonText = () => {
  historyPlay.value = uni.getStorageSync('historyPlay') || []
  if (routerParams.value.type == 'movie') {
    let history = historyPlay.value?.find(i => i.name == selectSource.value.name)
    if (history) {
      history.initialTime == '-1' ? buttonText.value = '跳转浏览器播放' : '播放 ' + handleSecond(history.initialTime)
    } else {
      buttonText.value = '播放'
    }
  } else if (routerParams.value.type == 'tv') {
    let history = historyPlay.value?.find(i => i.titlePlay == selectSource.value.name)
    if (history) {
      let time = history.initialTime == '-1' ? '跳转浏览器播放' : handleSecond(history.initialTime)
      buttonText.value = `第${history.ji}集 ${time}`
    } else {
      buttonText.value = '播放'
    }
  }
}

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

onBeforeMount(() => {
  judgeSelect()
  // historyPlay.value = uni.getStorageSync('historyPlay') || []
  getUntokenDict('online_storage_source').then((res) => {
    sourceList.value = JSON.parse(routerParams.value.source).map(i => {
      i.sourceName = res.online_storage_source.find(v => v.value == i.provider).label
      return i
    })
    selectSource.value = sourceList.value[0]
    activeTab.value = selectSource.value.provider
    setButtonText()
    getMovieTvDetail()
  })
  getActorList()
})


onShow(() => {
  setButtonText()
})

onLoad((options) => {
  routerParams.value = options
})

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
        background: linear-gradient(
          to bottom,
          rgba(0, 0, 0, 0) 0%,
          rgba(0, 0, 0, 0.4) 100%
        );
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
            span {
              font-size: 28rpx;
              color: #c2c5c6;
              padding-left: 10rpx;
            }
          }
          .img-mid-date {
            display: flex;
            align-items: center;
            padding: 0 14rpx;
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
        align-items: center;
        span {
          padding: 0 14rpx;
          font-size: 28rpx;
          color: #c2c5c6;
          &:first-child {
            padding-left: 0;
          }
          &:nth-child(2) {
            position: relative;
            &::before {
              position: absolute;
              content: "";
              width: 2rpx;
              height: 24rpx;
              background-color: #c2c5c6;
              left: 0;
              top: 50%;
              transform: translateY(-50%);
            }
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
        .tv-version-scroll {
          .tv-version-list {
            display: flex;
            align-items: center;
            flex-wrap: nowrap;
            .tv-version-list__item {
              margin-left: 24rpx;
              flex: 0 0 calc((100% - 24rpx) / 2);
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
                font-size: 24rpx;
                color: #c2c5c6;
                border-radius: 6rpx;
              }
              .item-role {
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
