import alertReducer from './alert/reducers'
import appReducer from './app/reducers'
import deviceDetectReducer from './devicedetect/reducers'
import dialogReducer from './dialog/reducers'

export default {
  app: appReducer,
  alert: alertReducer,
  dialog: dialogReducer,
  devicedetect: deviceDetectReducer
}
