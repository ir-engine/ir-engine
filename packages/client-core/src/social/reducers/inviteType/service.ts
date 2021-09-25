import { Dispatch } from 'redux'
import { client } from '../../../feathers'
import { AlertService } from '../../../common/reducers/alert/AlertService'
import { fetchingInvitesTypes, retrievedInvitesTypes } from './actions'

export function retrieveInvites() {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    dispatch(fetchingInvitesTypes())
    try {
      const inviteTypeResult = await client.service('invite-type').find()
      dispatch(retrievedInvitesTypes(inviteTypeResult))
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}
