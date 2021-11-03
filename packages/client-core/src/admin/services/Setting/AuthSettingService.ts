import { client } from '../../../feathers'
import { AlertService } from '../../../common/services/AlertService'
import { useDispatch, store } from '../../../store'
import { AdminRedisSettingResult } from '@xrengine/common/src/interfaces/AdminAuthSettingResult'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { AdminAuthSetting } from '@xrengine/common/src/interfaces/AdminAuthSetting'

//State
const state = createState({
  authSettings: {
    authSettings: [] as Array<AdminAuthSetting>,
    skip: 0,
    limit: 100,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true
  }
})

store.receptors.push((action: AuthSettingActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'ADMIN_AUTH_SETTING_FETCHED':
        return s.merge({
          authSettings: {
            ...s.authSettings.value,
            authSettings: action.adminRedisSettingResult.data,
            skip: action.adminRedisSettingResult.skip,
            limit: action.adminRedisSettingResult.limit,
            total: action.adminRedisSettingResult.total,
            updateNeeded: false
          }
        })
      case 'ADMIN_AUTH_SETTING_PATCHED':
        return s.merge({
          authSettings: {
            ...s.authSettings.value,
            updateNeeded: true
          }
        })
    }
  }, action.type)
})

export const accessAdminAuthSettingState = () => state

export const useAdminAuthSettingState = () => useState(state) as any as typeof state

//Service
export const AuthSettingService = {
  fetchAuthSetting: async () => {
    const dispatch = useDispatch()
    {
      try {
        const authSetting = await client.service('authentication-setting').find()
        dispatch(AuthSettingAction.authSettingRetrieved(authSetting))
      } catch (err) {
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  pathAuthSetting: async (data: any, id: string) => {
    const dispatch = useDispatch()
    {
      try {
        const result = await client.service('authentication-setting').patch(id, data)
        dispatch(AuthSettingAction.authSettingPatched(result))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  }
}

//Action
export const AuthSettingAction = {
  authSettingRetrieved: (adminRedisSettingResult: AdminRedisSettingResult) => {
    return {
      type: 'ADMIN_AUTH_SETTING_FETCHED' as const,
      adminRedisSettingResult: adminRedisSettingResult
    }
  },
  authSettingPatched: (data: AdminRedisSettingResult) => {
    return {
      type: 'ADMIN_AUTH_SETTING_PATCHED' as const
    }
  }
}

export type AuthSettingActionType = ReturnType<typeof AuthSettingAction[keyof typeof AuthSettingAction]>
