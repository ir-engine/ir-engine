import {
  VIDEOS_FETCHED_SUCCESS,
  VIDEOS_FETCHED_ERROR,
  UPLOAD_FILE,
  UPLOAD_FILE_FAILURE
} from '../actions'

export interface PublicVideoState {
  videos: PublicVideo[]
  error: string
}

export interface VideoMetaData {
  // eslint-disable-next-line camelcase
  thumbnail_url?: string,
  '360_format'?: string,
  rating?: string,
  categories?: string[],
  runtime?: string
}

export interface Attribution {
  creator?: string,
  url?: string
}
export interface PublicVideo {
  id: number
  name: string
  description: string
  url: string,
  subscriptionLevel: string,
  metadata: Partial<VideoMetaData>,
  attribution?: Partial<Attribution>
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
  type: string;
  payload?: any;
  message?: string;
}

export function videosFetchedSuccess (videos: PublicVideo[]): VideosFetchedAction {
  return {
    type: VIDEOS_FETCHED_SUCCESS,
    videos: videos
  }
}

export function videosFetchedError (err: string): VideosFetchedAction {
  return {
    type: VIDEOS_FETCHED_ERROR,
    message: err
  }
}

export function fileUploadSuccess (image: Image): VideosFetchedAction {
  return {
    type: UPLOAD_FILE,
    image: image
  }
}
export function fileUploadFailure (err: any): VideosFetchedAction {
  return {
    type: UPLOAD_FILE_FAILURE,
    message: err
  }
}
