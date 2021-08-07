export interface PublicVideoState {
  videos: PublicVideo[]
  error: string
}

export interface VideoMetaData {
  thumbnailUrl?: string
  '360_format'?: string
  rating?: string
  categories?: string[]
  runtime?: string
}

export interface PublicVideo {
  id: number
  name: string
  description: string
  url: string
  metadata: Partial<VideoMetaData>
}
export interface Image {
  id: number
  name: string
  type: string
  url: string
}
export interface VideosFetchedAction {
  type: string
  videos?: PublicVideo[]
  image?: Image
  message?: string
}

export interface UploadAction {
  type: string
  payload?: any
  message?: string
}
