import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import defaultThemeSettings from '@xrengine/common/src/constants/DefaultThemeSettings'
import { ThemeSetting } from '@xrengine/common/src/interfaces/ClientSetting'

import { Button } from '@mui/material'

import { useAuthState } from '../../../../user/services/AuthService'
import { ClientSettingService, useClientSettingState } from '../../../services/Setting/ClientSettingService'
import styles from '../../../styles/settings.module.scss'
import ColorSelectionArea from './ColorSelectionArea'
import DemoArea from './DemoArea'
import DemoStyle from './DemoStyle'

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
  }

  const handleCancel = () => {
    setThemeSetting(clientSetting?.themeSettings)
  }

  const theme = themeSetting[mode]

  return (
    <div>
      <DemoStyle theme={theme} />
      <DemoArea />
      <ColorSelectionArea
        mode={mode}
        theme={theme}
        handleChangeThemeMode={handleChangeThemeMode}
        handleChangeColor={handleChangeColor}
      />
      <Button sx={{ maxWidth: '100%' }} variant="outlined" style={{ color: '#fff' }} onClick={handleCancel}>
        {t('admin:components.setting.cancel')}
      </Button>
      &nbsp; &nbsp;
      <Button
        sx={{ maxWidth: '100%' }}
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
