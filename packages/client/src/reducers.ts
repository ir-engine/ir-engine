import adminReducer from '@xr3ngine/client-core/src/admin/reducers';
import commonReducer from '@xr3ngine/client-core/src/common/reducers';
import socialReducer from '@xr3ngine/client-core/src/social/reducers';
import socialmediaReducer from '@xr3ngine/client-core/src/socialmedia/reducers';
import userReducer from '@xr3ngine/client-core/src/user/reducers';
import worldReducer from '@xr3ngine/client-core/src/world/reducers';
import networkingReducer from './reducers/reducers';

import { combineReducers } from 'redux-immutable';

export default combineReducers({
  ...adminReducer,
  ...commonReducer,
  ...networkingReducer,
  ...socialReducer,
  ...socialmediaReducer,
  ...userReducer,
  ...worldReducer
});
