import { store, useDispatch } from '../../store'
import { client } from '../../feathers'
import { AlertService } from '../../common/state/AlertService'
import { InviteTypeAction } from './InviteTypeActions'

export const InviteTypeService = {
  retrieveInvites: async () => {
    const dispatch = useDispatch()
    {
      dispatch(InviteTypeAction.fetchingInvitesTypes())
      try {
        const inviteTypeResult = await client.service('invite-type').find()
        dispatch(InviteTypeAction.retrievedInvitesTypes(inviteTypeResult))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  }
}
