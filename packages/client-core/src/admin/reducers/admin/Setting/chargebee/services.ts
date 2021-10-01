import { Dispatch } from 'redux'
import { fetchedChargebee } from './actions'
import { client } from '../../../../../feathers'
import { AlertService } from '../../../../../common/reducers/alert/AlertService'

export function fetchChargeBee() {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const chargeBee = await client.service('chargebee-setting').find()
      dispatch(fetchedChargebee(chargeBee))
    } catch (err) {
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}
