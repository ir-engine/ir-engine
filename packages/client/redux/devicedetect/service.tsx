import { Dispatch } from 'redux';
import { getDeviceType } from './actions';

export function detectDeviceType(content: any) {
  return (dispatch: Dispatch): any => {
    dispatch(getDeviceType(content));
  };
}
