import alertReducer from './alert/reducers'
import appReducer from './app/reducers'
import dialogReducer from './dialog/reducers'

export default {
  app: appReducer,
  alert: alertReducer,
  dialog: dialogReducer
}
