import alertReducer from './alert/reducers'
import appReducer from './app/reducers'
import dialogReducer from './dialog/reducers'
import scopeErrorReducer from './error/reducer'

export default {
  app: appReducer,
  alert: alertReducer,
  dialog: dialogReducer,
  scopeError: scopeErrorReducer
}
