export type ImageTags = {
  Primary?: string
  [key: string]: string | undefined
}

export type EmbyCollectionItem = {
  Id: string
  Name: string
  CollectionType: string
  ImageTags?: ImageTags
  EndDate?: string
}

export type ProcessedCollectionItem = {
  name: string
  collectionType: string
  poster: string
  id: string
  list: ProcessedMediaItem[]
}

export type ProcessedMediaItem = {
  id: string
  name: string
  provider: string
  releaseTime: string
  poster: string
}

export type EmbyQueryParams = {
  EnableImageTypes: string
  Fields: string
  MediaTypes: string
  Limit: string
  Recursive: boolean
  ImageTypeLimit: string
  ParentId?: string
  [key: string]: any
}

export type ClassifyItem = {
  id: number | string
  poster: string
  name: string
  collectionType: string
  [key: string]: any
}

export type SourceList = {
  type: string
  list: Record<string, any>[]
  img: string
}

// 在 types.ts 文件中定义
export type ImgData = {
  img: string
  title: string
  score: number | string
  releaseTime: string
  runtime: string
  genres: string
  poster?: string // 从代码中看，nowMovieTv.poster 是单独使用的，但为了完整性可以加
  [key: string]: any // 允许其他扩展属性
}

export type SourceItem = {
  provider: string
  name: string
  sourceName: string
  size?: string
  seasonArr?: SeasonItem[]
  [key: string]: any
}

export type SeasonItem = {
  season: string | number
  name: string
  [key: string]: any
}

export type TvEpisode = {
  name: string
  poster: string
  runtime: string
  title?: string
  size?: string
  [key: string]: any
}

export type RouterParams = {
  type: 'movie' | 'tv'
  [key: string]: any
}

export type ActiveSeason = {
  season: string | number
  [key: string]: any
}

export type HistoryTv = {
  ji: number
  initialTime: string
  name: string
  path: string
  [key: string]: any
}

// ActorList 组件实例类型
export type ActorListInstance = {
  // 根据您的组件实际方法定义
  refresh?: () => void
  loadData?: () => Promise<void>
  [key: string]: any
}

//historyPlay对象数组里的内容
export type HistoryItem = {
  initialTime: number
  ji?: string
  folderFileId: string
  name: string
  poster: string
  runtime: string
  sourceName: string
  sourceType: string
  title: string
  type: string
  titlePlay?: string
}
