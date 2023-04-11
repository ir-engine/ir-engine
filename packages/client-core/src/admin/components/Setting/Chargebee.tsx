import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import InputText from '@etherealengine/client-core/src/common/components/InputText'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Grid from '@etherealengine/ui/src/primitives/mui/Grid'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import { AuthState } from '../../../user/services/AuthService'
import { AdminChargebeeSettingsState, ChargebeeSettingService } from '../../services/Setting/ChargebeeSettingService'
import styles from '../../styles/settings.module.scss'

const ChargeBee = () => {
  const { t } = useTranslation()
  const chargeBeeSettingState = useHookstate(getMutableState(AdminChargebeeSettingsState))
  const [chargebee] = chargeBeeSettingState?.chargebee.get({ noproxy: true }) || []
  const user = useHookstate(getMutableState(AuthState).user)

  useEffect(() => {
    if (user?.id?.value != null && chargeBeeSettingState?.updateNeeded?.value) {
      ChargebeeSettingService.fetchChargeBee()
    }
  }, [user?.id?.value, chargeBeeSettingState?.updateNeeded?.value])

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
