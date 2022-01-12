import { client } from '../../../feathers'
import { AlertService } from '../../../common/services/AlertService'
import { useDispatch, store } from '../../../store'
import { AdminAuthSettingResult } from '@xrengine/common/src/interfaces/AdminAuthSettingResult'
import { createState, useState } from '@hookstate/core'
import { AdminAuthSetting } from '@xrengine/common/src/interfaces/AdminAuthSetting'
import waitForClientAuthenticated from '../../../util/wait-for-client-authenticated'

//State
const state = createState({
  authSettings: [] as Array<AdminAuthSetting>,
  skip: 0,
  limit: 100,
  total: 0,
  retrieving: false,
  fetched: false,
  updateNeeded: true
})

store.receptors.push((action: AuthSettingActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'ADMIN_AUTH_SETTING_FETCHED':
        return s.merge({
          authSettings: action.adminAuthSettingResult.data,
          skip: action.adminAuthSettingResult.skip,
          limit: action.adminAuthSettingResult.limit,
          total: action.adminAuthSettingResult.total,
          updateNeeded: false
        })
      case 'ADMIN_AUTH_SETTING_PATCHED':
        return s.updateNeeded.set(true)
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
        await waitForClientAuthenticated()
        const authSetting = await client.service('authentication-setting').find()
        dispatch(AuthSettingAction.authSettingRetrieved(authSetting))
      } catch (err) {
        AlertService.dispatchAlertError(err)
      }
    }
  },
  patchAuthSetting: async (data: any, id: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('authentication-setting').patch(id, data)
        dispatch(AuthSettingAction.authSettingPatched())
      } catch (err) {
        AlertService.dispatchAlertError(err)
      }
    }
  }
}

//Action
export const AuthSettingAction = {
  authSettingRetrieved: (adminAuthSettingResult: AdminAuthSettingResult) => {
    return {
      type: 'ADMIN_AUTH_SETTING_FETCHED' as const,
      adminAuthSettingResult: adminAuthSettingResult
    }
  },
  authSettingPatched: () => {
    return {
      type: 'ADMIN_AUTH_SETTING_PATCHED' as const
    }
  }
}

export type AuthSettingActionType = ReturnType<typeof AuthSettingAction[keyof typeof AuthSettingAction]>
