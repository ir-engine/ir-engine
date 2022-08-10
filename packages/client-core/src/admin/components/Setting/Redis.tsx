import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Box, Grid, Typography } from '@mui/material'

import { useAuthState } from '../../../user/services/AuthService'
import InputSwitch from '../../common/InputSwitch'
import InputText from '../../common/InputText'
import { useAdminRedisSettingState } from '../../services/Setting/AdminRedisSettingService'
import { AdminRedisSettingService } from '../../services/Setting/AdminRedisSettingService'
import styles from '../../styles/settings.module.scss'

const Redis = () => {
  const { t } = useTranslation()
  const redisSettingState = useAdminRedisSettingState()
  const [redisSetting] = redisSettingState?.redisSettings?.value || []
  const authState = useAuthState()
  const user = authState.user

  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    if (user?.id?.value != null && redisSettingState?.updateNeeded?.value) {
      AdminRedisSettingService.fetchRedisSetting()
    }
  }, [authState?.user?.id?.value, redisSettingState?.updateNeeded?.value])

  return (
    <Box>
      <Typography component="h1" className={styles.settingsHeading}>
        {t('admin:components.setting.redis')}
      </Typography>
      <InputSwitch
        name="enabled"
        sx={{ mb: 2 }}
        label={t('admin:components.setting.enabled')}
        checked={enabled}
        disabled
        onChange={(event) => setEnabled(event.target.checked)}
      />
      <Grid container spacing={3}>
        <Grid item xs={6} sm={6}>
          <InputText
            name="address"
            label={t('admin:components.setting.address')}
            value={redisSetting?.address || ''}
            disabled
          />

          <InputText name="port" label={t('admin:components.setting.port')} value={redisSetting?.port || ''} disabled />
        </Grid>
        <Grid item xs={6} sm={6}>
          <InputText
            name="password"
            label={t('admin:components.setting.password')}
            value={redisSetting?.password || ''}
            disabled
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default Redis
