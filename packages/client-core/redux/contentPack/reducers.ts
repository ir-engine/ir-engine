import Immutable from 'immutable';
import {
  ContentPackAction,
  LoadedContentPacksAction
} from './actions';
import _ from 'lodash';

import {
  CONTENT_PACK_CREATE,
  CONTENT_PACK_PATCHED,
  LOADED_CONTENT_PACKS,
} from '../actions';

export const initialState = {
  contentPacks: [],
  updateNeeded: true
};


const immutableState = Immutable.fromJS(initialState);

const contentPackReducer = (state = immutableState, action: ContentPackAction): any => {
  let newValues, updateMap;  
  switch (action.type) {
    case LOADED_CONTENT_PACKS:
      console.log('LOADED_CONTENT_PACKS');
      console.log(action);
      newValues = (action as LoadedContentPacksAction);
      console.log(newValues.contentPacks);
      let contentPacks = state.get('contentPacks');
      console.log('subContentPacks:');
      console.log(contentPacks);
      console.log(contentPacks);
      contentPacks = ['coolpants'];
      console.log('contentPacks after set:');
      console.log(contentPacks);
      return state
          .set('updateNeeded', false)
          .set('contentPacks', contentPacks);
  }

  return state;
};

export default contentPackReducer;
