import {
  CAM_VIDEO_CHANGED,
  CAM_AUDIO_CHANGED,
  SCREEN_VIDEO_CHANGED,
  SCREEN_AUDIO_CHANGED,
  FACE_TRACKING_CHANGED,
  CONSUMERS_CHANGED,
  Action
} from '../actions';

export type BooleanAction = { [key: string]: boolean };

export function setCamVideoState (isEnable: boolean): Action { console.log('setCamVideoState', isEnable); return { type: CAM_VIDEO_CHANGED, isEnable: isEnable }};
export const setCamAudioState = (isEnable: boolean): Action => ({ type: CAM_AUDIO_CHANGED, isEnable });
export const setFaceTrackingState = (isEnable: boolean): Action => ({ type: FACE_TRACKING_CHANGED, isEnable });
export const setConsumers = (consumers: any[]): any => ({ type: CONSUMERS_CHANGED, consumers});