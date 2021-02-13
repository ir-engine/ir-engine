import { Dispatch } from 'redux';
import {
  showAlert,
  hideAlert
} from './actions';
import getConfig from 'next/config';

const config = getConfig().publicRuntimeConfig;
const timeout = (config && config.alert && config.alert.timeout) ?? 10000;

export function alertSuccess (message: string) {
  return (dispatch: Dispatch): any => {
    dispatch(showAlert('success', message));
  };
}
export function alertWarning (message: string) {
  return (dispatch: Dispatch): any => {
    dispatch(showAlert('warning', message));
  };
}
export function alertError (message: string) {
  return (dispatch: Dispatch): any => {
    dispatch(showAlert('error', message));
  };
}
export function alertCancel () {
  return (dispatch: Dispatch): any => {
    dispatch(hideAlert());
  };
}

let timerId: any;
function clearTimer () {
  if (timerId) {
    clearTimeout(timerId);
    timerId = 0;
  }
}

function restartTimer (dispatch: Dispatch) {
  clearTimer();
  timerId = setTimeout(() => dispatch(hideAlert()), timeout);
}

export function dispatchAlertSuccess (dispatch: Dispatch, message: string) {
  restartTimer(dispatch);
  return dispatch(showAlert('success', message));
}
export function dispatchAlertWarning (dispatch: Dispatch, message: string) {
  restartTimer(dispatch);
  return dispatch(showAlert('warning', message));
}
export function dispatchAlertError (dispatch: Dispatch, message: string) {
  restartTimer(dispatch);
  return dispatch(showAlert('error', message));
}
export function dispatchAlertCancel (dispatch: Dispatch) {
  clearTimer();
  return dispatch(hideAlert());
}
