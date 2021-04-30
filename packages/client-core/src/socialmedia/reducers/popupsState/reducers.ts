/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { CHANGE_CREATOR_PAGE_STATE, CHANGE_CREATOR_FORM_STATE, CHANGE_FEED_PAGE_STATE, CHANGE_ARMEDIA_CHOOSE_STATE } from '../actions';
import Immutable from 'immutable';
import { PopupsActions } from './actions';

export const initialPopupState = {
  popups: {
    creatorPage: false,
    creatorForm: false,
    creatorId: null,
    feedPage: false,
    feedId: null,
    shareFeedPage: false,
    arMedia: false,
  },
};

const immutableState = Immutable.fromJS(initialPopupState);

const popupsStateReducer = (state = immutableState, action: PopupsActions): any => {
  switch (action.type) {
    case CHANGE_CREATOR_PAGE_STATE : return state.set('creatorPage', (action as PopupsActions).state).set('creatorId', (action as PopupsActions).id);
    case CHANGE_CREATOR_FORM_STATE : return state.set('creatorForm', (action as PopupsActions).state);
    case CHANGE_FEED_PAGE_STATE : return state.set('feedPage', (action as PopupsActions).state).set('feedId', (action as PopupsActions).id);
    case CHANGE_ARMEDIA_CHOOSE_STATE : return state.set('arMedia', (action as PopupsActions).state);
  }
  return state;
};

export default popupsStateReducer;
