import { PartyAction } from './PartActions'
import { Dispatch } from 'redux'
import { client } from '../../../../feathers'
import { AlertService } from '../../../../common/reducers/alert/AlertService'
import { accessPartyState } from './PartyState'
import { accessAuthState } from '../../../../user/reducers/auth/AuthState'
export const PartyService = {
  createAdminParty: (data) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const result = await client.service('party').create(data)
        dispatch(PartyAction.partyAdminCreated(result))
      } catch (err) {
        console.error(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  fetchAdminParty: (incDec?: 'increment' | 'decrement') => {
    return async (dispatch: Dispatch): Promise<any> => {
      const user = accessAuthState().user
      const adminParty = accessPartyState()
      const skip = adminParty.parties.skip.value
      const limit = adminParty.parties.limit.value
      try {
        if (user.userRole.value === 'admin') {
          const parties = await client.service('party').find({
            query: {
              $sort: {
                createdAt: -1
              },
              $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
              $limit: limit
            }
          })
          dispatch(PartyAction.partyRetrievedAction(parties))
        }
      } catch (err) {
        console.error(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  }
}
