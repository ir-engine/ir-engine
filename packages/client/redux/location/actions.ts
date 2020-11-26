import {
  FETCH_CURRENT_LOCATION,
  LOCATIONS_RETRIEVED,
  LOCATION_RETRIEVED,
  LOCATION_CREATED,
  LOCATION_PATCHED,
  LOCATION_REMOVED,
  LOCATION_BAN_CREATED,
  LOCATION_NOT_FOUND
} from '../actions';
import { Location } from '@xr3ngine/common/interfaces/Location';

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

export interface LocationCreatedAction {
  type: string;
  location: Location
}

export interface LocationPatchedAction {
  type: string;
  location: Location;
}

export interface LocationRemovedAction {
  type: string;
}
export interface LocationNotFoundAction{
  type: string;
}

export type LocationsAction =
  LocationsRetrievedAction
  | LocationRetrievedAction
  | LocationBanCreatedAction
  | FetchingCurrentLocationAction
  | LocationNotFoundAction

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

export function locationCreated (location: Location): LocationCreatedAction {
  return {
    type: LOCATION_CREATED,
    location: location
  };
}

export function locationPatched (location: Location): LocationCreatedAction {
  return {
    type: LOCATION_PATCHED,
    location: location
  };
}

export function locationRemoved (location: Location): LocationCreatedAction {
  return {
    type: LOCATION_REMOVED,
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

export function locationNotFound (): LocationNotFoundAction {
  return {
    type: LOCATION_NOT_FOUND
  };
}