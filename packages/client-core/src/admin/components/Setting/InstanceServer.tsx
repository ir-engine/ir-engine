import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Grid, Paper, Typography } from '@mui/material'
import InputBase from '@mui/material/InputBase'
import Switch from '@mui/material/Switch'

import { useAuthState } from '../../../user/services/AuthService'
import { InstanceServerSettingService } from '../../services/Setting/InstanceServerSettingService'
import { useInstanceServerSettingState } from '../../services/Setting/InstanceServerSettingService'
import styles from '../../styles/settings.module.scss'

interface instanceServerProps {}

const InstanceServer = (props: instanceServerProps) => {
  const instanceServerSettingState = useInstanceServerSettingState()
  const instanceServerSettings = instanceServerSettingState?.instanceserver?.value || []
  const authState = useAuthState()
  const user = authState.user
  const [local, setLocal] = React.useState({
    checkedA: true,
    checkedB: true
  })
  const handleLocal = (event) => {
    setLocal({ ...local, [event.target.name]: event.target.checked })
  }
  const { t } = useTranslation()
  useEffect(() => {
    if (user?.id?.value != null && instanceServerSettingState?.updateNeeded?.value === true) {
      InstanceServerSettingService.fetchedInstanceServerSettings()
    }
  }, [authState?.user?.id?.value, instanceServerSettingState?.updateNeeded?.value])

  return (
    <div>
      <form>
        <Typography component="h1" className={styles.settingsHeading}>
          {t('admin:components.setting.instanceServer')}
        </Typography>
        {instanceServerSettings.map((el) => (
          <div className={styles.root} key={el?.id || ''}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <label> {t('admin:components.setting.clientHost')}</label>
                <Paper component="div" className={styles.createInput}>
                  <InputBase name="clientHost" className={styles.input} disabled value={el?.clientHost || ''} />
                </Paper>
                <label>{t('admin:components.setting.rtcStartPort')}</label>
                <Paper component="div" className={styles.createInput}>
                  <InputBase name="rtc_start_port" className={styles.input} disabled value={el?.rtc_start_port || ''} />
                </Paper>
                <label>{t('admin:components.setting.rtcEndPort')}</label>
                <Paper component="div" className={styles.createInput}>
                  <InputBase name="rtc_end_port" className={styles.input} disabled value={el?.rtc_end_port || ''} />
                </Paper>
                <label>{t('admin:components.setting.rtcPortBlockSize')}</label>
                <Paper component="div" className={styles.createInput}>
                  <InputBase
                    name="rtc_port_block_size"
                    className={styles.input}
                    disabled
                    value={el?.rtc_port_block_size || ''}
                  />
                </Paper>
                <label>{t('admin:components.setting.identifierDigits')} </label>
                <Paper component="div" className={styles.createInput}>
                  <InputBase
                    disabled
                    name="identifierDigits"
                    className={styles.input}
                    value={el?.identifierDigits || ''}
                  />
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <label> {t('admin:components.setting.local')} </label>
                <Paper component="div" className={styles.createInput}>
                  <Switch
                    disabled
                    checked={local.checkedB}
                    onChange={handleLocal}
                    color="primary"
                    name="checkedB"
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                  />
                </Paper>
                <label> {t('admin:components.setting.domain')} </label>
                <Paper component="div" className={styles.createInput}>
                  <InputBase name="domain" className={styles.input} disabled value={el?.domain || ''} />
                </Paper>
                <label> {t('admin:components.setting.releaseName')} </label>
                <Paper component="div" className={styles.createInput}>
                  <InputBase name="releaseName" className={styles.input} disabled value={el?.releaseName || ''} />
                </Paper>
                <label> {t('admin:components.setting.port')} </label>
                <Paper component="div" className={styles.createInput}>
                  <InputBase name="port" className={styles.input} disabled value={el?.port || ''} />
                </Paper>
                <label> {t('admin:components.setting.mode')} </label>
                <Paper component="div" className={styles.createInput}>
                  <InputBase name="mode" className={styles.input} disabled value={el?.mode || ''} />
                </Paper>
                <label> {t('admin:components.setting.locationName')} </label>
                <Paper component="div" className={styles.createInput}>
                  <InputBase name="locationName" className={styles.input} disabled value={el?.locationName || ''} />
                </Paper>
              </Grid>
            </Grid>
          </div>
        ))}
      </form>
    </div>
  )
}

export default InstanceServer
