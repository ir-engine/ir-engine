import {
  LOCATIONS_RETRIEVED,
  SHOWROOM_ENABLED_SET,
  SHOWROOM_LOCATION_RETRIEVED,
  SHOWROOM_LOCATION_SET
} from '../actions';

export interface LocationsRetrievedAction {
  type: string;
  locations: any[];
}

export interface ShowroomLocationRetrievedAction {
  type: string;
  location: any;
}

export interface ShowroomLocationSetAction {
  type: string;
  locationId: string;
}

export interface ShowroomEnabledSetAction {
  type: string;
  showroomEnabled: boolean;
}

export type LocationsAction =
  LocationsRetrievedAction
  | ShowroomEnabledSetAction
  | ShowroomLocationRetrievedAction
  | ShowroomLocationSetAction

export function locationsRetrieved (locations: any): LocationsRetrievedAction {
  return {
    type: LOCATIONS_RETRIEVED,
    locations: locations
  };
}

export function showroomLocationSet (locationId: string): ShowroomLocationSetAction {
  return {
    type: SHOWROOM_LOCATION_SET,
    locationId: locationId
  };
}

export function showroomLocationRetrieved (location: any): ShowroomLocationRetrievedAction {
  return {
    type: SHOWROOM_LOCATION_RETRIEVED,
    location: location
  };
}

export function showroomEnabledSet (enabled: boolean): ShowroomEnabledSetAction {
  return {
    type: SHOWROOM_ENABLED_SET,
    showroomEnabled: enabled
  };
}