import { combineReducers } from 'redux-immutable'
import adminReducer from '@xrengine/client-core/src/admin/reducers'
import commonReducer from '@xrengine/client-core/src/common/reducers'
import socialmediaReducer from '@xrengine/social/src/reducers/index'
import userReducer from '@xrengine/client-core/src/user/reducers'
import { feedReducer } from '@xrengine/client-core/src/social/reducers/feed/FeedState'

const reducers = {
  ...adminReducer,
  ...commonReducer,
  ...socialmediaReducer,
  ...userReducer,
  feeds: feedReducer
}

export default combineReducers(reducers)
