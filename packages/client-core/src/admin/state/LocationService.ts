import { store, useDispatch } from '../../store'
import { LocationAction } from './LocationActions'
import { AlertService } from '../../common/state/AlertService'
import { ErrorAction } from '../../common/state/ErrorActions'
import { client } from '../../feathers'
import { accessLocationState } from './LocationState'

export const LocationService = {
  fetchLocationTypes: async () => {
    const dispatch = useDispatch()
    {
      const locationTypes = await client.service('location-type').find()
      dispatch(LocationAction.locationTypesRetrieved(locationTypes))
    }
  },
  patchLocation: async (id: string, location: any) => {
    const dispatch = useDispatch()
    {
      try {
        const result = await client.service('location').patch(id, location)
        dispatch(LocationAction.locationPatched(result))
      } catch (err) {
        console.error(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  removeLocation: async (id: string) => {
    const dispatch = useDispatch()
    {
      const result = await client.service('location').remove(id)
      dispatch(LocationAction.locationRemoved(result))
    }
  },
  createLocation: async (location: any) => {
    const dispatch = useDispatch()
    {
      try {
        const result = await client.service('location').create(location)
        dispatch(LocationAction.locationCreated(result))
      } catch (err) {
        console.error(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  fetchAdminLocations: async (incDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    {
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
