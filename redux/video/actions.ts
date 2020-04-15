import {
    VIDEOS_FETCHED_SUCCESS,
    VIDEOS_FETCHED_ERROR
} from '../actions'

export interface PublicVideoState {
    videos: PublicVideo[]
    error: string
}

export interface PublicVideo {
    id: number
    title: string
    original_title: string
    description: string
    link: string,
    thumbnail_url: string,
    production_credit: string,
    rating: string,
    categories: string,
    runtime: string,
    tags: string
}

export interface VideosFetchedAction {
    type: string
    videos?: PublicVideo[]
    message?: string
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
