import { combineReducers } from 'redux-immutable'
import authReducer from './auth/reducers'
import videoReducer from './video/reducers'
import sceneReducer from './scenes/reducers'
import alertReducer from './alert/reducers'
import dialogReducer from './dialog/reducers'
import deviceDetectReducer from './devicedetect/reducers'

export default combineReducers({
  auth: authReducer,
  videos: videoReducer,
  scenes: sceneReducer,
  alert: alertReducer,
  dialog: dialogReducer,
  devicedetect: deviceDetectReducer
})
