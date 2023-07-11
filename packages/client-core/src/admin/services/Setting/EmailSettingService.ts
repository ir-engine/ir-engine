/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Paginated } from '@feathersjs/feathers'

import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import {
  EmailSettingPatch,
  emailSettingPath,
  EmailSettingType
} from '@etherealengine/engine/src/schemas/setting/email-setting.schema'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

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
      const emailSettings = (await Engine.instance.api.service(emailSettingPath).find()) as Paginated<EmailSettingType>
      dispatchAction(EmailSettingActions.fetchedEmail({ emailSettings }))
    } catch (err) {
      console.log(err.message)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  patchEmailSetting: async (data: EmailSettingPatch, id: string) => {
    try {
      await Engine.instance.api.service(emailSettingPath).patch(id, data)
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
