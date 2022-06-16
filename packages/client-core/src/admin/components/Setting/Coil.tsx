import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Typography } from '@mui/material'

import { useAuthState } from '../../../user/services/AuthService'
import InputText from '../../common/InputText'
import { AdminCoilSettingService, useCoilSettingState } from '../../services/Setting/CoilSettingService'
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
      AdminCoilSettingService.fetchCoil()
    }
  }, [authState?.user?.id?.value, coilSettingState?.updateNeeded?.value])

  return (
    <div>
      <form>
        <Typography component="h1" className={styles.settingsHeading}>
          {t('admin:components.setting.coil')}
        </Typography>

        <InputText
          name="paymentPointer"
          label={t('admin:components.setting.coilPaymentPointer')}
          value={coil?.paymentPointer || ''}
          disabled
        />

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
      </form>
    </div>
  )
}

export default Coil
