import {
  CAM_VIDEO_CHANGED,
  CAM_AUDIO_CHANGED,
  FACE_TRACKING_CHANGED,
  CONSUMERS_CHANGED,
  NEARBY_LAYER_USERS_CHANGED
} from '../actions'

export type BooleanAction = { [key: string]: boolean }

export function setCamVideoState(isEnable: boolean) {
  console.log('setCamVideoState', isEnable)
  return { type: CAM_VIDEO_CHANGED, isEnable: isEnable }
}
export const setCamAudioState = (isEnable: boolean) => ({ type: CAM_AUDIO_CHANGED, isEnable })
export const setFaceTrackingState = (isEnable: boolean) => ({ type: FACE_TRACKING_CHANGED, isEnable })
export const setConsumers = (consumers: any[]): any => ({ type: CONSUMERS_CHANGED, consumers })
export const setNearbyLayerUsers = (users: any[]): any => ({ type: NEARBY_LAYER_USERS_CHANGED, users })
