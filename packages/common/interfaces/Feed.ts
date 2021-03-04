
import {CreatorShort} from './Creator'
export interface FeedShort {
  id: string,
  preview: string,
  viewsCount: number,
}

export interface Feed extends FeedShort {
  creator : CreatorShort,
  video : string,
  fires: number,
  stores: number,
  title: string,
  description: string,
  isFired?: boolean,
  isBookmarked?: boolean,
}

export interface FeedDatabaseRow {
  id: string,
  title: string,
  description: string,
  viewCount: number,
  createdAt: string,
  updatedAt: string,
  authorId: string
}
