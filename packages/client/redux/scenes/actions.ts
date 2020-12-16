import {
  SCENES_FETCHED_SUCCESS,
  SCENES_FETCHED_ERROR,
  SCENES_RETRIEVED,
  SET_CURRENT_SCENE,
} from '../actions';

export interface PublicScenesState {
    scenes: PublicScene[];
    currentScene : PublicScene;
    error: string;
}

export interface PublicScene {
    url: string;
    name: string;
    thumbnailUrl?: string;
}

export interface ScenesFetchedAction {
    type: string;
    scenes?: PublicScene[];
    scene?: PublicScene;
    message?: string;
}

export interface CollectionsFetchedAction {
    type: string;
    collections: any[];
}

export function scenesFetchedSuccess (scenes: PublicScene[]): ScenesFetchedAction {
  return {
    type: SCENES_FETCHED_SUCCESS,
    scenes: scenes
  };
}

export function scenesFetchedError (err: string): ScenesFetchedAction {
  return {
    type: SCENES_FETCHED_ERROR,
    message: err
  };
}

export function collectionsFetched (collections: any[]): CollectionsFetchedAction {
    return {
        type: SCENES_RETRIEVED,
        collections: collections
    };
}

export function setCurrentScene (scene: PublicScene): ScenesFetchedAction {
  return {
    type: SET_CURRENT_SCENE,
    scene: scene
  };
}