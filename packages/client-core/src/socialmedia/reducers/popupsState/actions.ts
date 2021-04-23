/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import {
  CHANGE_CREATOR_PAGE_STATE,
  CHANGE_CREATOR_FORM_STATE,
} from '../actions';

export interface PopupsActions {
  type: string;
  state: boolean;
  id?: string;
}

export type FeedsAction =
PopupsActions

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