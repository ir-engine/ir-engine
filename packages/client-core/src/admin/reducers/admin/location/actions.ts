import {
  ADMIN_LOCATION_TYPES_RETRIEVED,
  ADMIN_FETCH_CURRENT_LOCATION,
  ADMIN_LOCATIONS_RETRIEVED,
  ADMIN_LOCATION_RETRIEVED,
  ADMIN_LOCATION_CREATED,
  ADMIN_LOCATION_PATCHED,
  ADMIN_LOCATION_REMOVED,
  ADMIN_LOCATION_BAN_CREATED,
  ADMIN_LOCATION_NOT_FOUND
} from '../../actions'
import { Location } from '@xrengine/common/src/interfaces/Location'

export interface LocationsRetrievedAction {
  type: string
  locations: any[]
}

export interface LocationRetrievedAction {
  type: string
  location: any
}

export interface LocationBanCreatedAction {
  type: string
}

export interface FetchingCurrentLocationAction {
  type: string
}

export interface LocationCreatedAction {
  type: string
  location: Location
}

export interface LocationPatchedAction {
  type: string
  location: Location
}

export interface LocationRemovedAction {
  type: string
}
export interface LocationNotFoundAction {
  type: string
}

export type LocationsAction =
  | LocationsRetrievedAction
  | LocationRetrievedAction
  | LocationBanCreatedAction
  | FetchingCurrentLocationAction
  | LocationNotFoundAction

export function locationsRetrieved(locations: any): LocationsRetrievedAction {
  return {
    type: ADMIN_LOCATIONS_RETRIEVED,
    locations: locations
  }
}

export function locationRetrieved(location: any): LocationRetrievedAction {
  return {
    type: ADMIN_LOCATION_RETRIEVED,
    location: location
  }
}

export function locationCreated(location: Location): LocationCreatedAction {
  return {
    type: ADMIN_LOCATION_CREATED,
    location: location
  }
}

export function locationPatched(location: Location): LocationCreatedAction {
  return {
    type: ADMIN_LOCATION_PATCHED,
    location: location
  }
}

export function locationRemoved(location: Location): LocationCreatedAction {
  return {
    type: ADMIN_LOCATION_REMOVED,
    location: location
  }
}

export function locationBanCreated(): LocationBanCreatedAction {
  return {
    type: ADMIN_LOCATION_BAN_CREATED
  }
}

export function fetchingCurrentLocation(): FetchingCurrentLocationAction {
  return {
    type: ADMIN_FETCH_CURRENT_LOCATION
  }
}

export function locationNotFound(): LocationNotFoundAction {
  return {
    type: ADMIN_LOCATION_NOT_FOUND
  }
}
export interface LocationsRetrievedAction {
  type: string
  locations: any[]
}

export interface LocationTypesRetrievedResponse {
  type: string
  types: any[]
}

export function locationTypesRetrieved(data: any): LocationTypesRetrievedResponse {
  return {
    type: ADMIN_LOCATION_TYPES_RETRIEVED,
    types: data
  }
}
