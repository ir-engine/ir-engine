/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import {
  CHANGE_CREATOR_PAGE_STATE,
  CHANGE_CREATOR_FORM_STATE,
  CHANGE_FEED_PAGE_STATE,
  CHANGE_ARMEDIA_CHOOSE_STATE,
  CHANGE_NEW_FEED_PAGE_STATE,
  CHANGE_SHARE_FORM_STATE,
  CHANGE_WEB_XR_STATE
} from '../actions'
import Immutable from 'immutable'
import { PopupsActions } from './actions'

export const initialPopupState = {
  popups: {
    creatorPage: false,
    creatorForm: false,
    creatorId: null,
    feedPage: false,
    feedId: null,
    shareFeedPage: false,
    arMedia: false,
    shareForm: false,
    videoUrl: null,
    webxr: false,
    videoPath: null,
    imgSrc: null,
    fPath: null,
    nameId: null
  }
}

const immutableState = Immutable.fromJS(initialPopupState) as any

const popupsStateReducer = (state = immutableState, action: PopupsActions): any => {
  switch (action.type) {
    case CHANGE_CREATOR_PAGE_STATE:
      return state.set('creatorPage', (action as PopupsActions).state).set('creatorId', (action as PopupsActions).id)
    case CHANGE_CREATOR_FORM_STATE:
      return state.set('creatorForm', (action as PopupsActions).state)
    case CHANGE_FEED_PAGE_STATE:
      return state.set('feedPage', (action as PopupsActions).state).set('feedId', (action as PopupsActions).id)
    case CHANGE_ARMEDIA_CHOOSE_STATE:
      return state.set('arMedia', (action as PopupsActions).state)
    case CHANGE_NEW_FEED_PAGE_STATE:
      return state
        .set('shareFeedPage', (action as PopupsActions).state)
        .set('videoPath', (action as PopupsActions).id)
        .set('fPath', (action as PopupsActions).fPath)
        .set('nameId', (action as PopupsActions).nameId)
    case CHANGE_SHARE_FORM_STATE:
      return state
        .set('shareForm', (action as PopupsActions).state)
        .set('videoUrl', (action as PopupsActions).id)
        .set('imgSrc', (action as PopupsActions).imgSrc)
    case CHANGE_WEB_XR_STATE:
      return state.set('webxr', (action as PopupsActions).state).set('itemId', (action as PopupsActions).id)
  }
  return state
}

export default popupsStateReducer
