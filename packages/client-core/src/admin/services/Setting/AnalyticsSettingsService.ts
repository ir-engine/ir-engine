import { Paginated } from '@feathersjs/feathers'

import { SettingAnalytics } from '@xrengine/common/src/interfaces/SettingAnalytics'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../../API'
import { NotificationService } from '../../../common/services/NotificationService'

const AdminAnalyticsSettingsState = defineState({
  name: 'AdminAnalyticsSettingsState',
  initial: () => ({
    analytics: [] as Array<SettingAnalytics>,
    updateNeeded: true
  })
})

const fetchedAnalyticsReceptor = (action: typeof AdminAnalyticsSettingActions.fetchedAnalytics.matches._TYPE) => {
  const state = getState(AdminAnalyticsSettingsState)
  return state.merge({ analytics: action.analyticsSettings.data, updateNeeded: false })
}

export const AnalyticsSettingReceptors = {
  fetchedAnalyticsReceptor
}

export const accessSettingAnalyticsState = () => getState(AdminAnalyticsSettingsState)
export const useSettingAnalyticsState = () => useState(accessSettingAnalyticsState())

export const AdminSettingAnalyticsService = {
  fetchSettingsAnalytics: async (inDec?: 'increment' | 'decrement') => {
    try {
      const analyticsSettings = (await API.instance.client
        .service('analytics-setting')
        .find()) as Paginated<SettingAnalytics>
      dispatchAction(AdminAnalyticsSettingActions.fetchedAnalytics({ analyticsSettings }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export class AdminAnalyticsSettingActions {
  static fetchedAnalytics = defineAction({
    type: 'xre.client.AdminAnalyticsSetting.SETTING_ANALYIS_DISPLAY' as const,
    analyticsSettings: matches.object as Validator<unknown, Paginated<SettingAnalytics>>
  })
}
