import { partyAdminCreated, partyRetrievedAction } from './actions'
import { Dispatch } from 'redux'
import { client } from '../../../../feathers'
import { dispatchAlertError } from '../../../../common/reducers/alert/AlertService'

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

export const fetchAdminParty = (incDec?: 'increment' | 'decrement') => {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    const user = getState().get('auth').user
    const skip = getState().get('adminParty').get('parties').get('skip')
    const limit = getState().get('adminParty').get('parties').get('limit')
    try {
      if (user.userRole === 'admin') {
        const parties = await client.service('party').find({
          query: {
            $sort: {
              createdAt: -1
            },
            $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
            $limit: limit
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
