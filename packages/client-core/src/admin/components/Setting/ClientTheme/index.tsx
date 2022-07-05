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
    ...defaultThemeSettings,
    ...clientSetting.themeSettings
  })

  const handleChangeColor = (name, value) => {
    const tempSetting = JSON.parse(JSON.stringify(themeSetting))

    tempSetting[mode][name] = value

    setThemeSetting(tempSetting)
  }

  const handleChangeThemeMode = (event) => {
    const { value } = event.target
    setMode(value)
  }

  const resetThemeToDefault = async () => {
    setThemeSetting({
      ...defaultThemeSettings,
      ...clientSetting.themeSettings
    })

    await updateTheme(defaultThemeSettings)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    await updateTheme(themeSetting)
  }

  const updateTheme = async (newThemeSetting: ThemeSetting) => {
    await ClientSettingService.patchClientSetting(
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
        themeSettings: JSON.stringify(newThemeSetting)
      },
      id
    )

    const currentTheme = selfUser?.user_setting?.value?.themeMode || 'dark'

    if (newThemeSetting[currentTheme]) {
      for (let variable of Object.keys(newThemeSetting[currentTheme])) {
        ;(document.querySelector(`[data-theme=${currentTheme}]`) as any)?.style.setProperty(
          '--' + variable,
          newThemeSetting[currentTheme][variable]
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
        themeModes={Object.keys(themeSetting)}
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
