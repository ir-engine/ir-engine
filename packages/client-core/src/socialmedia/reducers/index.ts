import arMediaReducer from './arMedia/reducers'
import creatorReducer from './creator/reducers'
import feedReducer from './feed/reducers'
import feedCommentsReducer from './feedComment/reducers'
import feedFiresReducer from './feedFires/reducers'
import popupsStateReducer from './popupsState/reducers'
import tipsAndTricksReducer from './tips_and_tricks/reducers'
import thefeedsReducer from './thefeeds/reducers'
import thefeedsFiresReducer from './thefeedsFires/reducers'
import webxrnativeReducer from './webxr_native/reducers'

export default {
  creators: creatorReducer,
  feeds: feedReducer,
  feedFires: feedFiresReducer,
  feedComments: feedCommentsReducer,
  arMedia: arMediaReducer,
  popups: popupsStateReducer,
  tips_and_tricks: tipsAndTricksReducer,
  thefeeds: thefeedsReducer,
  thefeedsFires: thefeedsFiresReducer,
  webxrnative: webxrnativeReducer
}
