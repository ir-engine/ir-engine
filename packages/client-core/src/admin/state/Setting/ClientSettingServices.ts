import { ClientSettingAction } from './ClientSettingActions'
import { client } from '../../../feathers'
import { AlertService } from '../../../common/state/AlertService'
import { useDispatch } from '../../../store'

export const ClientSettingService = {
  fetchedClientSettings: async (inDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    try {
      const clientSettings = await client.service('client-setting').find()
      dispatch(ClientSettingAction.fetchedClient(clientSettings))
    } catch (error) {
      console.error(error.message)
      AlertService.dispatchAlertError(error.message)
    }
  }
}
