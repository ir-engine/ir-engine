import { combineReducers } from 'redux-immutable'
import appReducer from './app/reducers'
import authReducer from './auth/reducers'
import videoReducer from './video/reducers'
import sceneReducer from './scenes/reducers'
import alertReducer from './alert/reducers'
import dialogReducer from './dialog/reducers'
import deviceDetectReducer from './devicedetect/reducers'

import friendReducer from './friend/reducers'
import groupReducer from './group/reducers'
import groupUserReducer from './group-user/reducers'
import partyReducer from './party/reducers'
import inviteReducer from './invite/reducers'
import userReducer from './user/reducers'
import video360Reducer from './video360/reducers'
import seatReducer from './seats/reducers'

export default combineReducers({
  app: appReducer,
  auth: authReducer,
  friends: friendReducer,
  groups: groupReducer,
  groupUsers: groupUserReducer,
  party: partyReducer,
  invite: inviteReducer,
  videos: videoReducer,
  video360: video360Reducer,
  scenes: sceneReducer,
  alert: alertReducer,
  dialog: dialogReducer,
  devicedetect: deviceDetectReducer,
  seat: seatReducer,
  user: userReducer
})
