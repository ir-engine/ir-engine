import { combineReducers } from 'redux-immutable'
import adminReducer from '@xrengine/client-core/src/admin/reducers'
import commonReducer from '@xrengine/client-core/src/common/reducers'
import userReducer from '@xrengine/client-core/src/user/reducers'
import arMediaReducer from '@xrengine/client-core/src/social/reducers/arMedia/reducers'
import creatorReducer from '@xrengine/client-core/src/social/reducers/creator/reducers'
import feedReducer from '@xrengine/client-core/src/social/reducers/feed/reducers'
import feedCommentsReducer from '@xrengine/client-core/src/social/reducers/feedComment/reducers'
import feedFiresReducer from '@xrengine/client-core/src/social/reducers/feedFires/reducers'
import popupsStateReducer from '@xrengine/client-core/src/social/reducers/popupsState/reducers'
import thefeedsReducer from '@xrengine/client-core/src/social/reducers/thefeeds/reducers'
import thefeedsFiresReducer from '@xrengine/client-core/src/social/reducers/thefeedsFires/reducers'
import webxrnativeReducer from '@xrengine/client-core/src/social/reducers/webxr_native/reducers'
import registrationReducer from '@xrengine/client-core/src/social/reducers/registration/reducers'

const reducers = {
  ...adminReducer,
  ...commonReducer,
  creators: creatorReducer,
  feeds: feedReducer,
  feedFires: feedFiresReducer,
  feedComments: feedCommentsReducer,
  arMedia: arMediaReducer,
  popups: popupsStateReducer,
  thefeeds: thefeedsReducer,
  thefeedsFires: thefeedsFiresReducer,
  webxrnative: webxrnativeReducer,
  registrationReducer: registrationReducer,
  ...userReducer
}

export default combineReducers(reducers)
