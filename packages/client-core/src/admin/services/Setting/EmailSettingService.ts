import { Paginated } from '@feathersjs/feathers'
import { createState, useState } from '@speigg/hookstate'

import { EmailSetting, PatchEmailSetting } from '@xrengine/common/src/interfaces/EmailSetting'

import { NotificationService } from '../../../common/services/NotificationService'
import { client } from '../../../feathers'
import { store, useDispatch } from '../../../store'

//State
const state = createState({
  email: [] as Array<EmailSetting>,
  updateNeeded: true
})

store.receptors.push((action: EmailSettingActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'EMAIL_SETTING_DISPLAY':
        return s.merge({ email: action.emailSettingResult.data, updateNeeded: false })
      case 'EMAIL_SETTING_PATCHED':
        return s.updateNeeded.set(true)
    }
  }, action.type)
})

export const accessEmailSettingState = () => state

export const useEmailSettingState = () => useState(state) as any as typeof state

//Service
export const EmailSettingService = {
  fetchedEmailSettings: async (inDec?: 'increment' | 'dcrement') => {
    const dispatch = useDispatch()
    try {
      const emailSettings = (await client.service('email-setting').find()) as Paginated<EmailSetting>
      dispatch(EmailSettingAction.fetchedEmail(emailSettings))
    } catch (err) {
      console.log(err.message)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  patchEmailSetting: async (data: PatchEmailSetting, id: string) => {
    const dispatch = useDispatch()

    try {
      await client.service('email-setting').patch(id, data)
      dispatch(EmailSettingAction.emailSettingPatched())
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

//Action
export const EmailSettingAction = {
  fetchedEmail: (emailSettingResult: Paginated<EmailSetting>) => {
    return {
      type: 'EMAIL_SETTING_DISPLAY' as const,
      emailSettingResult: emailSettingResult
    }
  },
  emailSettingPatched: () => {
    return {
      type: 'EMAIL_SETTING_PATCHED' as const
    }
  }
}

export type EmailSettingActionType = ReturnType<typeof EmailSettingAction[keyof typeof EmailSettingAction]>
