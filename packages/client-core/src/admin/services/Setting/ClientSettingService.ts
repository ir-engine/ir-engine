import { Paginated } from '@feathersjs/feathers'

import { ClientSetting, PatchClientSetting } from '@xrengine/common/src/interfaces/ClientSetting'
import multiLogger from '@xrengine/common/src/logger'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../../API'
import { NotificationService } from '../../../common/services/NotificationService'
import waitForClientAuthenticated from '../../../util/wait-for-client-authenticated'

const logger = multiLogger.child({ component: 'client-core:ClientSettingService' })

const AdminClientSettingsState = defineState({
  name: 'AdminClientSettingsState',
  initial: () => ({
    client: [] as Array<ClientSetting>,
    updateNeeded: true
  })
})

export const ClientSettingsServiceReceptor = (action) => {
  const s = getState(AdminClientSettingsState)
  matches(action)
    .when(ClientSettingActions.fetchedClient.matches, (action) => {
      return s.merge({ client: action.clientSettings.data, updateNeeded: false })
    })
    .when(ClientSettingActions.clientSettingPatched.matches, (action) => {
      return s.updateNeeded.set(true)
    })
}

// const fetchedClientReceptor = (action: typeof ClientSettingActions.fetchedClient.matches._TYPE) => {
//   const state = getState(AdminClientSettingsState)
//   return state.merge({ client: action.clientSettings.data, updateNeeded: false })
// }

// const clientSettingPatchedReceptor = (action: typeof ClientSettingActions.clientSettingPatched.matches._TYPE) => {
//   const state = getState(AdminClientSettingsState)
//   return state.updateNeeded.set(true)
// }

// export const ClientSettingReceptors = {
//   fetchedClientReceptor,
//   clientSettingPatchedReceptor
// }

export const accessClientSettingState = () => getState(AdminClientSettingsState)

export const useClientSettingState = () => useState(accessClientSettingState())

export const ClientSettingService = {
  fetchClientSettings: async (inDec?: 'increment' | 'decrement') => {
    try {
      logger.info('waitingForClientAuthenticated')
      await waitForClientAuthenticated()
      logger.info('CLIENT AUTHENTICATED!')
      const clientSettings = (await API.instance.client.service('client-setting').find()) as Paginated<ClientSetting>
      logger.info('Dispatching fetchedClient')
      dispatchAction(ClientSettingActions.fetchedClient({ clientSettings }))
    } catch (err) {
      logger.error(err)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  patchClientSetting: async (data: PatchClientSetting, id: string) => {
    try {
      await API.instance.client.service('client-setting').patch(id, data)
      dispatchAction(ClientSettingActions.clientSettingPatched({}))
    } catch (err) {
      logger.error(err)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export class ClientSettingActions {
  static fetchedClient = defineAction({
    type: 'xre.client.AdminClientSetting.CLIENT_SETTING_DISPLAY' as const,
    clientSettings: matches.object as Validator<unknown, Paginated<ClientSetting>>
  })
  static clientSettingPatched = defineAction({
    type: 'xre.client.AdminClientSetting.CLIENT_SETTING_PATCHED' as const
  })
}
