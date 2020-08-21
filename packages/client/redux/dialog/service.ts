import { Dispatch } from 'redux';
import {
  dialogShow,
  dialogClose
} from './actions';

export function showDialog(content: any) {
  return (dispatch: Dispatch): any => {
    dispatch(dialogShow(content));
  };
}
export function closeDialog() {
  return (dispatch: Dispatch): any => {
    dispatch(dialogClose());
  };
}
