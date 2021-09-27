import { Dispatch } from 'redux'
import { InstanceAction } from './InstanceActions'
import { client } from '../../../../feathers'
import { AlertService } from '../../../../common/reducers/alert/AlertService'
import Store from '../../../../store'
import { Config } from '@xrengine/common/src/config'
import { accessInstanceState } from './InstanceState'
export const InstanceService = {
  fetchAdminInstances: (incDec?: 'increment' | 'decrement') => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      const skip = accessInstanceState().instances.skip.value
      const limit = accessInstanceState().instances.limit.value
      const user = getState().get('auth').user
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
          dispatch(InstanceAction.instancesRetrievedAction(instances))
        }
      } catch (err) {
        console.error(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  removeInstance: (id: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      const result = await client.service('instance').patch(id, {
        ended: true
      })
      dispatch(InstanceAction.instanceRemovedAction(result))
    }
  }
}

if (!Config.publicRuntimeConfig.offlineMode) {
  client.service('instance').on('removed', (params) => {
    Store.store.dispatch(InstanceAction.instanceRemovedAction(params.instance))
  })
}
