import Immutable from 'immutable'
import { ContentPackAction, LoadedContentPacksAction } from './actions'
import _ from 'lodash'
import { match } from 'ts-pattern'

import { CONTENT_PACK_CREATED, CONTENT_PACK_PATCHED, LOADED_CONTENT_PACKS } from '../actions'

export const initialState = {
  contentPacks: [],
  updateNeeded: true
}

const immutableState = Immutable.fromJS(initialState) as any

const contentPackReducer = (state = immutableState, action: ContentPackAction): any => {
  let newValues, updateMap

  match(action.type)
    .with(LOADED_CONTENT_PACKS, (value) => {
      newValues = action as LoadedContentPacksAction
      let contentPacks = state.get('contentPacks')
      contentPacks = newValues.contentPacks
      return state.set('updateNeeded', false).set('contentPacks', contentPacks)
    })
    .with(CONTENT_PACK_CREATED, (value) => {
      return state.set('updateNeeded', true)
    })
    .with(CONTENT_PACK_PATCHED, (value) => {
      return state.set('updateNeeded', true)
    })
  // switch (action.type) {
  //   case LOADED_CONTENT_PACKS:
  //     newValues = action as LoadedContentPacksAction
  //     let contentPacks = state.get('contentPacks')
  //     contentPacks = newValues.contentPacks
  //     return state.set('updateNeeded', false).set('contentPacks', contentPacks)
  //   case CONTENT_PACK_CREATED:
  //     return state.set('updateNeeded', true)
  //   case CONTENT_PACK_PATCHED:
  //     return state.set('updateNeeded', true)
  // }

  return state
}

export default contentPackReducer
