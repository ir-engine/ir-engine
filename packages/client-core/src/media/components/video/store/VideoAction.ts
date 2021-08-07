import { PublicVideo } from '@xrengine/common/src/interfaces/Video'

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
