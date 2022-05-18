import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Paper, Typography } from '@mui/material'
import InputBase from '@mui/material/InputBase'

import { useAuthState } from '../../../user/services/AuthService'
import { ChargebeeSettingService, useChargebeeSettingState } from '../../services/Setting/ChargebeeSettingService'
import styles from '../../styles/settings.module.scss'

interface Props {}

const ChargeBee = (props: Props) => {
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
        <Typography component="h1" className={styles.settingsHeading}>
          {t('admin:components.setting.chargebee')}
        </Typography>
        <Paper component="div" className={styles.createInput}>
          <label>{t('admin:components.setting.url')}:</label>
          <InputBase value={chargebee?.url || ''} name="url" className={styles.input} disabled />
        </Paper>
        <Paper component="div" className={styles.createInput}>
          <label>{t('admin:components.setting.apiKey')}:</label>
          <InputBase value={chargebee?.apiKey || ''} name="apiKey" className={styles.input} disabled />
        </Paper>
      </form>
    </div>
  )
}

export default ChargeBee
