import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Box, Grid, Typography } from '@mui/material'

import { useAuthState } from '../../../user/services/AuthService'
import InputText from '../../common/InputText'
import { ChargebeeSettingService, useAdminChargebeeSettingState } from '../../services/Setting/ChargebeeSettingService'
import styles from '../../styles/settings.module.scss'

const ChargeBee = () => {
  const { t } = useTranslation()
  const chargeBeeSettingState = useAdminChargebeeSettingState()
  const [chargebee] = chargeBeeSettingState?.chargebee.value || []
  const authState = useAuthState()
  const user = authState.user

  useEffect(() => {
    if (user?.id?.value != null && chargeBeeSettingState?.updateNeeded?.value) {
      ChargebeeSettingService.fetchChargeBee()
    }
  }, [authState?.user?.id?.value, chargeBeeSettingState?.updateNeeded?.value])

  return (
    <Box>
      <Typography component="h1" className={styles.settingsHeading}>
        {t('admin:components.setting.chargebee')}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={6} sm={6}>
          <InputText name="url" label={t('admin:components.setting.url')} value={chargebee?.url || ''} disabled />
        </Grid>
        <Grid item xs={6} sm={6}>
          <InputText
            name="apiKey"
            label={t('admin:components.setting.apiKey')}
            value={chargebee?.apiKey || ''}
            disabled
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default ChargeBee
