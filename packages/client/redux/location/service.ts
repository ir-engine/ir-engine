import { Dispatch } from 'redux';
import { dispatchAlertError } from "../alert/service";
import { client } from '../feathers';
import {
  fetchingCurrentLocation,
  locationsRetrieved,
  locationRetrieved,
  locationBanCreated
} from './actions';

export function getLocations(skip?: number, limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
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

export function getLocation(locationId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(fetchingCurrentLocation());
      const location = await client.service('location').get(locationId);
      console.log('getLocation location:');
      console.log(location);
      dispatch(locationRetrieved(location));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function getLocationByName(locationName: string) {
  console.log("Trying to get location by name", locationName);
  return async (dispatch: Dispatch): Promise<any> => {
      const locationResult = await client.service('location').find({
        query: {
          slugifiedName: locationName
        }
      }).catch(error => {
        console.log("Couldn't get location by name", error);
      });
      console.log('Get location by name result:');
      console.log(locationName);
      console.log(locationResult);
      console.log(locationResult.data[0]);
      if (locationResult.total > 0) {
        dispatch(locationRetrieved(locationResult.data[0]));
      }
  };
}

export function banUserFromLocation(userId: string, locationId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('location-ban').create({
        userId: userId,
        locationId: locationId
      });
      dispatch(locationBanCreated());
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}