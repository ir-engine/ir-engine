import Immutable from 'immutable';
import {
  CAM_VIDEO_CHANGED,
  CAM_AUDIO_CHANGED,
  FACE_TRACKING_CHANGED,
} from '../actions';
import { BooleanAction } from './actions';

export const initialState = {
  isCamVideoEnabled: false,
  isCamAudioEnabled: false,
  isFaceTrackingEnabled: false,
};

const immutableState = Immutable.fromJS(initialState);

export default function mediastreamReducer (state = immutableState, action: any): any {
  switch (action.type) {
    case CAM_VIDEO_CHANGED:
      return state
        .set('isCamVideoEnabled', (action as BooleanAction).isEnable);
    case CAM_AUDIO_CHANGED:
      return state
        .set('isCamAudioEnabled', (action as BooleanAction).isEnable);
    case FACE_TRACKING_CHANGED:
      return state
        .set('isFaceTrackingEnabled', (action as BooleanAction).isEnable);
  }

  return state;
}
