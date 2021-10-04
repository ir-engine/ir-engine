import { Dispatch } from 'redux'
import { SettingAnalyticsAction } from './SettingAnalyticsActions'
import { client } from '../../../../../feathers'
import { AlertService } from '../../../../../common/reducers/alert/AlertService'

export const SettingAnalyticsService = {
  fetchSettingsAnalytics: (inDec?: 'increment' | 'decrement') => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      try {
        const analytics = await client.service('analytics-setting').find()
        dispatch(SettingAnalyticsAction.fetchedAnalytics(analytics))
      } catch (error) {
        console.error(error.message)
        AlertService.dispatchAlertError(dispatch, error.message)
      }
    }
  }
}
