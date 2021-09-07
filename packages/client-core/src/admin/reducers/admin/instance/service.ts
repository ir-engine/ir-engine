import { Dispatch } from 'redux'
import { instancesRetrievedAction, instanceRemoved, instanceRemovedAction } from './actions'
import { client } from '../../../../feathers'
import { dispatchAlertError } from '../../../../common/reducers/alert/service'
import Store from '../../../../store'
import { Config } from '@xrengine/common/src/config'

export function fetchAdminInstances(incDec?: 'increment' | 'decrement') {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    const skip = getState().get('adminInstance').get('instances').get('skip')
    const limit = getState().get('adminInstance').get('instances').get('limit')
    const user = getState().get('auth').get('user')
    try {
      if (user.userRole === 'admin') {
        const instances = await client.service('instance').find({
          query: {
            $sort: {
              createdAt: -1
            },
            $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
            $limit: limit,
            action: 'admin'
          }
        })
        dispatch(instancesRetrievedAction(instances))
      }
    } catch (err) {
      console.error(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function removeInstance(id: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    const result = await client.service('instance').patch(id, {
      ended: true
    })
    dispatch(instanceRemoved(result))
  }
}

if (!Config.publicRuntimeConfig.offlineMode) {
  client.service('instance').on('removed', (params) => {
    Store.store.dispatch(instanceRemovedAction(params.instance))
  })
}
