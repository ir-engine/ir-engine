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

import { useHookstate } from '@hookstate/core'
import React, { createContext, useEffect, useMemo } from 'react'

import {
  AdminClientSettingsState,
  ClientSettingService
} from '@etherealengine/client-core/src/admin/services/Setting/ClientSettingService'
import {
  AppThemeServiceReceptor,
  AppThemeState,
  getAppTheme,
  useAppThemeName
} from '@etherealengine/client-core/src/common/services/AppThemeState'
import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { ClientThemeOptionsType } from '@etherealengine/engine/src/schemas/setting/client-setting.schema'
import { NO_PROXY, addActionReceptor, getMutableState, removeActionReceptor } from '@etherealengine/hyperflux'

export interface ThemeContextProps {
  theme: string
  setTheme: (theme: string) => void
}

export const ThemeContext = createContext<ThemeContextProps>({
  theme: 'dark',
  setTheme: () => {}
})

export const ThemeContextProvider = ({ children }: { children: React.ReactNode }) => {
  const authState = useHookstate(getMutableState(AuthState))
  const selfUser = authState.user

  const clientSettingState = useHookstate(getMutableState(AdminClientSettingsState))

  const appTheme = useHookstate(getMutableState(AppThemeState))
  const [clientSetting] = clientSettingState?.client?.get(NO_PROXY) || []
  const clientThemeSettings = useHookstate({} as Record<string, ClientThemeOptionsType>)

  const currentThemeName = useAppThemeName()

  useEffect(() => {
    addActionReceptor(AppThemeServiceReceptor)
    return () => {
      removeActionReceptor(AppThemeServiceReceptor)
    }
  }, [])

  useEffect(() => {
    const html = document.querySelector('html')
    if (html) {
      html.dataset.theme = currentThemeName
      updateTheme()
    }
  }, [selfUser?.user_setting?.value])

  useEffect(() => {
    if (clientSetting) {
      clientThemeSettings.set(clientSetting?.themeSettings)
    }
    if (clientSettingState?.updateNeeded?.value) ClientSettingService.fetchClientSettings()
  }, [clientSettingState?.updateNeeded?.value])

  useEffect(() => {
    updateTheme()
  }, [clientThemeSettings, appTheme.customTheme, appTheme.customThemeName])

  const updateTheme = () => {
    const theme = getAppTheme()
    if (theme)
      for (const variable of Object.keys(theme)) {
        ;(document.querySelector(`[data-theme=${currentThemeName}]`) as any)?.style.setProperty(
          '--' + variable,
          theme[variable]
        )
      }
  }

  const val = useMemo(
    () => ({
      theme: currentThemeName,
      setTheme: (theme: string) => {
        // todo - set theme
      }
    }),
    [currentThemeName]
  )

  return <ThemeContext.Provider value={val}>{children}</ThemeContext.Provider>
}
