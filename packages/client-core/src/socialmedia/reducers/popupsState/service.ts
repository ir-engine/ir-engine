/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { Dispatch } from 'redux';
import { dispatchAlertError } from '../../../common/reducers/alert/service';
import {
  changeCreatorPage,
  changeCreatorForm
} from './actions';

export function updateCreatorPageState(state: boolean, id?:string) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      dispatch(changeCreatorPage(state, id || null));      
    } catch (err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function updateCreatorFormState(state: boolean) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      dispatch(changeCreatorForm(state));      
    } catch (err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}