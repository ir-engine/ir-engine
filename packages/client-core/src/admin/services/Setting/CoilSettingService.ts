import { Paginated } from '@feathersjs/feathers'
import { createState, useState } from '@speigg/hookstate'

import { CoilSetting } from '@xrengine/common/src/interfaces/CoilSetting'

import { AlertService } from '../../../common/services/AlertService'
import { client } from '../../../feathers'
import { store, useDispatch } from '../../../store'

const state = createState({
  coil: [] as Array<CoilSetting>,
  updateNeeded: true
})

store.receptors.push((action: CoilSettingActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'COIL_SETTING_DISPLAY':
        return s.merge({ coil: action.coilSetting.data, updateNeeded: false })
    }
  }, action.type)
})

export const accessCoilSettingState = () => state

export const useCoilSettingState = () => useState(state) as any as typeof state

// Service
export const CoilSettingService = {
  fetchCoil: async () => {
    const dispatch = useDispatch()

    try {
      const coil = (await client.service('coil-setting').find()) as Paginated<CoilSetting>
      dispatch(CoilSettingAction.fetchedCoil(coil))
    } catch (err) {
      AlertService.dispatchAlertError(err)
    }
  }
}

// Action
export const CoilSettingAction = {
  fetchedCoil: (coilSetting: Paginated<CoilSetting>) => {
    return {
      type: 'COIL_SETTING_DISPLAY' as const,
      coilSetting: coilSetting
    }
  }
}

export type CoilSettingActionType = ReturnType<typeof CoilSettingAction[keyof typeof CoilSettingAction]>
