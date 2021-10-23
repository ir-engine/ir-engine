import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { Location, LocationSeed } from '@xrengine/common/src/interfaces/Location'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { store } from '../../store'

import { LocationActionType } from './LocationActions'

const state = createState({
  locations: {
    locations: [] as Location[],
    total: 0,
    limit: 10,
    skip: 0
  },
  currentLocation: {
    location: LocationSeed as Location,
    bannedUsers: [] as UserId[]
  },
  updateNeeded: true,
  currentLocationUpdateNeeded: true,
  fetchingCurrentLocation: false,
  invalidLocation: false
})

store.receptors.push((action: LocationActionType): any => {
  let newValues, updateMap
  state.batch((s) => {
    switch (action.type) {
      case 'LOCATIONS_RETRIEVED':
        newValues = action.locations

        if (s.locations.locations == null || s.updateNeeded.value === true) {
          s.locations.locations.set(newValues.data)
        } else {
          s.locations.locations.set([...s.locations.locations.value, ...newValues.data])
        }

        s.locations.skip.set(newValues.skip)
        s.locations.limit.set(newValues.limit)
        s.locations.total.set(newValues.total)
        return s.updateNeeded.set(false)

      case 'FETCH_CURRENT_LOCATION':
        return s.fetchingCurrentLocation.set(true)

      case 'LOCATION_RETRIEVED':
        newValues = action.location
        newValues.locationSettings = newValues.location_setting

        let bannedUsers = [] as UserId[]
        newValues?.location_bans?.forEach((ban) => {
          bannedUsers.push(ban.userId)
        })
        bannedUsers = [...new Set(bannedUsers)]

        s.currentLocation.location.set(newValues)
        s.currentLocation.bannedUsers.set(bannedUsers)
        s.currentLocationUpdateNeeded.set(false)
        return s.fetchingCurrentLocation.set(false)

      case 'LOCATION_NOT_FOUND':
        s.currentLocation.merge({ location: LocationSeed, bannedUsers: [] })
        s.currentLocationUpdateNeeded.set(false)
        s.fetchingCurrentLocation.set(false)
        return s.invalidLocation.set(true)

      case 'LOCATION_BAN_CREATED':
        return s.currentLocationUpdateNeeded.set(true)
    }
  }, action.type)
})

export const accessLocationState = () => state

export const useLocationState = () => useState(state) as any as typeof state
