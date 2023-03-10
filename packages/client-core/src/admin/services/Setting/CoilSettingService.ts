import { Paginated } from '@feathersjs/feathers'

import { CoilSetting } from '@etherealengine/common/src/interfaces/CoilSetting'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getMutableState, useState } from '@etherealengine/hyperflux'

import { API } from '../../../API'
import { NotificationService } from '../../../common/services/NotificationService'

const AdminCoilSettingsState = defineState({
  name: 'AdmindCoilSettingsState',
  initial: () => ({
    coil: [] as Array<CoilSetting>,
    updateNeeded: true
  })
})

const fetchedCoilReceptor = (action: typeof AdminCoilSettingActions.fetchedCoil.matches._TYPE) => {
  const state = getMutableState(AdminCoilSettingsState)
  return state.merge({ coil: action.coilSettings.data, updateNeeded: false })
}

export const CoilSettingReceptors = {
  fetchedCoilReceptor
}
/**@deprecated use getMutableState directly instead */
export const accessCoilSettingState = () => getMutableState(AdminCoilSettingsState)
/**@deprecated use useHookstate(getMutableState(...) directly instead */
export const useCoilSettingState = () => useState(accessCoilSettingState())

export const AdminCoilSettingService = {
  fetchCoil: async () => {
    try {
      const coilSettings = (await API.instance.client.service('coil-setting').find()) as Paginated<CoilSetting>
      dispatchAction(AdminCoilSettingActions.fetchedCoil({ coilSettings }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export class AdminCoilSettingActions {
  static fetchedCoil = defineAction({
    type: 'xre.client.AdminCoilSetting.COIL_SETTING_DISPLAY' as const,
    coilSettings: matches.object as Validator<unknown, Paginated<CoilSetting>>
  })
}
