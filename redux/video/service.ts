// eslint-disable-next-line no-unused-vars
import { Dispatch } from 'redux'
import {
  videosFetchedSuccess,
  videosFetchedError,
  // fileUploadFailure,
  fileUploadSuccess,
  // eslint-disable-next-line no-unused-vars
  PublicVideo
} from './actions'
import axios from 'axios'

const apiUrl = process.env.NODE_ENV =="production" ? '' :'http://localhost:3030'
import { client } from '../feathers'

export function fetchPublicVideos() {
  return (dispatch: Dispatch) => {
    client.service('static-resource').find({ query: { $limit: 30, mime_type: 'application/dash+xml' }})
      .then((res: any) => {
        for (const video of res.data) {
          video.metadata = JSON.parse(video.metadata)
        }
        const videos = res.data as PublicVideo[]

        return dispatch(videosFetchedSuccess(videos))
      })
      .catch(() => dispatch(videosFetchedError('Failed to fetch videos')))
  }
}

export function uploadFile(data:any){
  return async (dispatch: Dispatch) => {
    console.log(data,"dataform")
   let res = await axios.post(`${apiUrl}/upload`,data,{
    headers: {
      'Content-Type': 'multipart/form-data'
  }
   })
    const image = res.data
    dispatch(fileUploadSuccess(image))
  }
}