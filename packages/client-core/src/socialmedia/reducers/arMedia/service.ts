/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { Dispatch } from 'redux';
import { dispatchAlertError } from "../../../common/reducers/alert/service";
import { client } from '../../../feathers';
import { fetchingArMedia, setAdminArMedia, setArMedia } from '../arMedia/actions';

export function getArMediaService(type?: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(fetchingArMedia());
      const list = await client.service('ar-media').find({query:{action:type}});
      dispatch(setAdminArMedia(list));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function getArMedia(type?: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(fetchingArMedia());
      const list = await client.service('ar-media').find({query:{action:type}});
      dispatch(setArMedia(list));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}