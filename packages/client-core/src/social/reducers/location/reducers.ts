import Immutable from 'immutable'
import { LocationsAction, LocationsRetrievedAction, LocationRetrievedAction } from './actions'

import {
  FETCH_CURRENT_LOCATION,
  LOCATIONS_RETRIEVED,
  LOCATION_RETRIEVED,
  LOCATION_BAN_CREATED,
  LOCATION_NOT_FOUND
} from '../actions'

export const initialLocationState = {
  locations: {
    locations: [],
    total: 0,
    limit: 10,
    skip: 0
  },
  currentLocation: {
    location: {},
    bannedUsers: []
  },
  updateNeeded: true,
  currentLocationUpdateNeeded: true,
  fetchingCurrentLocation: false,
  invalidLocation: false
}

const immutableState = Immutable.fromJS(initialLocationState)

const locationReducer = (state = immutableState, action: LocationsAction): any => {
  let newValues, updateMap, existingLocations
  switch (action.type) {
    case LOCATIONS_RETRIEVED:
      newValues = (action as LocationsRetrievedAction).locations
      updateMap = new Map()
      existingLocations = state.get('locations').get('locations')
      updateMap.set(
        'locations',
        existingLocations.size != null || state.get('updateNeeded') === true
          ? newValues.data
          : existingLocations.concat(newValues.data)
      )
      updateMap.set('skip', newValues.skip)
      updateMap.set('limit', newValues.limit)
      updateMap.set('total', newValues.total)
      return state.set('locations', updateMap).set('updateNeeded', false)

    case FETCH_CURRENT_LOCATION:
      return state.set('fetchingCurrentLocation', true)

    case LOCATION_RETRIEVED:
      newValues = (action as LocationRetrievedAction).location
      updateMap = new Map()
      newValues.locationSettings = newValues.location_setting
      delete newValues.location_setting
      updateMap.set('location', newValues)
      let bannedUsers = []
      newValues.location_bans?.forEach((ban) => {
        bannedUsers.push(ban.userId)
      })
      bannedUsers = [...new Set(bannedUsers)]
      updateMap.set('bannedUsers', bannedUsers)
      return state
        .set('currentLocation', updateMap)
        .set('currentLocationUpdateNeeded', false)
        .set('fetchingCurrentLocation', false)

    case LOCATION_NOT_FOUND:
      updateMap = new Map()
      updateMap.set('location', {})
      updateMap.set('bannedUsers', [])
      return state
        .set('currentLocation', updateMap)
        .set('currentLocationUpdateNeeded', false)
        .set('fetchingCurrentLocation', false)
        .set('invalidLocation', true)

    case LOCATION_BAN_CREATED:
      return state.set('currentLocationUpdateNeeded', true)
  }

  return state
}

export default locationReducer
