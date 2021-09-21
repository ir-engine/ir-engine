import adminReducer from '@xrengine/client-core/src/admin/reducers/index'
import commonReducer from '@xrengine/client-core/src/common/reducers/index'
import socialReducer from '@xrengine/client-core/src/social/reducers/index'
import userReducer from '@xrengine/client-core/src/user/reducers/index'
import worldReducer from '@xrengine/client-core/src/world/reducers/index'
import networkingReducer from './reducers/reducers'

import { combineReducers } from 'redux-immutable'

export default combineReducers({
  ...adminReducer,
  ...commonReducer,
  ...networkingReducer,
  ...socialReducer,
  ...userReducer,
  ...worldReducer
})
