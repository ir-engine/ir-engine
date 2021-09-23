import alertReducer from './alert/reducers'
import { AppReducer } from './app/AppState'
import { DialogReducer } from './dialog/DialogState'
import { ErrorReducer } from './error/ErrorState'

export default {
  app: AppReducer,
  alert: alertReducer,
  dialog: DialogReducer,
  scopeError: ErrorReducer
}
