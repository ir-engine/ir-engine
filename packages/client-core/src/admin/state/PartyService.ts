import { PartyAction } from './PartActions'
import { store, useDispatch } from '../../store'
import { client } from '../../feathers'
import { AlertService } from '../../common/state/AlertService'
import { accessPartyState } from './PartyState'
import { accessAuthState } from '../../user/state/AuthState'
export const PartyService = {
  createAdminParty: async (data) => {
    const dispatch = useDispatch()
    {
      try {
        const result = await client.service('party').create(data)
        dispatch(PartyAction.partyAdminCreated(result))
      } catch (err) {
        console.error(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  fetchAdminParty: async (incDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    {
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
        AlertService.dispatchAlertError(err.message)
      }
    }
  }
}
