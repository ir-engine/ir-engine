import {
  SET_VIDEO_PLAYING,
  Action
} from '../actions';

export interface VideoPlayingAction extends Action {
  playing: boolean;
}

// used in rendering video ui such as seeker and play/pause button.
export const setVideoPlaying = (playing: boolean): VideoPlayingAction => ({ type: SET_VIDEO_PLAYING, playing });
