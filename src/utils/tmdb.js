const LOCALE_STORAGE_KEY = 'app_locale'
const TMDB_BASE_URL = 'https://api.tmdb.org/3'

export const getTmdbLanguage = () => {
  const locale = uni.getStorageSync(LOCALE_STORAGE_KEY) || 'zh-Hans'
  const mapping = {
    'zh-Hans': 'zh-CN',
    'zh-CN': 'zh-CN',
    en: 'en-US',
    'en-US': 'en-US',
    ko: 'ko-KR',
    'ko-KR': 'ko-KR',
    ja: 'ja-JP',
    'ja-JP': 'ja-JP',
  }
  return mapping[locale] || 'zh-CN'
}

const getTmdbApiKey = () => {
  return uni.getStorageSync('settingData').tmdbKey
}

export const requestTmdb = ({ url, data = {}, timeout }) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url,
      data: {
        ...data,
        language: getTmdbLanguage(),
        api_key: getTmdbApiKey(),
      },
      timeout,
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
      },
      success: res => {
        resolve(res.data)
      },
      fail: error => {
        reject(error)
      },
    })
  })
}

export const searchMovieTvByType = (data, type) => {
  const params = { ...data }
  let url = ''
  if (type === 'movie') {
    url = `${TMDB_BASE_URL}/search/movie`
    params.primary_release_year = params.first_air_date_year
    delete params.first_air_date_year
  } else if (type === 'tv') {
    url = `${TMDB_BASE_URL}/search/tv`
  }
  return requestTmdb({
    url,
    data: {
      ...params,
      page: 1,
    },
    timeout: 10000,
  })
}

export const searchMovieTvMulti = data => {
  return requestTmdb({
    url: `${TMDB_BASE_URL}/search/multi`,
    data,
  })
}

export const getTvDetail = id => {
  return requestTmdb({
    url: `${TMDB_BASE_URL}/tv/${id}`,
  })
}

export const getMovieDetail = id => {
  return requestTmdb({
    url: `${TMDB_BASE_URL}/movie/${id}`,
  })
}

export const getTvSeasonDetail = data => {
  return requestTmdb({
    url: `${TMDB_BASE_URL}/tv/${data.movieTvId}/season/${data.season}`,
  })
}

export const getMovieTvDetailById = (data, type) => {
  const params = JSON.parse(JSON.stringify(data))
  let url = ''
  if (type === 'movie') {
    url = `${TMDB_BASE_URL}/movie/${params.movieTvId}`
  } else if (type === 'tv') {
    url = `${TMDB_BASE_URL}/tv/${params.movieTvId}`
  }
  delete params.movieTvId
  return requestTmdb({
    url,
    data: params,
  })
}

export const getActorById = (data, type) => {
  const params = JSON.parse(JSON.stringify(data))
  if (!data.movieTvId || !params.movieTvId) return Promise.reject()
  let url = ''
  if (type === 'movie') {
    url = `${TMDB_BASE_URL}/movie/${params.movieTvId}/credits`
  } else if (type === 'tv') {
    url = `${TMDB_BASE_URL}/tv/${params.movieTvId}/credits`
  }
  return requestTmdb({ url })
}
