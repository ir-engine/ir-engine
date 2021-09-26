import { AlertReducer } from './alert/AlertState'
import { AppReducer } from './app/AppState'
import { DialogReducer } from './dialog/DialogState'
import { ErrorReducer } from './error/ErrorState'

export default {
  app: AppReducer,
  alert: AlertReducer,
  dialog: DialogReducer,
  scopeError: ErrorReducer
}
