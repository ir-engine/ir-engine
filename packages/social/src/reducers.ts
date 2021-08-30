import { combineReducers } from 'redux-immutable'
import adminReducer from '@xrengine/client-core/src/admin/reducers'
import commonReducer from '@xrengine/client-core/src/common/reducers'
import socialReducer from '@xrengine/client-core/src/social/reducers'
import socialmediaReducer from './reducers/index'
import userReducer from '@xrengine/client-core/src/user/reducers'
import worldReducer from '@xrengine/client-core/src/world/reducers'

const reducers = combineReducers({
  ...adminReducer,
  ...commonReducer,
  ...socialReducer,
  ...socialmediaReducer,
  ...userReducer,
  ...worldReducer
})

export default reducers
