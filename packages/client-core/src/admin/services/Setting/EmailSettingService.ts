import { Paginated } from '@feathersjs/feathers'

import { EmailSetting, PatchEmailSetting } from '@xrengine/common/src/interfaces/EmailSetting'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { NotificationService } from '../../../common/services/NotificationService'
import { client } from '../../../feathers'

const AdminEmailSettingsState = defineState({
  name: 'AdminEmailSettingsState',
  initial: () => ({
    email: [] as Array<EmailSetting>,
    updateNeeded: true
  })
})

export const AdminEmailSettingsServiceReceptor = (action) => {
  getState(AdminEmailSettingsState).batch((s) => {
    matches(action)
      .when(EmailSettingActions.fetchedEmail.matches, (action) => {
        return s.merge({ email: action.emailSettings.data, updateNeeded: false })
      })
      .when(EmailSettingActions.emailSettingPatched.matches, (action) => {
        return s.updateNeeded.set(true)
      })
  })
}

export const accessEmailSettingState = () => getState(AdminEmailSettingsState)

export const useEmailSettingState = () => useState(accessEmailSettingState())

export const EmailSettingService = {
  fetchedEmailSettings: async (inDec?: 'increment' | 'dcrement') => {
    try {
      const emailSettings = (await client.service('email-setting').find()) as Paginated<EmailSetting>
      dispatchAction(EmailSettingActions.fetchedEmail({ emailSettings }))
    } catch (err) {
      console.log(err.message)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  patchEmailSetting: async (data: PatchEmailSetting, id: string) => {
    try {
      await client.service('email-setting').patch(id, data)
      dispatchAction(EmailSettingActions.emailSettingPatched())
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export class EmailSettingActions {
  static fetchedEmail = defineAction({
    type: 'EMAIL_SETTING_DISPLAY' as const,
    emailSettings: matches.object as Validator<unknown, Paginated<EmailSetting>>
  })
  static emailSettingPatched = defineAction({
    type: 'EMAIL_SETTING_PATCHED' as const
  })
}
