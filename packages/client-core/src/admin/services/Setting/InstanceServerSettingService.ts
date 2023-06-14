import { Paginated } from '@feathersjs/feathers'

import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import {
  instanceServerSettingPath,
  InstanceServerSettingType
} from '@etherealengine/engine/src/schemas/setting/instance-server-setting.schema'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { API } from '../../../API'
import { NotificationService } from '../../../common/services/NotificationService'

export const AdminInstanceServerSettingsState = defineState({
  name: 'AdminInstanceServerSettingsState',
  initial: () => ({
    instanceServer: [] as Array<InstanceServerSettingType>,
    updateNeeded: true
  })
})

const fetchedInstanceServerReceptor = (
  action: typeof InstanceServerSettingActions.fetchedInstanceServer.matches._TYPE
) => {
  const state = getMutableState(AdminInstanceServerSettingsState)
  return state.merge({ instanceServer: action.instanceServerSettings.data, updateNeeded: false })
}

export const AdminInstanceServerReceptors = {
  fetchedInstanceServerReceptor
}

export const InstanceServerSettingService = {
  fetchedInstanceServerSettings: async (inDec?: 'increment' | 'decrement') => {
    try {
      const instanceServerSettings = (await API.instance.client
        .service(instanceServerSettingPath)
        .find()) as Paginated<InstanceServerSettingType>
      dispatchAction(InstanceServerSettingActions.fetchedInstanceServer({ instanceServerSettings }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export class InstanceServerSettingActions {
  static fetchedInstanceServer = defineAction({
    type: 'ee.client.InstanceServerSetting.INSTANCE_SERVER_SETTING_DISPLAY',
    instanceServerSettings: matches.object as Validator<unknown, Paginated<InstanceServerSettingType>>
  })
}
