import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Paper, Typography } from '@mui/material'
import InputBase from '@mui/material/InputBase'

import { useAuthState } from '../../../user/services/AuthService'
import { ChargebeeSettingService, useChargebeeSettingState } from '../../services/Setting/ChargebeeSettingService'
import { useStyles } from './styles'

interface Props {}

const ChargeBee = (props: Props) => {
  const classes = useStyles()
  const chargeBeeSettingState = useChargebeeSettingState()
  const [chargebee] = chargeBeeSettingState?.chargebee.value || []
  const authState = useAuthState()
  const user = authState.user
  const { t } = useTranslation()

  useEffect(() => {
    if (user?.id?.value != null && chargeBeeSettingState?.updateNeeded?.value) {
      ChargebeeSettingService.fetchChargeBee()
    }
  }, [authState?.user?.id?.value, chargeBeeSettingState?.updateNeeded?.value])

  return (
    <div>
      <form>
        <Typography component="h1" className={classes.settingsHeading}>
          {t('admin:components.setting.chargebee')}
        </Typography>
        <Paper component="div" className={classes.createInput}>
          <label>{t('admin:components.setting.url')}:</label>
          <InputBase
            value={chargebee?.url || ''}
            name="url"
            className={classes.input}
            disabled
            style={{ color: '#fff' }}
          />
        </Paper>
        <Paper component="div" className={classes.createInput}>
          <label>{t('admin:components.setting.apiKey')}:</label>
          <InputBase
            value={chargebee?.apiKey || ''}
            name="apiKey"
            className={classes.input}
            disabled
            style={{ color: '#fff' }}
          />
        </Paper>
      </form>
    </div>
  )
}

export default ChargeBee
