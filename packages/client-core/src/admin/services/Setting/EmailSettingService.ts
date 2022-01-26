import { client } from '../../../feathers'
import { AlertService } from '../../../common/services/AlertService'
import { useDispatch, store } from '../../../store'
import { EmailSettingResult } from '@xrengine/common/src/interfaces/EmailSettingResult'
import { createState, useState } from '@speigg/hookstate'
import { EmailSetting } from '@xrengine/common/src/interfaces/EmailSetting'

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
      const emailSettings = await client.service('email-setting').find()
      dispatch(EmailSettingAction.fetchedEmail(emailSettings))
    } catch (error) {
      console.log(error.message)
      AlertService.dispatchAlertError(error.message)
    }
  },
  patchEmailSetting: async (data: any, id: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('email-setting').patch(id, data)
        dispatch(EmailSettingAction.emailSettingPatched())
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  }
}

//Action
export const EmailSettingAction = {
  fetchedEmail: (emailSettingResult: EmailSettingResult) => {
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
