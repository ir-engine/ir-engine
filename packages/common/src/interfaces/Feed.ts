import { CreatorShort } from './Creator'

export interface FeedShort {
  id: string
  previewUrl: string
  viewsCount: number
}

export interface Feed extends FeedShort {
  creator: CreatorShort
  videoUrl: string
  previewUrl: string
  fires: number
  likes: number
  title: string
  description: string
  isFired?: boolean
  isLiked?: boolean
  isBookmarked?: boolean
  previewType?: string
  videoType?: string
}

export interface FeedDatabaseRow {
  id: string
  title: string
  description: string
  featured: boolean
  videoUrl: string
  previewUrl: string
  viewsCount: number
  createdAt: string
  updatedAt: string
  authorId: string
}

export interface FeedResult {
  data: Feed[]
  total: number
  limit: number
  skip: number
}
