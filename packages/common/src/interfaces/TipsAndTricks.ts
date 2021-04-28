import {CreatorShort} from './Creator'
export interface TipsAndTricksShort {
  id: string,
  previewUrl: string,
  viewsCount: number,
}

export interface TipsAndTricks extends TipsAndTricksShort {
  creator : CreatorShort,
  videoUrl : string,
  previewUrl : string,
  title: string,
  description: string,
  isBookmarked?: boolean,
}

export interface TipsAndTricksDatabaseRow {
  id: string,
  title: string,
  description: string,
  featured: boolean,
  videoUrl : string,
  previewUrl : string,
  viewsCount: number,
  createdAt: string,
  updatedAt: string,
  authorId: string
}
