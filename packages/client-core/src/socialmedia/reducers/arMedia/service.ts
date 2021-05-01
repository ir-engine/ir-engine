/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { Dispatch } from 'redux';
import { dispatchAlertError } from "../../../common/reducers/alert/service";
import { client } from '../../../feathers';
import { fetchingArMedia, setAdminArMedia, setArMedia, addAdminArMedia, removeArMediaItem } from '../arMedia/actions';

export function getArMediaService(type?: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(fetchingArMedia());
      const list = await client.service('ar-media').find({query:{action:type}});
      dispatch(setAdminArMedia(list.data));
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
      const list = await client.service('ar-media').find({query:{action:type || null}});
      dispatch(setArMedia(list.data));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function createArMedia(mediaItem:any){
  return async (dispatch: Dispatch): Promise<any> => {
    try {     
      const newItem = await client.service('ar-media').create(mediaItem);
      dispatch(addAdminArMedia(newItem));      
    } catch (err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function removeArMedia(mediaItemId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('ar-media').remove(mediaItemId);
      dispatch(removeArMediaItem(mediaItemId));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

