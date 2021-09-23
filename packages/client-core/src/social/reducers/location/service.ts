import { dispatchAlertError } from '../../../common/reducers/alert/AlertService'
import { Dispatch } from 'redux'
import { client } from '../../../feathers'
import {
  fetchingCurrentSocialLocation,
  socialLocationsRetrieved,
  socialLocationRetrieved,
  socialLocationBanCreated,
  socialLocationNotFound
} from './actions'

export function getLocations(skip?: number, limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      const locationResults = await client.service('location').find({
        query: {
          $limit: limit != null ? limit : getState().get('locations').get('limit'),
          $skip: skip != null ? skip : getState().get('locations').get('skip'),
          joinableLocations: true
        }
      })
      dispatch(socialLocationsRetrieved(locationResults))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function getLocation(locationId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(fetchingCurrentSocialLocation())
      const location = await client.service('location').get(locationId)
      dispatch(socialLocationRetrieved(location))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function getLocationByName(locationName: string) {
  return async (dispatch: Dispatch): Promise<any> => {
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
      dispatch(socialLocationRetrieved(locationResult.data[0]))
    } else {
      dispatch(socialLocationNotFound())
    }
  }
}

export async function getLobby() {
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
}

export function banUserFromLocation(userId: string, locationId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('location-ban').create({
        userId: userId,
        locationId: locationId
      })
      dispatch(socialLocationBanCreated())
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}
