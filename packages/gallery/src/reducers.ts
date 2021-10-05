import { combineReducers } from 'redux-immutable'
import adminReducer from '@xrengine/client-core/src/admin/reducers'
import commonReducer from '@xrengine/client-core/src/common/reducers'
import socialmediaReducer from '@xrengine/client-core/src/social/reducers/socialmedia/reducers/index'
import userReducer from '@xrengine/client-core/src/user/reducers'

const reducers = {
  ...adminReducer,
  ...commonReducer,
  ...socialmediaReducer,
  ...userReducer
}

export default combineReducers(reducers)
