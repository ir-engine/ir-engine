import { Paginated } from '@feathersjs/feathers'

import { ChargebeeSetting } from '@xrengine/common/src/interfaces/ChargebeeSetting'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { NotificationService } from '../../../common/services/NotificationService'
import { client } from '../../../feathers'

const AdminChargebeeSettingsState = defineState({
  name: 'AdminChargebeeSettingsState',
  initial: () => ({
    chargebee: [] as Array<ChargebeeSetting>,
    updateNeeded: true
  })
})

export const AdminRouteServiceReceptor = (action) => {
  getState(AdminChargebeeSettingsState).batch((s) => {
    matches(action).when(AdminChargebeeSettingActions.chargebeeSettingRetrieved.matches, (action) => {
      return s.merge({ chargebee: action.chargebeeSetting.data, updateNeeded: false })
    })
  })
}

export const accessAdminChargebeeSettingState = () => getState(AdminChargebeeSettingsState)

export const useAdminChargebeeSettingState = () => useState(accessAdminChargebeeSettingState())

export const ChargebeeSettingService = {
  fetchChargeBee: async () => {
    try {
      const chargeBee = (await client.service('chargebee-setting').find()) as Paginated<ChargebeeSetting>
      dispatchAction(AdminChargebeeSettingActions.chargebeeSettingRetrieved({ chargebeeSetting: chargeBee }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export class AdminChargebeeSettingActions {
  static chargebeeSettingRetrieved = defineAction({
    type: 'ADMIN_REDIS_SETTING_FETCHED' as const,
    chargebeeSetting: matches.object as Validator<unknown, Paginated<ChargebeeSetting>>
  })
}
