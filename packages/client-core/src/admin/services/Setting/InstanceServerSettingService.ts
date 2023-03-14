import { Paginated } from '@feathersjs/feathers'

import { InstanceServerSetting } from '@etherealengine/common/src/interfaces/InstanceServerSetting'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getMutableState, useState } from '@etherealengine/hyperflux'

import { API } from '../../../API'
import { NotificationService } from '../../../common/services/NotificationService'

const AdminInstanceServerSettingsState = defineState({
  name: 'AdminInstanceServerSettingsState',
  initial: () => ({
    instanceserver: [] as Array<InstanceServerSetting>,
    updateNeeded: true
  })
})

const fetchedInstanceServerReceptor = (
  action: typeof InstanceServerSettingActions.fetchedInstanceServer.matches._TYPE
) => {
  const state = getMutableState(AdminInstanceServerSettingsState)
  return state.merge({ instanceserver: action.instanceServerSettings.data, updateNeeded: false })
}

export const AdminInstanceServerReceptors = {
  fetchedInstanceServerReceptor
}
/**@deprecated use getMutableState directly instead */
export const accessInstanceServerSettingState = () => getMutableState(AdminInstanceServerSettingsState)
/**@deprecated use useHookstate(getMutableState(...) directly instead */
export const useInstanceServerSettingState = () => useState(accessInstanceServerSettingState())

export const InstanceServerSettingService = {
  fetchedInstanceServerSettings: async (inDec?: 'increment' | 'decrement') => {
    try {
      const instanceServerSettings = (await API.instance.client
        .service('instance-server-setting')
        .find()) as Paginated<InstanceServerSetting>
      dispatchAction(InstanceServerSettingActions.fetchedInstanceServer({ instanceServerSettings }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export class InstanceServerSettingActions {
  static fetchedInstanceServer = defineAction({
    type: 'xre.client.InstanceServerSetting.INSTANCE_SERVER_SETTING_DISPLAY',
    instanceServerSettings: matches.object as Validator<unknown, Paginated<InstanceServerSetting>>
  })
}
