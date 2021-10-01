import adminReducer from '@xrengine/client-core/src/admin/reducers'
import commonReducer from '@xrengine/client-core/src/common/reducers'
import socialReducer from '@xrengine/client-core/src/social/reducers'
import userReducer from '@xrengine/client-core/src/user/reducers'
import worldReducer from '@xrengine/client-core/src/world/reducers'
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
