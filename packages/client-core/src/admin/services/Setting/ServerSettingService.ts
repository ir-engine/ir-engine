import { Paginated } from '@feathersjs/feathers'

import { PatchServerSetting, ServerSetting } from '@etherealengine/common/src/interfaces/ServerSetting'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { API } from '../../../API'
import { NotificationService } from '../../../common/services/NotificationService'

export const AdminServerSettingsState = defineState({
  name: 'AdminServerSettingsState',
  initial: () => ({
    server: [] as Array<ServerSetting>,
    updateNeeded: true
  })
})

const fetchedSeverInfoReceptor = (action: typeof AdminServerSettingActions.fetchedSeverInfo.matches._TYPE) => {
  const state = getMutableState(AdminServerSettingsState)
  return state.merge({ server: action.serverSettings.data, updateNeeded: false })
}

const serverSettingPatchedReceptor = (action: typeof AdminServerSettingActions.serverSettingPatched.matches._TYPE) => {
  const state = getMutableState(AdminServerSettingsState)
  return state.updateNeeded.set(true)
}

export const ServerSettingReceptors = {
  fetchedSeverInfoReceptor,
  serverSettingPatchedReceptor
}

export const ServerSettingService = {
  fetchServerSettings: async (inDec?: 'increment' | 'decrement') => {
    try {
      const serverSettings = (await API.instance.client.service('server-setting').find()) as Paginated<ServerSetting>
      dispatchAction(AdminServerSettingActions.fetchedSeverInfo({ serverSettings }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  patchServerSetting: async (data: PatchServerSetting, id: string) => {
    try {
      await API.instance.client.service('server-setting').patch(id, data)
      dispatchAction(AdminServerSettingActions.serverSettingPatched({}))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export class AdminServerSettingActions {
  static fetchedSeverInfo = defineAction({
    type: 'ee.client.AdminServerSetting.SETTING_SERVER_DISPLAY' as const,
    serverSettings: matches.object as Validator<unknown, Paginated<ServerSetting>>
  })
  static serverSettingPatched = defineAction({
    type: 'ee.client.AdminServerSetting.SERVER_SETTING_PATCHED' as const
  })
}
