import { arMediaReducer } from './arMedia/ArMediaState'
import { creatorReducer } from './creator/CreatorState'
import { feedReducer } from './feed/FeedState'
import { feedCommentsReducer } from './feedComment/FeedCommentState'
import feedFiresReducer from './feedFires/reducers'
import popupsStateReducer from './popupsState/reducers'
import thefeedsReducer from './thefeeds/reducers'
import thefeedsFiresReducer from './thefeedsFires/reducers'
import webxrnativeReducer from './webxr_native/reducers'
import registrationReducer from './registration/reducers'

export default {
  creators: creatorReducer,
  feeds: feedReducer,
  feedFires: feedFiresReducer,
  feedComments: feedCommentsReducer,
  arMedia: arMediaReducer,
  popups: popupsStateReducer,
  thefeeds: thefeedsReducer,
  thefeedsFires: thefeedsFiresReducer,
  webxrnative: webxrnativeReducer,
  registrationReducer: registrationReducer
}
