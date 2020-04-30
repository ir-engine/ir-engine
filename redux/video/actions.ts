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
    thumbnail_url?: string,
    '360_format'?: string
}
export interface PublicVideo {
    id: number
    name: string
    description: string
    url: string,
    metadata: Partial<VideoMetaData>
}

export interface VideosFetchedAction {
    type: string
    videos?: PublicVideo[]
    message?: string
}

export interface UploadAction {
  type: string;
  payload?: any;
  message?: string;
}

export function videosFetchedSuccess(videos: PublicVideo[]): VideosFetchedAction {
  return {
    type: VIDEOS_FETCHED_SUCCESS,
    videos: videos
  }
}

export function videosFetchedError(err: string): VideosFetchedAction {
  return {
    type: VIDEOS_FETCHED_ERROR,
    message: err
  }
}


export function fileUploadSuccess(payload: any): UploadAction{
  return {
    type: UPLOAD_FILE,
    payload
  }
}
export function fileUploadFailure(err: any): UploadAction{
  return {
    type: UPLOAD_FILE_FAILURE,
    message: err
  }
}