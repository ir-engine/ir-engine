import { Paginated } from '@feathersjs/feathers'
import { createState, useState } from '@speigg/hookstate'

import { ChargebeeSetting } from '@xrengine/common/src/interfaces/ChargebeeSetting'

import { AlertService } from '../../../common/services/AlertService'
import { client } from '../../../feathers'
import { store, useDispatch } from '../../../store'

const state = createState({
  chargebee: [] as Array<ChargebeeSetting>,
  updateNeeded: true
})

store.receptors.push((action: ChargebeeSettingActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'CHARGEBEE_SETTING_DISPLAY':
        return s.merge({ chargebee: action.chargebeeSetting.data, updateNeeded: false })
    }
  }, action.type)
})

export const accessChargebeeSettingState = () => state

export const useChargebeeSettingState = () => useState(state) as any as typeof state

//Service
export const ChargebeeSettingService = {
  fetchChargeBee: async () => {
    const dispatch = useDispatch()

    try {
      const chargeBee = (await client.service('chargebee-setting').find()) as Paginated<ChargebeeSetting>
      dispatch(ChargebeeSettingAction.fetchedChargebee(chargeBee))
    } catch (err) {
      AlertService.dispatchAlertError(err)
    }
  }
}

//Action
export const ChargebeeSettingAction = {
  fetchedChargebee: (chargebeeSetting: Paginated<ChargebeeSetting>) => {
    return {
      type: 'CHARGEBEE_SETTING_DISPLAY' as const,
      chargebeeSetting: chargebeeSetting
    }
  }
}

export type ChargebeeSettingActionType = ReturnType<typeof ChargebeeSettingAction[keyof typeof ChargebeeSettingAction]>
