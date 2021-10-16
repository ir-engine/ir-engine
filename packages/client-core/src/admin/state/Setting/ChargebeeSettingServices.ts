import { ChargebeeSettingAction } from './ChargebeeSettingActions'
import { client } from '../../../feathers'
import { AlertService } from '../../../common/state/AlertService'
import { useDispatch } from '../../../store'

export const ChargebeeSettingService = {
  fetchChargeBee: async () => {
    const dispatch = useDispatch()
    {
      try {
        const chargeBee = await client.service('chargebee-setting').find()
        dispatch(ChargebeeSettingAction.fetchedChargebee(chargeBee))
      } catch (err) {
        AlertService.dispatchAlertError(err.message)
      }
    }
  }
}
