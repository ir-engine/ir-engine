import { client } from '../../../feathers'
import { AlertService } from '../../../common/services/AlertService'
import { useDispatch, store } from '../../../store'
import { AdminRedisSettingResult } from '@xrengine/common/src/interfaces/AdminRedisSettingResult'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { AdminAwsSetting } from '@xrengine/common/src/interfaces/AdminAwsSetting'

//State
const state = createState({
  awsSettings: {
    awsSettings: [] as Array<AdminAwsSetting>,
    skip: 0,
    limit: 100,
    total: 0,
    updateNeeded: true
  }
})

store.receptors.push((action: AwsSettingActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'ADMIN_AWS_SETTING_FETCHED':
        return s.awsSettings.merge({ awsSettings: action.adminAWSSettingResult.data, updateNeeded: false })
    }
  }, action.type)
})

export const accessAdminAwsSettingState = () => state

export const useAdminAwsSettingState = () => useState(state) as any as typeof state

//Service
export const AwsSettingService = {
  fetchAwsSetting: async () => {
    const dispatch = useDispatch()
    {
      try {
        const awsSetting = await client.service('aws-setting').find()
        dispatch(AwsSettingAction.awsSettingRetrieved(awsSetting))
      } catch (err) {
        AlertService.dispatchAlertError(err.message)
      }
    }
  }
}

//Action
export const AwsSettingAction = {
  // TODO: add interface
  awsSettingRetrieved: (adminAWSSettingResult: any) => {
    return {
      type: 'ADMIN_AWS_SETTING_FETCHED' as const,
      adminAWSSettingResult: adminAWSSettingResult
    }
  }
}

export type AwsSettingActionType = ReturnType<typeof AwsSettingAction[keyof typeof AwsSettingAction]>
