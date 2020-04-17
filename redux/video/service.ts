import { Dispatch } from "redux"
import {
  videosFetchedSuccess,
  videosFetchedError,
  PublicVideo
} from "./actions"
// import { ajaxPost } from "../service.common"
import { client } from "../feathers"

export function fetchPublicVideos() {
  return (dispatch: Dispatch) => {
    client.service('public-video').find()
    .then((res: any) => {
      const videos = res.data as PublicVideo[]

      return dispatch(videosFetchedSuccess(videos))
    })
    .catch(() => dispatch(videosFetchedError('Failed to fetch videos')))
  }
}