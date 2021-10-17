import { ServerSettingAction } from './ServerSettingActions'
import { client } from '../../../feathers'
import { AlertService } from '../../../common/state/AlertService'
import { useDispatch } from '../../../store'

export const ServerSettingService = {
  fetchServerSettings: async (inDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    try {
      const server = await client.service('server-setting').find()
      dispatch(ServerSettingAction.fetchedSeverInfo(server))
    } catch (error) {
      console.error(error)
      AlertService.dispatchAlertError(error.message)
    }
  }
}
