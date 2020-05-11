import { Dispatch } from 'redux'
import {
  dialogShow,
  dialogClose
} from './actions'

export const showDialog = (content: any) => {
  return (dispatch: Dispatch) => {
    dispatch(dialogShow(content))
  }
}
export const closeDialog = () => {
  return (dispatch: Dispatch) => {
    dispatch(dialogClose())
  }
}
