import alertReducer from './alert/reducers'
import { AppReducer } from './app/AppState'
import dialogReducer from './dialog/reducers'
import scopeErrorReducer from './error/reducer'

export default {
  app: AppReducer,
  alert: alertReducer,
  dialog: dialogReducer,
  scopeError: scopeErrorReducer
}
