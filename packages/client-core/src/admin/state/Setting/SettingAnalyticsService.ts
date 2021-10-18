import { SettingAnalyticsAction } from './SettingAnalyticsActions'
import { client } from '../../../feathers'
import { AlertService } from '../../../common/state/AlertService'
import { useDispatch } from '../../../store'

export const SettingAnalyticsService = {
  fetchSettingsAnalytics: async (inDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    try {
      const analytics = await client.service('analytics-setting').find()
      dispatch(SettingAnalyticsAction.fetchedAnalytics(analytics))
    } catch (error) {
      console.error(error.message)
      AlertService.dispatchAlertError(error.message)
    }
  }
}
