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
} from '../actions';

export interface PopupsActions {
  type: string;
  state: boolean;
  id?: string;
}

export function changeCreatorPage (state, id): PopupsActions {
  return {
    type: CHANGE_CREATOR_PAGE_STATE,
    state,
    id
  };
}

export function changeCreatorForm (state): PopupsActions {
  return {
    type: CHANGE_CREATOR_FORM_STATE,
    state
  };
}

export function changeFeedPage (state, id): PopupsActions {
  return {
    type: CHANGE_FEED_PAGE_STATE,
    state,
    id
  };
}

export function changeArMedia (state): PopupsActions {
  return {
    type: CHANGE_ARMEDIA_CHOOSE_STATE,
    state
  };
}

export function changeNewFeedPage (state): PopupsActions {
  return {
    type: CHANGE_NEW_FEED_PAGE_STATE,
    state,
  };
}

export function changeShareForm (state): PopupsActions {
  return {
    type: CHANGE_SHARE_FORM_STATE,
    state,
  };
}

