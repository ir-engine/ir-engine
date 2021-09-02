import {
  FETCH_CURRENT_LOCATION,
  LOCATIONS_RETRIEVED,
  LOCATION_RETRIEVED,
  LOCATION_CREATED,
  LOCATION_PATCHED,
  LOCATION_REMOVED,
  LOCATION_BAN_CREATED,
  LOCATION_NOT_FOUND
} from '../actions'
import { Location } from '@xrengine/common/src/interfaces/Location'

export interface SocialLocationsRetrievedAction {
  type: string
  locations: any[]
}

export interface SocialLocationRetrievedAction {
  type: string
  location: any
}

export interface SocialLocationBanCreatedAction {
  type: string
}

export interface FetchingCurrentSocialLocationAction {
  type: string
}

export interface SocialLocationCreatedAction {
  type: string
  location: Location
}

export interface SocialLocationPatchedAction {
  type: string
  location: Location
}

export interface SocialLocationRemovedAction {
  type: string
}
export interface SocialLocationNotFoundAction {
  type: string
}

export type SocialLocationsAction =
  | SocialLocationsRetrievedAction
  | SocialLocationRetrievedAction
  | SocialLocationBanCreatedAction
  | FetchingCurrentSocialLocationAction
  | SocialLocationNotFoundAction

export function socialLocationsRetrieved(locations: any): SocialLocationsRetrievedAction {
  return {
    type: LOCATIONS_RETRIEVED,
    locations: locations
  }
}

export function socialLocationRetrieved(location: any): SocialLocationRetrievedAction {
  return {
    type: LOCATION_RETRIEVED,
    location: location
  }
}

export function socialLocationCreated(location: Location): SocialLocationCreatedAction {
  return {
    type: LOCATION_CREATED,
    location: location
  }
}

export function socialLocationPatched(location: Location): SocialLocationCreatedAction {
  return {
    type: LOCATION_PATCHED,
    location: location
  }
}

export function socialLocationRemoved(location: Location): SocialLocationCreatedAction {
  return {
    type: LOCATION_REMOVED,
    location: location
  }
}

export function socialLocationBanCreated(): SocialLocationBanCreatedAction {
  return {
    type: LOCATION_BAN_CREATED
  }
}

export function fetchingCurrentSocialLocation(): FetchingCurrentSocialLocationAction {
  return {
    type: FETCH_CURRENT_LOCATION
  }
}

export function socialLocationNotFound(): SocialLocationNotFoundAction {
  return {
    type: LOCATION_NOT_FOUND
  }
}
