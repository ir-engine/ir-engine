import { Dispatch } from 'redux'
import { LocationAction } from './LocationActions'
import { AlertService } from '../../../../common/reducers/alert/AlertService'
import { ErrorAction } from '../../../../common/reducers/error/ErrorActions'
import { client } from '../../../../feathers'
import { accessLocationState } from './LocationState'

export const LocationService = {
  fetchLocationTypes: () => {
    return async (dispatch: Dispatch): Promise<any> => {
      const locationTypes = await client.service('location-type').find()
      dispatch(LocationAction.locationTypesRetrieved(locationTypes))
    }
  },
  patchLocation: (id: string, location: any) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const result = await client.service('location').patch(id, location)
        dispatch(LocationAction.locationPatched(result))
      } catch (err) {
        console.error(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  removeLocation: (id: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      const result = await client.service('location').remove(id)
      dispatch(LocationAction.locationRemoved(result))
    }
  },
  createLocation: (location: any) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const result = await client.service('location').create(location)
        dispatch(LocationAction.locationCreated(result))
      } catch (err) {
        console.error(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  fetchAdminLocations: (incDec?: 'increment' | 'decrement') => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const locations = await client.service('location').find({
          query: {
            $sort: {
              name: 1
            },
            $skip: accessLocationState().locations.skip.value,
            $limit: accessLocationState().locations.limit.value,
            adminnedLocations: true
          }
        })
        dispatch(LocationAction.locationsRetrieved(locations))
      } catch (error) {
        console.error(error)
        dispatch(ErrorAction.setReadScopeError(error.message, error.statusCode))
      }
    }
  }
}
