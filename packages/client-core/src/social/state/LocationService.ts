import { AlertService } from '../../common/state/AlertService'
import { store, useDispatch } from '../../store'
import { client } from '../../feathers'
import { accessLocationState } from './LocationState'
import { LocationAction } from './LocationActions'
import waitForClientAuthenticated from '../../util/wait-for-client-authenticated'

export const LocationService = {
  getLocations: async (skip?: number, limit?: number) => {
    const dispatch = useDispatch()
    {
      try {
        const locationState = accessLocationState()
        await waitForClientAuthenticated()
        const locationResults = await client.service('location').find({
          query: {
            $limit: limit != null ? limit : locationState.locations.limit.value,
            $skip: skip != null ? skip : locationState.locations.skip.value,
            joinableLocations: true
          }
        })
        dispatch(LocationAction.socialLocationsRetrieved(locationResults))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  getLocation: async (locationId: string) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(LocationAction.fetchingCurrentSocialLocation())
        const location = await client.service('location').get(locationId)
        dispatch(LocationAction.socialLocationRetrieved(location))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  getLocationByName: async (locationName: string) => {
    const dispatch = useDispatch()
    {
      const locationResult = await client
        .service('location')
        .find({
          query: {
            slugifiedName: locationName,
            joinableLocations: true
          }
        })
        .catch((error) => {
          console.log("Couldn't get location by name", error)
        })
      if (locationResult && locationResult.total > 0) {
        dispatch(LocationAction.socialLocationRetrieved(locationResult.data[0]))
      } else {
        dispatch(LocationAction.socialLocationNotFound())
      }
    }
  },
  getLobby: async () => {
    const lobbyResult = await client
      .service('location')
      .find({
        query: {
          isLobby: true,
          $limit: 1
        }
      })
      .catch((error) => {
        console.log("Couldn't get Lobby", error)
      })

    if (lobbyResult && lobbyResult.total > 0) {
      return lobbyResult.data[0]
    }
  },
  banUserFromLocation: async (userId: string, locationId: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('location-ban').create({
          userId: userId,
          locationId: locationId
        })
        dispatch(LocationAction.socialLocationBanCreated())
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  }
}
