import React from 'react'
import { useTranslation } from 'react-i18next'

import InputSelect, { InputMenuItem } from '@etherealengine/client-core/src/common/components/InputSelect'
import { ThemeMode } from '@etherealengine/common/src/interfaces/ClientSetting'
import capitalizeFirstLetter from '@etherealengine/common/src/utils/capitalizeFirstLetter'
import Grid from '@etherealengine/ui/src/Grid'
import Typography from '@etherealengine/ui/src/Typography'

import styles from '../../../styles/settings.module.scss'

interface ThemeSelectionAreaProps {
  themeModes: ThemeMode
  colorModes: string[]
  onChangeThemeMode: Function
}

const ThemeSelectionArea = ({ themeModes, colorModes, onChangeThemeMode }: ThemeSelectionAreaProps) => {
  const { t } = useTranslation()

  const colorModesMenu: InputMenuItem[] = colorModes.map((el) => {
    return {
      label: capitalizeFirstLetter(el),
      value: el
    }
  })

  return (
    <>
      <Typography component="h1" className={styles.settingsHeading}>
        {t('admin:components.setting.defaultThemes')}
      </Typography>

      <Grid container spacing={4} sx={{ mb: 3 }}>
        {Object.keys(themeModes).map((mode, index) => (
          <Grid key={index} item xs={12} sm={6} md={4}>
            <InputSelect
              name={mode}
              label={`${t(`admin:components.setting.${mode}`)} ${t('admin:components.setting.theme')}`}
              value={themeModes[mode]}
              menu={colorModesMenu}
              onChange={(e) => onChangeThemeMode(e)}
            />
          </Grid>
        ))}
      </Grid>
    </>
  )
}

export default ThemeSelectionArea
