import { getCurrentTheme } from '@etherealengine/common/src/constants/DefaultThemeSettings'
import { ThemeOptions } from '@etherealengine/common/src/interfaces/ClientSetting'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, getState, useHookstate } from '@etherealengine/hyperflux'

import { AdminClientSettingsState } from '../../admin/services/Setting/ClientSettingService'
import { AuthState } from '../../user/services/AuthService'

export const AppThemeState = defineState({
  name: 'AppThemeState',
  initial: () => ({
    mode: 'auto' as 'auto' | 'profile' | 'custom',
    customTheme: null as ThemeOptions | null,
    customThemeName: null as string | null
  })
})

export const AppThemeServiceReceptor = (action) => {
  const s = getState(AppThemeState)
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
    type: 'xre.client.AppTheme.setCustomTheme' as const,
    theme: matches.object.optional() as Validator<unknown, ThemeOptions>,
    themeName: matches.string.optional()
  })
}

export const useAppThemeName = (): string => {
  const themeState = useHookstate(getState(AppThemeState))
  const authState = useHookstate(getState(AuthState))

  if (themeState.mode.value === 'custom' && themeState.customThemeName.value) return themeState.customThemeName.value

  return getCurrentTheme(authState.user?.user_setting?.value?.themeModes)
}

export const getAppThemeName = (): string => {
  const themeState = getState(AppThemeState)
  const authState = getState(AuthState)

  if (themeState.mode.value === 'custom' && themeState.customThemeName.value) return themeState.customThemeName.value

  return getCurrentTheme(authState.user?.user_setting?.value?.themeModes)
}

export const getAppTheme = () => {
  const themeState = getState(AppThemeState)
  if (themeState.mode.value === 'custom' && themeState.customTheme.value) return themeState.customTheme.value

  const authState = getState(AuthState)
  const theme = getCurrentTheme(authState.user?.user_setting?.value?.themeModes)
  const clientSettingState = getState(AdminClientSettingsState)
  const themeSettings = clientSettingState?.client?.value?.[0]?.themeSettings
  if (themeSettings) return themeSettings[theme]
}
