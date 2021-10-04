import { Dispatch } from 'redux'
import { client } from '../../../feathers'
import { AlertService } from '../../../common/reducers/alert/AlertService'
import { InviteTypeAction } from './InviteTypeActions'

export const InviteTypeService = {
  retrieveInvites: () => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      dispatch(InviteTypeAction.fetchingInvitesTypes())
      try {
        const inviteTypeResult = await client.service('invite-type').find()
        dispatch(InviteTypeAction.retrievedInvitesTypes(inviteTypeResult))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  }
}
