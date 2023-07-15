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

import { useEffect } from 'react'

import { defaultThemeSettings, getCurrentTheme } from '@etherealengine/common/src/constants/DefaultThemeSettings'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { ClientThemeOptionsType } from '@etherealengine/engine/src/schemas/setting/client-setting.schema'
import {
  addActionReceptor,
  defineAction,
  defineState,
  getMutableState,
  getState,
  NO_PROXY,
  removeActionReceptor,
  useHookstate
} from '@etherealengine/hyperflux'

import { AdminClientSettingsState, ClientSettingService } from '../../admin/services/Setting/ClientSettingService'
import { AuthState } from '../../user/services/AuthService'

export const AppThemeState = defineState({
  name: 'AppThemeState',
  initial: () => ({
    mode: 'auto' as 'auto' | 'profile' | 'custom',
    customTheme: null as ClientThemeOptionsType | null,
    customThemeName: null as string | null
  })
})

export const AppThemeServiceReceptor = (action) => {
  const s = getMutableState(AppThemeState)
  matches(action).when(AppThemeActions.setCustomTheme.matches, (action) => {
    return s.merge({
      customTheme: action.theme,
      customThemeName: action.themeName,
      mode: action.themeName ? 'custom' : 'auto'
    })
  })
}

export class AppThemeActions {
  static setCustomTheme = defineAction({
    type: 'ee.client.AppTheme.setCustomTheme' as const,
    theme: matches.object.optional() as Validator<unknown, ClientThemeOptionsType>,
    themeName: matches.string.optional()
  })
}

export const AppThemeFunctions = {
  setTheme: (theme?: ClientThemeOptionsType, themeName?: string) => {
    const themeState = getMutableState(AppThemeState)
    themeState.customTheme.set(theme ?? null)
    themeState.customThemeName.set(themeName ?? null)
    themeState.mode.set(themeName ? 'custom' : 'auto')
  }
}

export const useAppThemeName = (): string => {
  const themeState = useHookstate(getMutableState(AppThemeState))
  const authState = useHookstate(getMutableState(AuthState))

  if (themeState.mode.value === 'custom' && themeState.customThemeName.value) return themeState.customThemeName.value

  return getCurrentTheme(authState.user?.user_setting?.value?.themeModes)
}

export const getAppThemeName = (): string => {
  const themeState = getMutableState(AppThemeState)
  const authState = getMutableState(AuthState)

  if (themeState.mode.value === 'custom' && themeState.customThemeName.value) return themeState.customThemeName.value

  return getCurrentTheme(authState.user?.user_setting?.value?.themeModes)
}

export const getAppTheme = () => {
  const themeState = getState(AppThemeState)
  if (themeState.mode === 'custom' && themeState.customTheme) return themeState.customTheme

  const authState = getState(AuthState)
  const theme = getCurrentTheme(authState.user?.user_setting?.themeModes)
  const clientSettingState = getState(AdminClientSettingsState)
  const themeSettings = clientSettingState?.client?.[0]?.themeSettings
  if (themeSettings) return themeSettings[theme]

  return defaultThemeSettings[theme]
}
