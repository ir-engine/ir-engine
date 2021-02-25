
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
  description: Text,
}