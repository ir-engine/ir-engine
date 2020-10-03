import { Dispatch } from 'redux';
import { dispatchAlertError } from "../alert/service";
import { client } from '../feathers';
import { locationsRetrieved } from './actions';

export function getLocations(skip?: number, limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      console.log('Getting locations');
      const locationResults = await client.service('location').find({
        query: {
          $limit: limit != null ? limit : getState().get('locations').get('limit'),
          $skip: skip != null ? skip : getState().get('locations').get('skip'),
        }
      });
      dispatch(locationsRetrieved(locationResults));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}