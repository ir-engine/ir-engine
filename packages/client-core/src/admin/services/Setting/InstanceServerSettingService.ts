import { Paginated } from '@feathersjs/feathers'

import { InstanceServerSetting } from '@xrengine/common/src/interfaces/InstanceServerSetting'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { NotificationService } from '../../../common/services/NotificationService'
import { client } from '../../../feathers'

const AdminInstanceServerSettingsState = defineState({
  name: 'AdminInstanceServerSettingsState',
  initial: () => ({
    instanceserver: [] as Array<InstanceServerSetting>,
    updateNeeded: true
  })
})

export const AdminInstanceServerServiceReceptor = (action) => {
  getState(AdminInstanceServerSettingsState).batch((s) => {
    matches(action).when(InstanceServerSettingActions.fetchedInstanceServer.matches, (action) => {
      return s.merge({ instanceserver: action.instanceServerSettings.data, updateNeeded: false })
    })
  })
}

export const accessInstanceServerSettingState = () => getState(AdminInstanceServerSettingsState)

export const useInstanceServerSettingState = () => useState(accessInstanceServerSettingState())

export const InstanceServerSettingService = {
  fetchedInstanceServerSettings: async (inDec?: 'increment' | 'decrement') => {
    try {
      const instanceServerSettings = (await client
        .service('instance-server-setting')
        .find()) as Paginated<InstanceServerSetting>
      dispatchAction(InstanceServerSettingActions.fetchedInstanceServer({ instanceServerSettings }))
    } catch (err) {
      console.log(err.message)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export class InstanceServerSettingActions {
  static fetchedInstanceServer = defineAction({
    type: 'INSTANCE_SERVER_SETTING_DISPLAY',
    instanceServerSettings: matches.object as Validator<unknown, Paginated<InstanceServerSetting>>
  })
}
