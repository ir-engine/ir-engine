import arMediaReducer from './arMedia/reducers';
import creatorReducer from './creator/reducers';
import feedReducer from './feed/reducers';
import feedCommentsReducer from './feedComment/reducers';
import feedFiresReducer from './feedFires/reducers';
import popupsStateReducer from './popupsState/reducers';

export default {
  creators: creatorReducer,
  feeds: feedReducer,
  feedFires: feedFiresReducer,
  feedComments: feedCommentsReducer,
  arMedia: arMediaReducer,
  popups: popupsStateReducer,
};
