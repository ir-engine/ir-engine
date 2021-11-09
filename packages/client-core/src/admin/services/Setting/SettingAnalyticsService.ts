import { client } from '../../../feathers'
import { AlertService } from '../../../common/services/AlertService'
import { useDispatch, store } from '../../../store'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { SettingAnalytics } from '@xrengine/common/src/interfaces/SettingAnalytics'
import { SettingAnalyticsResult } from '@xrengine/common/src/interfaces/SettingAnalyticsResult'

//State
const state = createState({
  analytics: [] as Array<SettingAnalytics>,
  updateNeeded: true
})

store.receptors.push((action: SettingAnalyticsActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'SETTING_ANALYIS_DISPLAY':
        return s.merge({ analytics: action.settingAnalyticsResult.data, updateNeeded: false })
    }
  }, action.type)
})

export const accessSettingAnalyticsState = () => state

export const useSettingAnalyticsState = () => useState(state) as any as typeof state

//Service
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

//Action
export const SettingAnalyticsAction = {
  fetchedAnalytics: (settingAnalyticsResult: SettingAnalyticsResult) => {
    return {
      type: 'SETTING_ANALYIS_DISPLAY' as const,
      settingAnalyticsResult: settingAnalyticsResult
    }
  }
}

export type SettingAnalyticsActionType = ReturnType<typeof SettingAnalyticsAction[keyof typeof SettingAnalyticsAction]>
