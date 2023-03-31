import { Paginated } from '@feathersjs/feathers'

import { AdminAwsSetting, PatchAwsSetting } from '@etherealengine/common/src/interfaces/AdminAwsSetting'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { API } from '../../../API'
import { NotificationService } from '../../../common/services/NotificationService'

export const AdminAwsSettingState = defineState({
  name: 'AdminAwsSettingState',
  initial: () => ({
    awsSettings: [] as Array<AdminAwsSetting>,
    skip: 0,
    limit: 100,
    total: 0,
    updateNeeded: true
  })
})

const awsSettingRetrievedReceptor = (action: typeof AdminAwsSettingActions.awsSettingRetrieved.matches._TYPE) => {
  const state = getMutableState(AdminAwsSettingState)
  return state.merge({ awsSettings: action.awsSettings.data, updateNeeded: false })
}

const awsSettingPatchedReceptor = (action: typeof AdminAwsSettingActions.awsSettingPatched.matches._TYPE) => {
  const state = getMutableState(AdminAwsSettingState)
  return state.updateNeeded.set(true)
}

export const AwsSettingReceptors = {
  awsSettingRetrievedReceptor,
  awsSettingPatchedReceptor
}

export const AwsSettingService = {
  fetchAwsSetting: async () => {
    try {
      const awsSettings = (await API.instance.client.service('aws-setting').find()) as Paginated<AdminAwsSetting>
      dispatchAction(AdminAwsSettingActions.awsSettingRetrieved({ awsSettings }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  patchAwsSetting: async (data: PatchAwsSetting, id: string) => {
    try {
      await API.instance.client.service('aws-setting').patch(id, data)
      dispatchAction(AdminAwsSettingActions.awsSettingPatched({}))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export class AdminAwsSettingActions {
  static awsSettingRetrieved = defineAction({
    type: 'ee.client.AdminAwsSetting.ADMIN_AWS_SETTING_FETCHED' as const,
    awsSettings: matches.object as Validator<unknown, Paginated<AdminAwsSetting>>
  })
  static awsSettingPatched = defineAction({
    type: 'ee.client.AdminAwsSetting.ADMIN_AWS_SETTING_PATCHED' as const
  })
}
