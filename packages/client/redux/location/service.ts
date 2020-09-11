import { connectToServer } from "@xr3ngine/engine/src/networking/functions/connectToServer";
import { Dispatch } from 'redux';
import io from 'socket.io-client';
import { client } from '../feathers';
import {
  locationsRetrieved
} from './actions';
import store from "../store";
import {createdGroupUser, fetchingGroups, loadedGroups} from "../group/actions";
import {dispatchAlertError} from "../alert/service";

export function getLocations(skip?: number, limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      console.log('Getting locations')
      const locationResults = await client.service('location').find({
        query: {
          $limit: limit != null ? limit : getState().get('locations').get('limit'),
          $skip: skip != null ? skip : getState().get('locations').get('skip'),
        }
      });
      console.log('PANTS')
      console.log(locationResults)
      dispatch(locationsRetrieved(locationResults));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}