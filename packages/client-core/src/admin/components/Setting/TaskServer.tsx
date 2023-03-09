import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import InputText from '@etherealengine/client-core/src/common/components/InputText'
import Box from '@etherealengine/ui/src/Box'
import Grid from '@etherealengine/ui/src/Grid'
import Typography from '@etherealengine/ui/src/Typography'

import { useAuthState } from '../../../user/services/AuthService'
import {
  AdminSettingTaskServerService,
  useSettingTaskServerState
} from '../../services/Setting/TaskServerSettingsService'
import styles from '../../styles/settings.module.scss'

const TaskServer = () => {
  const { t } = useTranslation()
  const settingTaskServerState = useSettingTaskServerState()
  const settingTaskServer = settingTaskServerState.taskservers
  const authState = useAuthState()
  const user = authState.user
  const isMounted = useRef(false)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    if (!isMounted.current) return
    if (user?.id?.value != null && settingTaskServerState?.updateNeeded?.value === true) {
      AdminSettingTaskServerService.fetchSettingsTaskServer()
    }
  }, [authState?.user?.id?.value, settingTaskServerState?.updateNeeded?.value])

  return (
    <Box>
      <Typography component="h1" className={styles.settingsHeading}>
        {t('admin:components.setting.taskServer.taskServer')}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={6} sm={6}>
          <InputText
            name="port"
            label={t('admin:components.setting.taskServer.port')}
            value={settingTaskServer.value.map((el) => el.port).join(', ')}
            disabled
          />
        </Grid>
        <Grid item xs={6} sm={6}>
          <InputText
            name="processinterval"
            label={t('admin:components.setting.taskServer.processInterval')}
            value={settingTaskServer.value.map((el) => el.processInterval).join(', ')}
            disabled
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default TaskServer
