import Immutable from 'immutable';
import {
  VideosFetchedAction,
  PublicVideoState
} from './actions';

import {
  VIDEOS_FETCHED_SUCCESS,
  VIDEOS_FETCHED_ERROR
} from '../actions';

export const initialState: PublicVideoState = {
  videos: [],
  error: ''
};

const immutableState = Immutable.fromJS(initialState);

export default function videoReducer (state = immutableState, action: VideosFetchedAction): any {
  switch (action.type) {
    case VIDEOS_FETCHED_SUCCESS: {
      // combine existing videos with new videos given in action
      const currentVideos = state.get('videos');
      const bothVideoSets = [...currentVideos, ...action.videos];
      const uniqueVideos = Array.from(new Set(bothVideoSets.map(a => a.id)))
        .map(id => {
          return bothVideoSets.find(a => a.id === id);
        });
      return state
        .set('videos', uniqueVideos);
    }
    case VIDEOS_FETCHED_ERROR:
      return state
        .set('error', (action as VideosFetchedAction).message);
  }

  return state;
}
