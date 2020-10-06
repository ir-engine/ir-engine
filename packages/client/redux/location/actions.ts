import {
  LOCATIONS_RETRIEVED
} from '../actions';

export interface LocationsRetrievedAction {
  type: string;
  locations: any[];
}

export type LocationsAction =
  LocationsRetrievedAction

export function locationsRetrieved (locations: any): LocationsRetrievedAction {
  return {
    type: LOCATIONS_RETRIEVED,
    locations: locations
  };
}