import { Dispatch } from 'redux';
import { dispatchAlertError } from "../alert/service";
import { client } from '../feathers';
import {
  locationsRetrieved,
  showroomEnabledSet,
  showroomLocationRetrieved
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

export function setShowroomLocation(locationId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const location = await client.service('location').get(locationId);
      dispatch(showroomLocationRetrieved(location));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function setShowroomEnabled(enabled: boolean) {
  return async(dispatch: Dispatch): Promise<any> => {
    dispatch(showroomEnabledSet(enabled));
  };
}

export function joinShowroomParty(showroomLocationId: string) {
  return async(dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      let showroomParty;
      const selfUser = getState().get('auth').get('user');
      console.log('joinShowroomParty selfUser:')
      console.log(selfUser);
      const showroomPartyResult = await client.service('party').find({
        query: {
          locationId: showroomLocationId
        }
      });
      console.log('showroomPartyResult:');
      console.log(showroomPartyResult);
      console.log('length: ' + showroomPartyResult.length);
      if (showroomPartyResult.length === 0) {
        showroomParty = await client.service('party').create({
          locationId: showroomLocationId
        });
      } else {
        showroomParty = showroomPartyResult[0];
      }
      console.log(showroomParty.id);

      await client.service('party-user').create({
        partyId: showroomParty.id,
        userId: selfUser.id
      });
    } catch(err) {
      console.log(err);
    }
  };
}