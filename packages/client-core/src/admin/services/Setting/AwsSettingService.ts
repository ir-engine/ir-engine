import { Paginated } from '@feathersjs/feathers'
import { createState, useState } from '@speigg/hookstate'

import { AdminAwsSetting, PatchAwsSetting } from '@xrengine/common/src/interfaces/AdminAwsSetting'

import { NotificationService } from '../../../common/services/NotificationService'
import { client } from '../../../feathers'
import { store, useDispatch } from '../../../store'

//State
const state = createState({
  awsSettings: [] as Array<AdminAwsSetting>,
  skip: 0,
  limit: 100,
  total: 0,
  updateNeeded: true
})

store.receptors.push((action: AwsSettingActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'ADMIN_AWS_SETTING_FETCHED':
        return s.merge({ awsSettings: action.adminAWSSetting.data, updateNeeded: false })
      case 'ADMIN_AWS_SETTING_PATCHED':
        return s.updateNeeded.set(true)
    }
  }, action.type)
})

export const accessAdminAwsSettingState = () => state

export const useAdminAwsSettingState = () => useState(state) as any as typeof state

//Service
export const AwsSettingService = {
  fetchAwsSetting: async () => {
    const dispatch = useDispatch()

    try {
      const awsSetting = (await client.service('aws-setting').find()) as Paginated<AdminAwsSetting>
      dispatch(AwsSettingAction.awsSettingRetrieved(awsSetting))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  patchAwsSetting: async (data: PatchAwsSetting, id: string) => {
    const dispatch = useDispatch()

    try {
      await client.service('aws-setting').patch(id, data)
      dispatch(AwsSettingAction.awsSettingPatched())
    } catch (err) {
      console.log(err)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

//Action
export const AwsSettingAction = {
  // TODO: add interface
  awsSettingRetrieved: (adminAWSSetting: Paginated<AdminAwsSetting>) => {
    return {
      type: 'ADMIN_AWS_SETTING_FETCHED' as const,
      adminAWSSetting: adminAWSSetting
    }
  },
  awsSettingPatched: () => {
    return {
      type: 'ADMIN_AWS_SETTING_PATCHED' as const
    }
  }
}

export type AwsSettingActionType = ReturnType<typeof AwsSettingAction[keyof typeof AwsSettingAction]>
