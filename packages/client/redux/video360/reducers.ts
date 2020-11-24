import Immutable from 'immutable';
import {
  VideoPlayingAction
} from './actions';

import {
  SET_VIDEO_PLAYING
} from '../actions';

type Video360State = {
  playing: boolean;
}

export const initialState: Video360State = {
  playing: false
};

const immutableState = Immutable.fromJS(initialState);

const video360Reducer = (state = immutableState, action: VideoPlayingAction): Video360State => {
  switch (action.type) {
    case SET_VIDEO_PLAYING:
      return state
        .set('playing', action.playing);
    default:
      break;
  }

  return state;
};

export default video360Reducer;
