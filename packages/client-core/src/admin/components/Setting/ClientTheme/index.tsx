import React from 'react'
import { useTranslation } from 'react-i18next'

import {
  defaultThemeModes,
  defaultThemeSettings,
  getCurrentTheme
} from '@etherealengine/common/src/constants/DefaultThemeSettings'
import { ThemeMode, ThemeSetting } from '@etherealengine/common/src/interfaces/ClientSetting'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Button from '@etherealengine/ui/src/primitives/mui/Button'

import { AuthState } from '../../../../user/services/AuthService'
import { AdminClientSettingsState, ClientSettingService } from '../../../services/Setting/ClientSettingService'
import styles from '../../../styles/settings.module.scss'
import ColorSelectionArea from './ColorSelectionArea'
import DemoStyle from './DemoStyle'
import ThemePlayground from './ThemePlayground'
import ThemeSelectionArea from './ThemeSelectionArea'

const ClientTheme = () => {
  const { t } = useTranslation()

  const selfUser = useHookstate(getMutableState(AuthState).user)
  const clientSettingState = useHookstate(getMutableState(AdminClientSettingsState))
  const [clientSetting] = clientSettingState?.client?.get({ noproxy: true }) || []
  const id = clientSetting?.id

  const themeSettings = useHookstate<ThemeSetting>({
    ...defaultThemeSettings,
    ...clientSetting.themeSettings
  })
  const themeModes = useHookstate<ThemeMode>({
    ...defaultThemeModes,
    ...clientSetting.themeModes
  })
  const selectedMode = useHookstate('light')

  const handleChangeColor = (name, value) => {
    const tempSetting = JSON.parse(JSON.stringify(themeSettings.value))

    tempSetting[selectedMode.value][name] = value

    themeSettings.set(tempSetting)
  }

  const handleChangeMode = (event) => {
    const { value } = event.target
    selectedMode.set(value)
  }

  const handleChangeThemeMode = (event) => {
    const { name, value } = event.target
    themeModes.set({ ...JSON.parse(JSON.stringify(themeModes.value)), [name]: value })
  }

  const resetThemeToDefault = async () => {
    themeSettings.set({ ...defaultThemeSettings })
    themeModes.set({ ...defaultThemeModes })

    await updateTheme(defaultThemeSettings, defaultThemeModes)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    await updateTheme(themeSettings.value, themeModes.value)
  }

  const updateTheme = async (newThemeSettings: ThemeSetting, newThemeModes: ThemeMode) => {
    await ClientSettingService.patchClientSetting(
      {
        logo: clientSetting?.logo,
        title: clientSetting?.title,
        shortTitle: clientSetting?.shortTitle,
        startPath: clientSetting?.startPath,
        icon192px: clientSetting?.icon192px,
        icon512px: clientSetting?.icon512px,
        favicon16px: clientSetting?.favicon16px,
        favicon32px: clientSetting?.favicon32px,
        webmanifestLink: clientSetting?.webmanifestLink,
        swScriptLink: clientSetting?.swScriptLink,
        siteDescription: clientSetting?.siteDescription,
        appTitle: clientSetting?.appTitle,
        appSubtitle: clientSetting?.appSubtitle,
        appDescription: clientSetting?.appDescription,
        appBackground: clientSetting?.appBackground,
        appSocialLinks: JSON.stringify(clientSetting?.appSocialLinks),
        themeSettings: JSON.stringify(newThemeSettings),
        themeModes: JSON.stringify(newThemeModes),
        key8thWall: clientSetting?.key8thWall,
        homepageLinkButtonEnabled: clientSetting?.homepageLinkButtonEnabled,
        homepageLinkButtonRedirect: clientSetting?.homepageLinkButtonRedirect,
        homepageLinkButtonText: clientSetting?.homepageLinkButtonText
      },
      id
    )

    const currentTheme = getCurrentTheme(selfUser?.user_setting?.value?.themeModes)

    if (newThemeSettings[currentTheme]) {
      for (let variable of Object.keys(newThemeSettings[currentTheme])) {
        ;(document.querySelector(`[data-theme=${currentTheme}]`) as any)?.style.setProperty(
          '--' + variable,
          newThemeSettings[currentTheme][variable]
        )
      }
    }
  }

  const handleCancel = () => {
    themeSettings.set(clientSetting?.themeSettings)
    themeModes.set(clientSetting?.themeModes)
  }

  const theme = themeSettings[selectedMode.value].value

  return (
    <div>
      <DemoStyle theme={theme} />

      <ThemeSelectionArea
        themeModes={themeModes.value}
        colorModes={Object.keys(themeSettings.value)}
        onChangeThemeMode={handleChangeThemeMode}
      />

      <ThemePlayground />

      <ColorSelectionArea
        mode={selectedMode.value}
        theme={theme}
        colorModes={Object.keys(themeSettings.value)}
        onChangeMode={handleChangeMode}
        onChangeColor={handleChangeColor}
      />

      <Button sx={{ maxWidth: '100%' }} className={styles.outlinedButton} onClick={handleCancel}>
        {t('admin:components.common.cancel')}
      </Button>

      <Button sx={{ maxWidth: '100%', ml: 1 }} className={styles.outlinedButton} onClick={resetThemeToDefault}>
        {t('admin:components.setting.resetTheme')}
      </Button>

      <Button sx={{ maxWidth: '100%', ml: 1 }} className={styles.gradientButton} onClick={handleSubmit}>
        {t('admin:components.common.save')}
      </Button>
    </div>
  )
}

export default ClientTheme
