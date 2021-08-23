import { Dispatch } from 'redux'
import { instancesRetrievedAction, instanceRemoved, instanceRemovedAction } from './actions'
import { client } from '../../../../feathers'
import { dispatchAlertError } from '../../../../common/reducers/alert/service'
import { Config } from '../../../../helper'
import Store from '../../../../store'

export function fetchAdminInstances() {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    const user = getState().get('auth').get('user')
    try {
      if (user.userRole === 'admin') {
        const instances = await client.service('instance').find({
          query: {
            $sort: {
              createdAt: -1
            },
            $skip: getState().get('adminUser').get('users').get('skip'),
            $limit: getState().get('adminUser').get('users').get('limit'),
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
    const result = await client.service('instance').remove(id)
    dispatch(instanceRemoved(result))
  }
}

if (!Config.publicRuntimeConfig.offlineMode) {
  client.service('instance').on('removed', (params) => {
    Store.store.dispatch(instanceRemovedAction(params.instance))
  })
}
