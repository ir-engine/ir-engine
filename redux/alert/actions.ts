import {
  SHOW_NOTIFICATION
} from '../actions'

export type AlertType = 'error' | 'success' | 'warning' | 'none'
export interface AlertState {
    message: string
    type: AlertType
}
export interface AlertAction {
    type: string
    alertType: AlertType
    message: string
}
export const showAlert = (type: AlertType, message: string): AlertAction => {
  return {
    type: SHOW_NOTIFICATION,
    alertType: type,
    message
  }
}
export const hideAlert = (): AlertAction => {
  return {
    type: SHOW_NOTIFICATION,
    alertType: 'none',
    message: ''
  }
}
