import { Paginated } from '@feathersjs/feathers'

import { PatchServerSetting, ServerSetting } from '@xrengine/common/src/interfaces/ServerSetting'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../../API'
import { NotificationService } from '../../../common/services/NotificationService'

const AdminServerSettingsState = defineState({
  name: 'AdminServerSettingsState',
  initial: () => ({
    server: [] as Array<ServerSetting>,
    updateNeeded: true
  })
})

export const AdminServerSettingsServiceReceptor = (action) => {
  getState(AdminServerSettingsState).batch((s) => {
    matches(action)
      .when(AdminServerSettingActions.fetchedSeverInfo.matches, (action) => {
        return s.merge({ server: action.serverSettings.data, updateNeeded: false })
      })
      .when(AdminServerSettingActions.serverSettingPatched.matches, (action) => {
        return s.updateNeeded.set(true)
      })
  })
}

export const accessServerSettingState = () => getState(AdminServerSettingsState)

export const useServerSettingState = () => useState(accessServerSettingState())

export const ServerSettingService = {
  fetchServerSettings: async (inDec?: 'increment' | 'decrement') => {
    try {
      const serverSettings = (await API.instance.client.service('server-setting').find()) as Paginated<ServerSetting>
      dispatchAction(AdminServerSettingActions.fetchedSeverInfo({ serverSettings }))
    } catch (err) {
      console.log(err)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  patchServerSetting: async (data: PatchServerSetting, id: string) => {
    try {
      await API.instance.client.service('server-setting').patch(id, data)
      dispatchAction(AdminServerSettingActions.serverSettingPatched())
    } catch (err) {
      console.log(err)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export class AdminServerSettingActions {
  static fetchedSeverInfo = defineAction({
    type: 'SETTING_SERVER_DISPLAY' as const,
    serverSettings: matches.object as Validator<unknown, Paginated<ServerSetting>>
  })
  static serverSettingPatched = defineAction({
    type: 'SERVER_SETTING_PATCHED' as const
  })
}
