import { Dispatch } from 'redux'
import { client } from '../../../../feathers'
import { addAdminScope, fetchingScope, setAdminScope } from './actions'
import { dispatchAlertError } from '../../../../common/reducers/alert/service'

export function createScope(scopeItem: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      console.log(scopeItem)
      const newItem = await client.service('scope').create({
        ...scopeItem
      })
      dispatch(addAdminScope(newItem))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function getScopeService(type?: string, limit: Number = 12) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(fetchingScope())
      const list = await client.service('scope').find({
        query: {
          action: type,
          $limit: limit
        }
      })
      console.log(list)
      dispatch(setAdminScope(list))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}
