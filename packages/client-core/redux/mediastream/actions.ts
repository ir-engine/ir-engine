import {
  CAM_VIDEO_CHANGED,
  CAM_AUDIO_CHANGED,
  SCREEN_VIDEO_CHANGED,
  SCREEN_AUDIO_CHANGED,
  FACE_TRACKING_CHANGED,
  Action
} from '../actions';

export type BooleanAction = { [key: string]: boolean };

export const setCamVideoState = (isEnable: boolean): Action => ({ type: CAM_VIDEO_CHANGED, isEnable });
export const setCamAudioState = (isEnable: boolean): Action => ({ type: CAM_AUDIO_CHANGED, isEnable });
export const setFaceTrackingState = (isEnable: boolean): Action => ({ type: FACE_TRACKING_CHANGED, isEnable });
