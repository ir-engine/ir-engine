import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { Grid, Paper, Typography } from '@mui/material'
import { InputBase } from '@mui/material'

import { useAuthState } from '../../../user/services/AuthService'
import { SettingAnalyticsService, useSettingAnalyticsState } from '../../services/Setting/SettingAnalyticsService'
import styles from '../../styles/settings.module.scss'

interface AnalyticsProps {}

const Analytics = (props: AnalyticsProps) => {
  const settingAnalyticsState = useSettingAnalyticsState()
  const settingAnalytics = settingAnalyticsState.analytics
  const { t } = useTranslation()
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
    if (user?.id?.value != null && settingAnalyticsState?.updateNeeded?.value === true) {
      SettingAnalyticsService.fetchSettingsAnalytics()
    }
  }, [authState?.user?.id?.value, settingAnalyticsState?.updateNeeded?.value])

  const Data = {
    id: settingAnalytics.value.map((el) => el.id),
    port: settingAnalytics.value.map((el) => el.port),
    processInterval: settingAnalytics.value.map((el) => el.processInterval)
  }

  return (
    <div>
      <form>
        <Typography component="h1" className={styles.settingsHeading}>
          {t('admin:components.analytics.analytics')}
        </Typography>
        <div className={styles.root}>
          <Grid container spacing={3}>
            <Grid item xs={6} sm={4}>
              <label> {t('admin:components.analytics.port')} </label>
              <Paper component="div" className={styles.createInput}>
                <InputBase name="port" className={styles.input} value={Data.port} disabled />
              </Paper>
            </Grid>
            <Grid item xs={6} sm={4}>
              <label> {t('admin:components.analytics.processInterval')} </label>
              <Paper component="div" className={styles.createInput}>
                <InputBase name="processinterval" className={styles.input} value={Data.processInterval} disabled />
              </Paper>
            </Grid>
          </Grid>
        </div>
      </form>
    </div>
  )
}

export default Analytics
