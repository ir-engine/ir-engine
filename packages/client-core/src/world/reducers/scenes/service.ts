import { Dispatch } from 'redux';
import {
  scenesFetchedSuccess,
  // scenesFetchedError,
  PublicScene
} from './actions';

import getConfig from 'next/config';
const config = getConfig().publicRuntimeConfig.xr.vrRoomGrid;

const media: PublicScene[] = config.scenes;

export function fetchPublicScenes () {
  return (dispatch: Dispatch): any => {
    const scenes = media as PublicScene[];
    return dispatch(scenesFetchedSuccess(scenes));
  };
}
