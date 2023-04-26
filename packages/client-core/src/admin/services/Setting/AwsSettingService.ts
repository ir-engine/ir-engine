import { Paginated } from '@feathersjs/feathers'

import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import {
  AwsSettingPatch,
  awsSettingPath,
  AwsSettingType
} from '@etherealengine/engine/src/schemas/setting/aws-setting.schema'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { API } from '../../../API'
import { NotificationService } from '../../../common/services/NotificationService'

export const AdminAwsSettingState = defineState({
  name: 'AdminAwsSettingState',
  initial: () => ({
    awsSettings: [] as Array<AwsSettingType>,
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
      const awsSettings = (await API.instance.client.service(awsSettingPath).find()) as Paginated<AwsSettingType>
      dispatchAction(AdminAwsSettingActions.awsSettingRetrieved({ awsSettings }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  patchAwsSetting: async (data: AwsSettingPatch, id: string) => {
    try {
      await API.instance.client.service(awsSettingPath).patch(id, data)
      dispatchAction(AdminAwsSettingActions.awsSettingPatched({}))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export class AdminAwsSettingActions {
  static awsSettingRetrieved = defineAction({
    type: 'ee.client.AdminAwsSetting.ADMIN_AWS_SETTING_FETCHED' as const,
    awsSettings: matches.object as Validator<unknown, Paginated<AwsSettingType>>
  })
  static awsSettingPatched = defineAction({
    type: 'ee.client.AdminAwsSetting.ADMIN_AWS_SETTING_PATCHED' as const
  })
}
