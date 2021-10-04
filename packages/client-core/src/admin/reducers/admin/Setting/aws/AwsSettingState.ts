import { createState, useState, none, Downgraded } from '@hookstate/core'

import { AwsSettingActionType } from './AwsSettingActions'

const state = createState({
  awsSettings: {
    awsSettings: [],
    skip: 0,
    limit: 100,
    total: 0,
    updateNeeded: true
  }
})

export const adminAwsSettingReducer = (_, action: AwsSettingActionType) => {
  Promise.resolve().then(() => adminAwsSettingReceptor(action))
  return state.attach(Downgraded).value
}

const adminAwsSettingReceptor = (action: AwsSettingActionType): any => {
  let result: any
  state.batch((s) => {
    switch (action.type) {
      case 'ADMIN_AWS_SETTING_FETCHED':
        result = action.list
        return s.awsSettings.merge({ awsSettings: result.data, updateNeeded: false })
    }
  }, action.type)
}

export const accessAdminAwsSettingState = () => state
export const useAdminAwsSettingState = () => useState(state)
