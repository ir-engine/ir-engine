import { CreatorShort } from './Creator'

export interface TheFeedsShort {
  id: string
}

export interface TheFeeds extends TheFeedsShort {
  creator: CreatorShort
  videoUrl: string
  title: string
  description: string
}

export interface TheFeedsDatabaseRow {
  id: string
  title: string
  description: string
  videoUrl: string
  createdAt: string
  updatedAt: string
  authorId: string
}
