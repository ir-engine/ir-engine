import { arMediaReducer } from '@xrengine/client-core/src/social/reducers/arMedia/ArMediaState'
import { creatorReducer } from '@xrengine/client-core/src/social/reducers/creator/CreatorState'
import { feedReducer } from '@xrengine/client-core/src/social/reducers/feed/FeedState'
import { feedCommentsReducer } from '@xrengine/client-core/src/social/reducers/feedComment/FeedCommentState'
import { feedFiresReducer } from '@xrengine/client-core/src/social/reducers/feedFires/FeedFiresState'
import { popupsStateReducer } from '@xrengine/client-core/src/social/reducers/popupsState/PopupsStateState'
import { theFeedsReducer } from '@xrengine/client-core/src/social/reducers/thefeeds/TheFeedsState'
import { theFeedsFiresReducer } from '@xrengine/client-core/src/social/reducers/thefeedsFires/TheFeedsFiresState'
import { webxrnativeReducer } from '@xrengine/client-core/src/social/reducers/webxr_native/WebxrNativeState'
import { registrationReducer } from '@xrengine/client-core/src/social/reducers/registration/RegistrationState'

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
