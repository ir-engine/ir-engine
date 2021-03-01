
import {CreatorShort} from './Creator'
export interface FeedShord {
  id: string
  preview: string
  viewsCount: number,  
}

export interface Feed extends FeedShord {
  creator : CreatorShort,
  video : string,
  fires: number,  
  stores: number,  
  title: string,
  description: string,
}

export interface FeedDatabaseRow {
  id: string,
  title: string,
  description: string,
  viewsCount: number,
  createdAt: string,
  updatedAt: string,
  authorId: string
}
