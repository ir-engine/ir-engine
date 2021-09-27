export const LocationAction = {
  locationsRetrieved: (locations: any) => {
    return {
      type: 'ADMIN_LOCATIONS_RETRIEVED' as const,
      locations: locations
    }
  },
  locationRetrieved: (location: any) => {
    return {
      type: 'ADMIN_LOCATION_RETRIEVED' as const,
      location: location
    }
  },
  locationCreated: (location: Location) => {
    return {
      type: 'ADMIN_LOCATION_CREATED' as const,
      location: location
    }
  },
  locationPatched: (location: Location) => {
    return {
      type: 'ADMIN_LOCATION_PATCHED' as const,
      location: location
    }
  },
  locationRemoved: (location: Location) => {
    return {
      type: 'ADMIN_LOCATION_REMOVED' as const,
      location: location
    }
  },
  locationBanCreated: () => {
    return {
      type: 'ADMIN_LOCATION_BAN_CREATED' as const
    }
  },
  fetchingCurrentLocation: () => {
    return {
      type: 'ADMIN_FETCH_CURRENT_LOCATION' as const
    }
  },
  locationNotFound: () => {
    return {
      type: 'ADMIN_LOCATION_NOT_FOUND' as const
    }
  },
  locationTypesRetrieved: (data: any) => {
    return {
      type: 'ADMIN_LOCATION_TYPES_RETRIEVED' as const,
      types: data
    }
  }
}

export type LocationActionType = ReturnType<typeof LocationAction[keyof typeof LocationAction]>
