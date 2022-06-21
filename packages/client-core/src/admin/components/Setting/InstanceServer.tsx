import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Box, Grid, Typography } from '@mui/material'

import { useAuthState } from '../../../user/services/AuthService'
import InputSwitch from '../../common/InputSwitch'
import InputText from '../../common/InputText'
import { InstanceServerSettingService } from '../../services/Setting/InstanceServerSettingService'
import { useInstanceServerSettingState } from '../../services/Setting/InstanceServerSettingService'
import styles from '../../styles/settings.module.scss'

const InstanceServer = () => {
  const { t } = useTranslation()
  const instanceServerSettingState = useInstanceServerSettingState()
  const instanceServerSettings = instanceServerSettingState?.instanceserver?.value || []
  const authState = useAuthState()
  const user = authState.user

  const [local, setLocal] = useState(true)

  useEffect(() => {
    if (user?.id?.value != null && instanceServerSettingState?.updateNeeded?.value === true) {
      InstanceServerSettingService.fetchedInstanceServerSettings()
    }
  }, [authState?.user?.id?.value, instanceServerSettingState?.updateNeeded?.value])

  return (
    <Box>
      <Typography component="h1" className={styles.settingsHeading}>
        {t('admin:components.setting.instanceServer')}
      </Typography>
      {instanceServerSettings.map((el) => (
        <Grid container spacing={3} key={el?.id || ''}>
          <Grid item xs={12} sm={6}>
            <InputText
              name="clientHost"
              label={t('admin:components.setting.clientHost')}
              value={el?.clientHost || ''}
              disabled
            />

            <InputText
              name="rtc_start_port"
              label={t('admin:components.setting.rtcStartPort')}
              value={el?.rtc_start_port || ''}
              disabled
            />

            <InputText
              name="rtc_end_port"
              label={t('admin:components.setting.rtcEndPort')}
              value={el?.rtc_end_port || ''}
              disabled
            />

            <InputText
              name="rtc_port_block_size"
              label={t('admin:components.setting.rtcPortBlockSize')}
              value={el?.rtc_port_block_size || ''}
              disabled
            />

            <InputText
              name="identifierDigits"
              label={t('admin:components.setting.identifierDigits')}
              value={el?.identifierDigits || ''}
              disabled
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <InputText name="domain" label={t('admin:components.setting.domain')} value={el?.domain || ''} disabled />

            <InputText
              name="releaseName"
              label={t('admin:components.setting.releaseName')}
              value={el?.releaseName || ''}
              disabled
            />

            <InputText name="port" label={t('admin:components.setting.port')} value={el?.port || ''} disabled />

            <InputText name="mode" label={t('admin:components.setting.mode')} value={el?.mode || ''} disabled />

            <InputText
              name="locationName"
              label={t('admin:components.setting.locationName')}
              value={el?.locationName || ''}
              disabled
            />

            <InputSwitch
              name="local"
              label={t('admin:components.setting.local')}
              checked={local}
              disabled
              onChange={(event) => setLocal(event.target.checked)}
            />
          </Grid>
        </Grid>
      ))}
    </Box>
  )
}

export default InstanceServer
