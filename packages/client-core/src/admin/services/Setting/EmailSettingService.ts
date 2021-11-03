import { client } from '../../../feathers'
import { AlertService } from '../../../common/services/AlertService'
import { useDispatch, store } from '../../../store'
import { EmailSettingResult } from '@xrengine/common/src/interfaces/EmailSettingResult'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { EmailSetting } from '@xrengine/common/src/interfaces/EmailSetting'

//State
const state = createState({
  Email: {
    email: [] as Array<EmailSetting>,
    updateNeeded: true
  }
})

store.receptors.push((action: EmailSettingActionType): any => {
  let result
  state.batch((s) => {
    switch (action.type) {
      case 'EMAIL_SETTING_DISPLAY':
        result = action.emailSettingResult
        return s.merge({ Email: { email: result.data, updateNeeded: false } })
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
  }
}

//Action
export const EmailSettingAction = {
  fetchedEmail: (emailSettingResult: EmailSettingResult) => {
    return {
      type: 'EMAIL_SETTING_DISPLAY' as const,
      emailSettingResult: emailSettingResult
    }
  }
}

export type EmailSettingActionType = ReturnType<typeof EmailSettingAction[keyof typeof EmailSettingAction]>
