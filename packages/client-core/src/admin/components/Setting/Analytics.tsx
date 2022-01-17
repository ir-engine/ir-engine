import React, { useEffect, useRef } from 'react'
import { useStyles } from './styles'
import { Grid, Paper, Typography } from '@mui/material'
import { InputBase } from '@mui/material'
import Switch from '@mui/material/Switch'
import { useSettingAnalyticsState } from '../../services/Setting/SettingAnalyticsService'
import { SettingAnalyticsService } from '../../services/Setting/SettingAnalyticsService'
import { useAuthState } from '../../../user/services/AuthService'

interface AnalyticsProps {}

const Analytics = (props: AnalyticsProps) => {
  const classes = useStyles()
  const settingAnalyticsState = useSettingAnalyticsState()
  const settingAnalytics = settingAnalyticsState.analytics

  const [enabled, setEnabled] = React.useState({
    checkedA: true,
    checkedB: true
  })
  const authState = useAuthState()
  const user = authState.user
  const handleEnable = (event) => {
    setEnabled({ ...enabled, [event.target.name]: event.target.checked })
  }
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
        <Typography component="h1" className={classes.settingsHeading}>
          Analytics
        </Typography>
        <div className={classes.root}>
          <Grid container spacing={3}>
            <Grid item xs={6} sm={4}>
              <label>Enabled</label>
              <Paper component="div" className={classes.createInput}>
                <Switch
                  disabled
                  checked={enabled.checkedB}
                  onChange={handleEnable}
                  color="primary"
                  name="checkedB"
                  inputProps={{ 'aria-label': 'primary checkbox' }}
                />
              </Paper>
            </Grid>

            <Grid item xs={6} sm={4}>
              <label> Port </label>
              <Paper component="div" className={classes.createInput}>
                <InputBase name="port" className={classes.input} value={Data.port} disabled style={{ color: '#fff' }} />
              </Paper>
            </Grid>
            <Grid item xs={6} sm={4}>
              <label> Process Interval </label>
              <Paper component="div" className={classes.createInput}>
                <InputBase
                  name="processinterval"
                  className={classes.input}
                  value={Data.processInterval}
                  disabled
                  style={{ color: '#fff' }}
                />
              </Paper>
            </Grid>
          </Grid>
        </div>
      </form>
    </div>
  )
}

export default Analytics
