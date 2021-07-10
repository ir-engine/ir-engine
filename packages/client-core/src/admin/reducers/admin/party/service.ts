import { partyAdminCreated, partyRetrievedAction } from './actions'
import { Dispatch } from 'redux'
import { client } from '../../../../feathers'
import { dispatchAlertError } from '../../../../common/reducers/alert/service'

export const createAdminParty = (data) => {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const result = await client.service('party').create(data)
      dispatch(partyAdminCreated(result))
    } catch (err) {
      console.error(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export const fetchAdminParty = () => {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    const user = getState().get('auth').get('user')
    try {
      if (user.userRole === 'admin') {
        const parties = await client.service('party').find({
          query: {
            $sort: {
              createdAt: -1
            },
            $skip: getState().get('adminUser').get('users').get('skip'),
            $limit: getState().get('adminUser').get('users').get('limit')
          }
        })
        dispatch(partyRetrievedAction(parties))
      }
    } catch (err) {
      console.error(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}
