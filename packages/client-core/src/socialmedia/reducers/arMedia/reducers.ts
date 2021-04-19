/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import Immutable from 'immutable';

/**
 * Commenting code to compile TSDOC Docusaurus
 * this file contain some issues with
 * FeedFiresAction, FeedFiresRetriveAction imports are not available in actions.ts file its empty file.
 *
 */

import {
  ARMEDIA_FETCHING,
  ARMEDIA_ADMIN_RETRIEVED,
  ARMEDIA_RETRIEVED,
  ADD_ARMEDIA
} from '../actions';
import { ArMediaAction, ArMediaOneAction, ArMediaRetriveAction } from './actions';

export const initialArMediaState = {
  arMedia: {
    adminList: [],
    list: [],
    fetching: false
  },
};

const immutableState = Immutable.fromJS(initialArMediaState);

const arMediaReducer = (state = immutableState, action: ArMediaAction): any => {
  switch (action.type) {
    case ARMEDIA_FETCHING : return state.set('fetching', true);
    case ARMEDIA_ADMIN_RETRIEVED:
      return state.set('adminList', (action as ArMediaRetriveAction).list).set('fetching', false);
    case ARMEDIA_RETRIEVED:
        return state.set('list', (action as ArMediaRetriveAction).list).set('fetching', false);
    case ADD_ARMEDIA:
      return state.set('adminList', [...state.get('adminList'), (action as ArMediaOneAction).item]);
  }

  return state;
};

export default arMediaReducer;
