import {
  SHOW_DIALOG,
  CLOSE_DIALOG
} from '../actions'

export interface DialogState {
    isOpened: boolean
    content: any
}
export interface DialogAction {
    type: string
    content: any
}
export const dialogShow = (content: any): DialogAction => {
  return {
    type: SHOW_DIALOG,
    content
  }
}
export const dialogClose = (): DialogAction => {
  return {
    type: CLOSE_DIALOG,
    content: undefined
  }
}
