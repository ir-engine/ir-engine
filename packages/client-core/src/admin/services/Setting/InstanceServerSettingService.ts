import { Paginated } from '@feathersjs/feathers'
import { createState, useState } from '@speigg/hookstate'

import { InstanceServerSetting } from '@xrengine/common/src/interfaces/InstanceServerSetting'

import { NotificationService } from '../../../common/services/NotificationService'
import { client } from '../../../feathers'
import { store, useDispatch } from '../../../store'

//State
const state = createState({
  instanceserver: [] as Array<InstanceServerSetting>,
  updateNeeded: true
})

store.receptors.push((action: InstanceServerSettingActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'INSTANCE_SERVER_SETTING_DISPLAY':
        return s.merge({ instanceserver: action.instanceServerSettingResult.data, updateNeeded: false })
    }
  }, action.type)
})

export const accessInstanceServerSettingState = () => state

export const useInstanceServerSettingState = () => useState(state) as any as typeof state

//Service
export const InstanceServerSettingService = {
  fetchedInstanceServerSettings: async (inDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    try {
      const instanceServer = (await client
        .service('instance-server-setting')
        .find()) as Paginated<InstanceServerSetting>
      dispatch(InstanceServerSettingAction.fetchedInstanceServer(instanceServer))
    } catch (err) {
      console.log(err.message)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

//Action
export const InstanceServerSettingAction = {
  fetchedInstanceServer: (instanceServerSettingResult: Paginated<InstanceServerSetting>) => {
    return {
      type: 'INSTANCE_SERVER_SETTING_DISPLAY',
      instanceServerSettingResult: instanceServerSettingResult
    }
  }
}
export type InstanceServerSettingActionType = ReturnType<
  typeof InstanceServerSettingAction[keyof typeof InstanceServerSettingAction]
>
