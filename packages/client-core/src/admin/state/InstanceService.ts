import { store, useDispatch } from '../../store'
import { InstanceAction } from './InstanceActions'
import { client } from '../../feathers'
import { AlertService } from '../../common/state/AlertService'
import { Config } from '@standardcreative/common/src/config'
import { accessInstanceState } from './InstanceState'
import { accessAuthState } from '../../user/state/AuthState'

export const InstanceService = {
  fetchAdminInstances: async (incDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    {
      const skip = accessInstanceState().instances.skip.value
      const limit = accessInstanceState().instances.limit.value
      const user = accessAuthState().user
      try {
        if (user.userRole.value === 'admin') {
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
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  removeInstance: async (id: string) => {
    const dispatch = useDispatch()
    {
      const result = await client.service('instance').patch(id, {
        ended: true
      })
      dispatch(InstanceAction.instanceRemovedAction(result))
    }
  }
}

if (!Config.publicRuntimeConfig.offlineMode) {
  client.service('instance').on('removed', (params) => {
    store.dispatch(InstanceAction.instanceRemovedAction(params.instance))
  })
}
