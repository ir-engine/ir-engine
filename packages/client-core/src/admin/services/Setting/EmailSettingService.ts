import { Paginated } from '@feathersjs/feathers'

import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import {
  EmailSettingPatch,
  emailSettingPath,
  EmailSettingType
} from '@etherealengine/engine/src/schemas/setting/email-setting.schema'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { API } from '../../../API'
import { NotificationService } from '../../../common/services/NotificationService'

export const AdminEmailSettingsState = defineState({
  name: 'AdminEmailSettingsState',
  initial: () => ({
    email: [] as Array<EmailSettingType>,
    updateNeeded: true
  })
})

const fetchedEmailReceptor = (action: typeof EmailSettingActions.fetchedEmail.matches._TYPE) => {
  const state = getMutableState(AdminEmailSettingsState)
  return state.merge({ email: action.emailSettings.data, updateNeeded: false })
}

const emailSettingPatchedReceptor = (action: typeof EmailSettingActions.emailSettingPatched.matches._TYPE) => {
  const state = getMutableState(AdminEmailSettingsState)
  return state.updateNeeded.set(true)
}

export const EmailSettingReceptors = {
  fetchedEmailReceptor,
  emailSettingPatchedReceptor
}

export const EmailSettingService = {
  fetchedEmailSettings: async (inDec?: 'increment' | 'dcrement') => {
    try {
      const emailSettings = (await API.instance.client.service(emailSettingPath).find()) as Paginated<EmailSettingType>
      dispatchAction(EmailSettingActions.fetchedEmail({ emailSettings }))
    } catch (err) {
      console.log(err.message)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  patchEmailSetting: async (data: EmailSettingPatch, id: string) => {
    try {
      await API.instance.client.service(emailSettingPath).patch(id, data)
      dispatchAction(EmailSettingActions.emailSettingPatched({}))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export class EmailSettingActions {
  static fetchedEmail = defineAction({
    type: 'ee.client.EmailSetting.EMAIL_SETTING_DISPLAY' as const,
    emailSettings: matches.object as Validator<unknown, Paginated<EmailSettingType>>
  })
  static emailSettingPatched = defineAction({
    type: 'ee.client.EmailSetting.EMAIL_SETTING_PATCHED' as const
  })
}
