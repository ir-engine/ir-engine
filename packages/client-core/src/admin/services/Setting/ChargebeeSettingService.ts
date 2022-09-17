import { Paginated } from '@feathersjs/feathers'

import { ChargebeeSetting } from '@xrengine/common/src/interfaces/ChargebeeSetting'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../../API'
import { NotificationService } from '../../../common/services/NotificationService'

const AdminChargebeeSettingsState = defineState({
  name: 'AdminChargebeeSettingsState',
  initial: () => ({
    chargebee: [] as Array<ChargebeeSetting>,
    updateNeeded: true
  })
})

const chargebeeSettingRetrievedReceptor = (
  action: typeof AdminChargebeeSettingActions.chargebeeSettingRetrieved.matches._TYPE
) => {
  const state = getState(AdminChargebeeSettingsState)
  return state.merge({ chargebee: action.chargebeeSetting.data, updateNeeded: false })
}

export const AdminChargebeeReceptors = {
  chargebeeSettingRetrievedReceptor
}

export const accessAdminChargebeeSettingState = () => getState(AdminChargebeeSettingsState)

export const useAdminChargebeeSettingState = () => useState(accessAdminChargebeeSettingState())

export const ChargebeeSettingService = {
  fetchChargeBee: async () => {
    try {
      const chargeBee = (await API.instance.client.service('chargebee-setting').find()) as Paginated<ChargebeeSetting>
      dispatchAction(AdminChargebeeSettingActions.chargebeeSettingRetrieved({ chargebeeSetting: chargeBee }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export class AdminChargebeeSettingActions {
  static chargebeeSettingRetrieved = defineAction({
    type: 'xre.client.AdminChargebeeSetting.ADMIN_CHARGEBEE_SETTING_FETCHED' as const,
    chargebeeSetting: matches.object as Validator<unknown, Paginated<ChargebeeSetting>>
  })
}
