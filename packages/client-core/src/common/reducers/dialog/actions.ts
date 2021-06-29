import {
  SHOW_DIALOG,
  CLOSE_DIALOG
} from '../actions';

export interface DialogState {
    isOpened: boolean;
    content: any;
}
export interface DialogAction {
    type: string;
    content: any;
}
export function dialogShow (content: any): DialogAction {
  return {
    type: SHOW_DIALOG,
    content
  };
}
export function dialogClose (): DialogAction {
  return {
    type: CLOSE_DIALOG,
    content: undefined
  };
}
