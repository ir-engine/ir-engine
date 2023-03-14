import { Paginated } from '@feathersjs/feathers'

import { ChargebeeSetting } from '@etherealengine/common/src/interfaces/ChargebeeSetting'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getMutableState, useState } from '@etherealengine/hyperflux'

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
  const state = getMutableState(AdminChargebeeSettingsState)
  return state.merge({ chargebee: action.chargebeeSetting.data, updateNeeded: false })
}

export const AdminChargebeeReceptors = {
  chargebeeSettingRetrievedReceptor
}
/**@deprecated use getMutableState directly instead */
export const accessAdminChargebeeSettingState = () => getMutableState(AdminChargebeeSettingsState)
/**@deprecated use useHookstate(getMutableState(...) directly instead */
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
