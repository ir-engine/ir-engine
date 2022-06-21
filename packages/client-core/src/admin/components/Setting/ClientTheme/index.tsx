import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import defaultThemeSettings from '@xrengine/common/src/constants/DefaultThemeSettings'
import { ThemeSetting } from '@xrengine/common/src/interfaces/ClientSetting'

import { Button } from '@mui/material'

import { useAuthState } from '../../../../user/services/AuthService'
import { ClientSettingService, useClientSettingState } from '../../../services/Setting/ClientSettingService'
import styles from '../../../styles/settings.module.scss'
import ColorSelectionArea from './ColorSelectionArea'
import DemoStyle from './DemoStyle'
import ThemePlayground from './ThemePlayground'

const ClientTheme = () => {
  const selfUser = useAuthState().user
  const clientSettingState = useClientSettingState()
  const [clientSetting] = clientSettingState?.client?.value || []
  const id = clientSetting?.id

  const { t } = useTranslation()

  const [mode, setMode] = useState(selfUser?.user_setting?.value?.themeMode || 'dark')

  const [themeSetting, setThemeSetting] = useState<ThemeSetting>({
    light: { ...defaultThemeSettings.light, ...clientSetting?.themeSettings?.light },
    dark: { ...defaultThemeSettings.dark, ...clientSetting?.themeSettings?.dark }
  })

  const handleChangeColor = (name, value) => {
    const tempSetting = JSON.parse(JSON.stringify(themeSetting))

    tempSetting[mode][name] = value

    setThemeSetting(tempSetting)
  }

  const handleChangeThemeMode = (event) => {
    setMode(event.target.checked ? 'dark' : 'light')
  }

  const resetThemeToDefault = () => {
    setThemeSetting({
      light: { ...defaultThemeSettings.light },
      dark: { ...defaultThemeSettings.dark }
    })

    ClientSettingService.patchClientSetting(
      {
        logo: clientSetting?.logo,
        title: clientSetting?.title,
        icon192px: clientSetting?.icon192px,
        icon512px: clientSetting?.icon512px,
        favicon16px: clientSetting?.favicon16px,
        favicon32px: clientSetting?.favicon32px,
        siteDescription: clientSetting?.siteDescription,
        appTitle: clientSetting?.appTitle,
        appSubtitle: clientSetting?.appSubtitle,
        appDescription: clientSetting?.appDescription,
        appBackground: clientSetting?.appBackground,
        appSocialLinks: JSON.stringify(clientSetting?.appSocialLinks),
        themeSettings: JSON.stringify(defaultThemeSettings)
      },
      id
    )

    const currentTheme = selfUser?.user_setting?.value?.themeMode || 'dark'

    if (currentTheme === 'light' && defaultThemeSettings?.light) {
      for (let variable of Object.keys(defaultThemeSettings.light)) {
        ;(document.querySelector(`[data-theme=light]`) as any)?.style.setProperty(
          '--' + variable,
          defaultThemeSettings.light[variable]
        )
      }
    } else if (currentTheme === 'dark' && defaultThemeSettings?.dark) {
      for (let variable of Object.keys(defaultThemeSettings.dark)) {
        ;(document.querySelector(`[data-theme=dark]`) as any)?.style.setProperty(
          '--' + variable,
          defaultThemeSettings.dark[variable]
        )
      }
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    ClientSettingService.patchClientSetting(
      {
        logo: clientSetting?.logo,
        title: clientSetting?.title,
        icon192px: clientSetting?.icon192px,
        icon512px: clientSetting?.icon512px,
        favicon16px: clientSetting?.favicon16px,
        favicon32px: clientSetting?.favicon32px,
        siteDescription: clientSetting?.siteDescription,
        appTitle: clientSetting?.appTitle,
        appSubtitle: clientSetting?.appSubtitle,
        appDescription: clientSetting?.appDescription,
        appBackground: clientSetting?.appBackground,
        appSocialLinks: JSON.stringify(clientSetting?.appSocialLinks),
        themeSettings: JSON.stringify(themeSetting)
      },
      id
    )

    const currentTheme = selfUser?.user_setting?.value?.themeMode || 'dark'

    if (currentTheme === 'light' && themeSetting?.light) {
      for (let variable of Object.keys(themeSetting.light)) {
        ;(document.querySelector(`[data-theme=light]`) as any)?.style.setProperty(
          '--' + variable,
          themeSetting.light[variable]
        )
      }
    } else if (currentTheme === 'dark' && themeSetting?.dark) {
      for (let variable of Object.keys(themeSetting.dark)) {
        ;(document.querySelector(`[data-theme=dark]`) as any)?.style.setProperty(
          '--' + variable,
          themeSetting.dark[variable]
        )
      }
    }
  }

  const handleCancel = () => {
    setThemeSetting(clientSetting?.themeSettings)
  }

  const theme = themeSetting[mode]

  return (
    <div>
      <DemoStyle theme={theme} />
      <ThemePlayground />
      <ColorSelectionArea
        mode={mode}
        theme={theme}
        handleChangeThemeMode={handleChangeThemeMode}
        handleChangeColor={handleChangeColor}
      />
      <Button sx={{ maxWidth: '100%' }} variant="outlined" className={styles.cancelButton} onClick={handleCancel}>
        {t('admin:components.setting.cancel')}
      </Button>
      <Button
        sx={{ maxWidth: '100%', ml: 1 }}
        variant="outlined"
        className={styles.cancelButton}
        onClick={resetThemeToDefault}
      >
        {t('admin:components.setting.resetTheme')}
      </Button>
      <Button
        sx={{ maxWidth: '100%', ml: 1 }}
        variant="contained"
        className={styles.saveBtn}
        type="submit"
        onClick={handleSubmit}
      >
        {t('admin:components.setting.save')}
      </Button>
    </div>
  )
}

export default ClientTheme
