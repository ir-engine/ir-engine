import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { EmailSettingActionType } from './EmailSettingActions'
import { EmailSetting } from '@standardcreative/common/src/interfaces/EmailSetting'

const state = createState({
  Email: {
    email: [] as Array<EmailSetting>,
    updateNeeded: true
  }
})

export const receptor = (action: EmailSettingActionType): any => {
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
