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

export interface UploadAction {
  type: string
  payload?: any
  message?: string
}

export const VideoAction = {
  videosFetchedSuccess: (videos: PublicVideo[]) => {
    return {
      type: 'VIDEOS_FETCHED_SUCCESS' as const,
      videos: videos
    }
  },
  videosFetchedError: (err: string) => {
    return {
      type: 'VIDEOS_FETCHED_ERROR' as const,
      message: err
    }
  }
}

export type VideoActionType = ReturnType<typeof VideoAction[keyof typeof VideoAction]>
