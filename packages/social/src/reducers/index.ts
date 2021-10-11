import { arMediaReducer } from './arMedia/ArMediaState'
import { creatorReducer } from './creator/CreatorState'
import { feedReducer } from './feed/FeedState'
import { feedCommentsReducer } from './feedComment/FeedCommentState'
import { feedFiresReducer } from './feedFires/FeedFiresState'
import { popupsStateReducer } from './popupsState/PopupsStateState'
import { theFeedsReducer } from './thefeeds/TheFeedsState'
import { theFeedsFiresReducer } from './thefeedsFires/TheFeedsFiresState'
import { webxrnativeReducer } from './webxr_native/WebxrNativeState'
import { registrationReducer } from './registration/RegistrationState'

export default {
  creators: creatorReducer,
  feeds: feedReducer,
  feedFires: feedFiresReducer,
  feedComments: feedCommentsReducer,
  arMedia: arMediaReducer,
  popups: popupsStateReducer,
  thefeeds: theFeedsReducer,
  thefeedsFires: theFeedsFiresReducer,
  webxrnative: webxrnativeReducer,
  registrationReducer: registrationReducer
}
