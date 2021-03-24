import { Creator } from '@xr3ngine/common/interfaces/Creator';
import { Dispatch } from 'redux';
import Api from '../../components/editor/Api';
import { dispatchAlertError } from "../alert/service";
import { client } from '../feathers';
import {
  fetchingCreator,
  creatorRetrieved,
  creatorsRetrieved,
  creatorLoggedRetrieved,
  creatorNotificationList,
  updateCreatorAsFollowed,
  updateCreatorNotFollowed
} from './actions';

export function getCreators(limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      dispatch(fetchingCreator());
      const results =  await client.service('creator').find({query: {}});
      dispatch(creatorsRetrieved(results));      
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function getLoggedCreator() {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(fetchingCreator());
      const creator = await client.service('creator').find({query:{action: 'current'}});      
      dispatch(creatorLoggedRetrieved(creator));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function getCreator(creatorId) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(fetchingCreator());
      const creator = await client.service('creator').get(creatorId);   
      dispatch(creatorRetrieved(creator));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function updateCreator(creator: Creator){
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(fetchingCreator());
      const api = new  Api();
      const storedAvatar = await api.upload(creator.avatar, null);
      //@ts-ignore error that this vars are void bacause upload is defines as voin funtion
      const updatedCreator = await client.service('creator').patch(creator.id, {...creator, avatarId: storedAvatar.file_id});   
      dispatch(creatorLoggedRetrieved(updatedCreator));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function getCreatorNotificationList() {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(fetchingCreator());
      const notificationList = await client.service('notifications').find({query:{action: 'byCurrentCreator'}});   
      dispatch(creatorNotificationList(notificationList));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function followCreator(creatorId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const follow = await client.service('follow-creator').create({creatorId});   
      follow && dispatch(updateCreatorAsFollowed());
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function unFollowCreator(creatorId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const follow = await client.service('follow-creator').remove(creatorId);   
      follow && dispatch(updateCreatorNotFollowed());
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}