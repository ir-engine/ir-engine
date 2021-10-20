import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'

import { AwsSettingActionType } from './AwsSettingActions'

import { AdminAwsSetting } from '@standardcreative/common/src/interfaces/AdminAwsSetting'

const state = createState({
  awsSettings: {
    awsSettings: [] as Array<AdminAwsSetting>,
    skip: 0,
    limit: 100,
    total: 0,
    updateNeeded: true
  }
})

export const receptor = (action: AwsSettingActionType): any => {
  let result: any
  state.batch((s) => {
    switch (action.type) {
      case 'ADMIN_AWS_SETTING_FETCHED':
        result = action.adminRedisSettingResult
        return s.awsSettings.merge({ awsSettings: result.data, updateNeeded: false })
    }
  }, action.type)
}

export const accessAdminAwsSettingState = () => state

export const useAdminAwsSettingState = () => useState(state) as any as typeof state
