import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Paper, Typography } from '@mui/material'
import InputBase from '@mui/material/InputBase'

import { useAuthState } from '../../../user/services/AuthService'
import { CoilSettingService, useCoilSettingState } from '../../services/Setting/CoilSettingService'
import styles from '../../styles/settings.module.scss'

interface Props {}

const Coil = (props: Props) => {
  const coilSettingState = useCoilSettingState()
  const [coil] = coilSettingState?.coil.value || []
  const authState = useAuthState()
  const user = authState.user
  const { t } = useTranslation()

  useEffect(() => {
    if (user?.id?.value && coilSettingState?.updateNeeded?.value) {
      CoilSettingService.fetchCoil()
    }
  }, [authState?.user?.id?.value, coilSettingState?.updateNeeded?.value])

  return (
    <div>
      <form>
        <Typography component="h1" className={styles.settingsHeading}>
          {t('admin:components.setting.coil')}
        </Typography>
        <Paper component="div" className={styles.createInput}>
          <label>{t('admin:components.setting.coilPaymentPointer')}:</label>
          <InputBase
            value={coil?.paymentPointer || ''}
            name="paymentPointer"
            className={styles.input}
            disabled
            style={{ color: '#fff' }}
          />
        </Paper>
        <Paper component="div" className={styles.createInput}>
          <label>{t('admin:components.setting.clientId')}:</label>
          <InputBase
            value={coil?.clientId || ''}
            name="clientId"
            className={styles.input}
            disabled
            style={{ color: '#fff' }}
          />
        </Paper>
        <Paper component="div" className={styles.createInput}>
          <label>{t('admin:components.setting.clientSecret')}:</label>
          <InputBase
            value={coil?.clientSecret || ''}
            name="clientSecret"
            className={styles.input}
            disabled
            style={{ color: '#fff' }}
          />
        </Paper>
      </form>
    </div>
  )
}

export default Coil
