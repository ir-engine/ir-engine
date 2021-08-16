import { CreatorShort } from './Creator'
export interface TipsAndTricksShort {
  id: string
}

export interface TipsAndTricks extends TipsAndTricksShort {
  creator: CreatorShort
  videoUrl: string
  title: string
  description: string
}

export interface TipsAndTricksDatabaseRow {
  id: string
  title: string
  description: string
  // featured: boolean,
  videoUrl: string
  createdAt: string
  updatedAt: string
  authorId: string
}
