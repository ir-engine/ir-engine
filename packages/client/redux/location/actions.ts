import {
  FETCH_CURRENT_LOCATION,
  LOCATIONS_RETRIEVED,
  LOCATION_RETRIEVED,
  LOCATION_BAN_CREATED
} from '../actions';

export interface LocationsRetrievedAction {
  type: string;
  locations: any[];
}

export interface LocationRetrievedAction {
  type: string;
  location: any;
}

export interface LocationBanCreatedAction {
  type: string;
}

export interface FetchingCurrentLocationAction {
  type: string;
}

export type LocationsAction =
  LocationsRetrievedAction
  | LocationRetrievedAction
  | LocationBanCreatedAction
  | FetchingCurrentLocationAction

export function locationsRetrieved (locations: any): LocationsRetrievedAction {
  return {
    type: LOCATIONS_RETRIEVED,
    locations: locations
  };
}

export function locationRetrieved (location: any): LocationRetrievedAction {
  return {
    type: LOCATION_RETRIEVED,
    location: location
  };
}

export function locationBanCreated (): LocationBanCreatedAction {
  return {
    type: LOCATION_BAN_CREATED
  };
}

export function fetchingCurrentLocation (): FetchingCurrentLocationAction {
  return {
    type: FETCH_CURRENT_LOCATION
  };
}