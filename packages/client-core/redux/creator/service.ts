import { Creator } from '@xr3ngine/common/interfaces/Creator';
import { Dispatch } from 'redux';
import { dispatchAlertError } from "../alert/service";
import { client } from '../feathers';
import {
  fetchingCreator,
  creatorRetrieved,
  creatorsRetrieved,
  creatorLoggedRetrieved
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
      const updatedCreator = await client.service('creator').patch(creator.id, creator);   
      dispatch(creatorLoggedRetrieved(updatedCreator));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}