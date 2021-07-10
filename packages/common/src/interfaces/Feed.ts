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
  title: string
  description: string
  isFired?: boolean
  isBookmarked?: boolean
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
