import Immutable from 'immutable';
import {
  FeedCommentsAction,
  FeedCommentsRetrievedAction,
  AddFeedCommentFiresAction,
  AddFeedCommentAction
} from './actions';

import {
  FEED_COMMENTS_RETRIEVED,
  FEED_COMMENTS_FETCH, 
  ADD_FEED_COMMENT_FIRES,
  REMOVE_FEED_COMMENT_FIRES ,
  ADD_FEED_COMMENT
} from '../actions';

export const initialState = {
  feeds: {
    feedComments: [],
    fetching: false
  },
};

const immutableState = Immutable.fromJS(initialState);

const feedCommentsReducer = (state = immutableState, action: FeedCommentsAction): any => {
  switch (action.type) {
    case FEED_COMMENTS_FETCH : return state.set('fetching', true);
    case FEED_COMMENTS_RETRIEVED:     
      return state.set('feedComments', (action as FeedCommentsRetrievedAction).comments || []).set('fetching', false);
    case ADD_FEED_COMMENT_FIRES:
      return state.set('feedComments', state.get('feedComments').map(item => {
        if(item.id === (action as AddFeedCommentFiresAction).commentId) {
          return {...item, fires: parseInt(item.fires)+1, isFired:true};
        }
        return {...item};
      }));
    case REMOVE_FEED_COMMENT_FIRES:
      return state.set('feedComments', state.get('feedComments').map(item => {
        if(item.id === (action as AddFeedCommentFiresAction).commentId) {
          return {...item, fires: --item.fires, isFired:false};
        }
        return {...item};
      }));

      case ADD_FEED_COMMENT:
        // console.log((action as AddFeedCommentAction).comment, state.get('feedComments') || [] );return 1;
        return state.set('feedComments', [ (action as AddFeedCommentAction).comment, ...state.get('feedComments') || []]);
}


  return state;
};

export default feedCommentsReducer;
