/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { defaultThemeSettings, getCurrentTheme } from '@ir-engine/common/src/constants/DefaultThemeSettings'
import { ClientThemeOptionsType } from '@ir-engine/common/src/schema.type.module'
import { defineState, getMutableState, getState, useMutableState } from '@ir-engine/hyperflux'

/** @deprected this is the thene for mui pages, it will be replaced with ThemeService / ThemeState */
export const AppThemeState = defineState({
  name: 'AppThemeState',
  initial: () => ({
    mode: 'auto' as 'auto' | 'profile' | 'custom',
    customTheme: null as ClientThemeOptionsType | null,
    customThemeName: null as string | null
  }),
  setTheme: (theme?: ClientThemeOptionsType, themeName?: string) => {
    const themeState = getMutableState(AppThemeState)
    themeState.customTheme.set(theme ?? null)
    themeState.customThemeName.set(themeName ?? null)
    themeState.mode.set(themeName ? 'custom' : 'auto')
  }
})

export const useAppThemeName = (themeModes: Record<string, string>): string => {
  const themeState = useMutableState(AppThemeState)

  if (themeState.mode.value === 'custom' && themeState.customThemeName.value) return themeState.customThemeName.value

  return getCurrentTheme(themeModes)
}

export const getAppTheme = (themeModes: Record<string, string>) => {
  const themeState = getState(AppThemeState)
  if (themeState.mode === 'custom' && themeState.customTheme) return themeState.customTheme

  const theme = getCurrentTheme(themeModes)
  return defaultThemeSettings[theme]
}
