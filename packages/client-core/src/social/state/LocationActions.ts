import { Location } from '@xrengine/common/src/interfaces/Location'
import { LocationResult } from '@xrengine/common/src/interfaces/LocationResult'
export const LocationAction = {
  socialLocationsRetrieved: (locations: LocationResult) => {
    return {
      type: 'LOCATIONS_RETRIEVED' as const,
      locations: locations
    }
  },
  socialLocationRetrieved: (location: Location) => {
    return {
      type: 'LOCATION_RETRIEVED' as const,
      location: location
    }
  },
  socialLocationCreated: (location: Location) => {
    return {
      type: 'LOCATION_CREATED' as const,
      location: location
    }
  },
  socialLocationPatched: (location: Location) => {
    return {
      type: 'LOCATION_PATCHED' as const,
      location: location
    }
  },
  socialLocationRemoved: (location: Location) => {
    return {
      type: 'LOCATION_REMOVED' as const,
      location: location
    }
  },
  socialLocationBanCreated: () => {
    return {
      type: 'LOCATION_BAN_CREATED' as const
    }
  },
  fetchingCurrentSocialLocation: () => {
    return {
      type: 'FETCH_CURRENT_LOCATION' as const
    }
  },
  socialLocationNotFound: () => {
    return {
      type: 'LOCATION_NOT_FOUND' as const
    }
  }
}

export type LocationActionType = ReturnType<typeof LocationAction[keyof typeof LocationAction]>
