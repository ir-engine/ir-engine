import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Typography } from '@mui/material'

import { useAuthState } from '../../../user/services/AuthService'
import InputText from '../../common/InputText'
import { ChargebeeSettingService, useAdminChargebeeSettingState } from '../../services/Setting/ChargebeeSettingService'
import styles from '../../styles/settings.module.scss'

interface Props {}

const ChargeBee = (props: Props) => {
  const chargeBeeSettingState = useAdminChargebeeSettingState()
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
        <InputText name="url" label={t('admin:components.setting.url')} value={chargebee?.url || ''} disabled />
        <InputText
          name="apiKey"
          label={t('admin:components.setting.apiKey')}
          value={chargebee?.apiKey || ''}
          disabled
        />
      </form>
    </div>
  )
}

export default ChargeBee
