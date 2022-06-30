import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Box, Grid, Typography } from '@mui/material'

import { useAuthState } from '../../../user/services/AuthService'
import InputText from '../../common/InputText'
import { AdminCoilSettingService, useCoilSettingState } from '../../services/Setting/CoilSettingService'
import styles from '../../styles/settings.module.scss'

const Coil = () => {
  const { t } = useTranslation()
  const coilSettingState = useCoilSettingState()
  const [coil] = coilSettingState?.coil.value || []
  const authState = useAuthState()
  const user = authState.user

  useEffect(() => {
    if (user?.id?.value && coilSettingState?.updateNeeded?.value) {
      AdminCoilSettingService.fetchCoil()
    }
  }, [authState?.user?.id?.value, coilSettingState?.updateNeeded?.value])

  return (
    <Box>
      <Typography component="h1" className={styles.settingsHeading}>
        {t('admin:components.setting.coil')}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={6} sm={6}>
          <InputText
            name="clientId"
            label={t('admin:components.setting.clientId')}
            value={coil?.clientId || ''}
            disabled
          />

          <InputText
            name="clientSecret"
            label={t('admin:components.setting.clientSecret')}
            value={coil?.clientSecret || ''}
            disabled
          />
        </Grid>
        <Grid item xs={6} sm={6}>
          <InputText
            name="paymentPointer"
            label={t('admin:components.setting.coilPaymentPointer')}
            value={coil?.paymentPointer || ''}
            disabled
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default Coil
