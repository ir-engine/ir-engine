/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */

import {
  ADD_TIPSANDTRICKS, REMOVE_TIPSANDTRICKS,
  TIPSANDTRICKS_FETCH, TIPSANDTRICKS_RETRIEVED,
  UPDATE_TIPSANDTRICKS
} from './actions';
import Immutable from 'immutable';
import {
  TipsAndTricksRetrievedAction,
  TipsAndTricksAction
} from './actions';

const tipsList = [
  {
    title: 'Item 1',
    id: '1',
    video: 'video1.mp4',
    description: 'Tip number 1',
  },
  {
    title: 'Item 2',
    id: '2',
    video: 'video2.mp4',
    description: 'Tip number 2',
  },
  {
    title: 'Item 3',
    id: '3',
    video: 'video3.mp4',
    description: 'Tip number 3',
  },
  {
    title: 'Item 4',
    id: '4',
    video: 'video4.mp4',
    description: 'Tip number 4',
  },
];

export const initialTipsAndTricksState = {
  tips_and_tricks: {},
};

const immutableState = Immutable.fromJS(initialTipsAndTricksState);

const tipsAndTricksReducer = (state = immutableState, action: TipsAndTricksAction): any => {
  // const currentTipsAndTricks = state.get('tips_and_tricks');
  switch (action.type) {
    case TIPSANDTRICKS_FETCH : return state.set('fetching', true);
    case TIPSANDTRICKS_RETRIEVED:
      return state.set('tips_and_tricks', (action as TipsAndTricksRetrievedAction).tips_and_tricks)
        .set('fetching', false);
    case ADD_TIPSANDTRICKS:
      return state.set('tips_and_tricks', [...state.get('tips_and_tricks'), (action as TipsAndTricksRetrievedAction).tips_and_tricks]);
    case UPDATE_TIPSANDTRICKS:
      return state.set('tips_and_tricks', state.get('tips_and_tricks').map(tips_and_tricks => {
        if(tips_and_tricks.id === (action as TipsAndTricksRetrievedAction).tips_and_tricks.id) {
          return {...tips_and_tricks, ...(action as TipsAndTricksRetrievedAction).tips_and_tricks};
        }
        return {...tips_and_tricks};
      }));
    case REMOVE_TIPSANDTRICKS:
        return state.set('tips_and_tricks', [...state.get('tips_and_tricks').filter(tips_and_tricks =>
          tips_and_tricks.id !== (action as TipsAndTricksRetrievedAction).tips_and_tricks)]);
  }

  return state;
};

export default tipsAndTricksReducer;
