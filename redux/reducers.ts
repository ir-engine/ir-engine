import { combineReducers } from 'redux-immutable'
import appReducer from './app/reducers'
import authReducer from './auth/reducers'
import videoReducer from './video/reducers'
import sceneReducer from './scenes/reducers'
import alertReducer from './alert/reducers'
import dialogReducer from './dialog/reducers'
import userReducer from './user/reducers'
import video360Reducer from './video360/reducers'

export default combineReducers({
  app: appReducer,
  auth: authReducer,
  videos: videoReducer,
  video360: video360Reducer,
  scenes: sceneReducer,
  alert: alertReducer,
  dialog: dialogReducer,
  user: userReducer
})
