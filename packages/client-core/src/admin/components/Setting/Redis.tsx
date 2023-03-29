import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import InputSwitch from '@etherealengine/client-core/src/common/components/InputSwitch'
import InputText from '@etherealengine/client-core/src/common/components/InputText'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/Box'
import Grid from '@etherealengine/ui/src/Grid'
import Typography from '@etherealengine/ui/src/Typography'

import { AuthState } from '../../../user/services/AuthService'
import { AdminRedisSettingService, AdminRedisSettingsState } from '../../services/Setting/AdminRedisSettingService'
import styles from '../../styles/settings.module.scss'

const Redis = () => {
  const { t } = useTranslation()
  const redisSettingState = useHookstate(getMutableState(AdminRedisSettingsState))
  const [redisSetting] = redisSettingState?.redisSettings?.get({ noproxy: true }) || []
  const user = useHookstate(getMutableState(AuthState).user)

  const enabled = useHookstate(true)

  useEffect(() => {
    if (user?.id?.value != null && redisSettingState?.updateNeeded?.value) {
      AdminRedisSettingService.fetchRedisSetting()
    }
  }, [user?.id?.value, redisSettingState?.updateNeeded?.value])

  return (
    <Box>
      <Typography component="h1" className={styles.settingsHeading}>
        {t('admin:components.setting.redis')}
      </Typography>
      <InputSwitch
        name="enabled"
        sx={{ mb: 2 }}
        label={t('admin:components.setting.enabled')}
        checked={enabled.value}
        disabled
        onChange={(event) => enabled.set(event.target.checked)}
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
