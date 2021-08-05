import { CreatorShort } from './Creator'
export interface ReportsShort {
  id: string
}

export interface Reports extends ReportsShort {
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
