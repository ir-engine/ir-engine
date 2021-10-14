import { createState, useState, none, Downgraded } from '@hookstate/core'
import { EmailSettingActionType } from './EmailSettingActions'
import { EmailSetting } from '@xrengine/common/src/interfaces/EmailSetting'

const state = createState({
  Email: {
    email: [] as Array<EmailSetting>,
    updateNeeded: true
  }
})

export const emailSettingReducer = (_, action: EmailSettingActionType) => {
  Promise.resolve().then(() => emailSettingReceptor(action))
  return state.attach(Downgraded).value
}

const emailSettingReceptor = (action: EmailSettingActionType): any => {
  let result
  state.batch((s) => {
    switch (action.type) {
      case 'EMAIL_SETTING_DISPLAY':
        result = action.emailSettingResult
        return s.Email.merge({ email: result.data, updateNeeded: false })
    }
  }, action.type)
}

export const accessEmailSettingState = () => state
export const useEmailSettingState = () => useState(state) as any as typeof state
