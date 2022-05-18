import { Icon } from '@iconify/react'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button, Divider, Grid, Paper, Typography } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import Switch from '@mui/material/Switch'

import { useAuthState } from '../../../user/services/AuthService'
import { EmailSettingService, useEmailSettingState } from '../../services/Setting/EmailSettingService'
import styles from '../../styles/settings.module.scss'

interface emailProps {}

const Email = (props: emailProps) => {
  const emailSettingState = useEmailSettingState()
  const [emailSetting] = emailSettingState?.email?.value || []
  const id = emailSetting?.id
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const [smtp, setSmtp] = useState(emailSetting?.smtp)
  const [auth, setAuth] = useState(emailSetting?.smtp?.auth)
  const [from, setFrom] = useState(emailSetting?.from)
  const [subject, setSubject] = useState(emailSetting?.subject)

  const authState = useAuthState()
  const user = authState.user

  const handleSmtpSecure = (event) => {
    setSmtp({ ...smtp, secure: event.target.checked })
  }

  const handleUpdateSmtp = (event, type) => {
    setSmtp({
      ...smtp,
      [type]: event.target.value
    })
  }

  const handleUpdateAuth = (event, type) => {
    setAuth({
      ...auth,
      [type]: event.target.value
    })
  }

  const handleUpdateSubject = (event, type) => {
    setSubject({
      ...subject,
      [type]: event.target.value
    })
  }

  useEffect(() => {
    if (user?.id?.value != null && emailSettingState?.updateNeeded?.value === true) {
      EmailSettingService.fetchedEmailSettings()
    }
  }, [authState?.user?.id?.value, emailSettingState?.updateNeeded?.value])

  useEffect(() => {
    if (emailSetting) {
      let tempSmtp = JSON.parse(JSON.stringify(emailSetting?.smtp))
      let tempAuth = JSON.parse(JSON.stringify(emailSetting?.smtp?.auth))
      let tempSubject = JSON.parse(JSON.stringify(emailSetting?.subject))

      setSmtp(tempSmtp)
      setAuth(tempAuth)
      setSubject(tempSubject)
      setFrom(emailSetting?.from)
    }
  }, [emailSettingState?.updateNeeded?.value])

  const handleSubmit = (event) => {
    event.preventDefault()

    EmailSettingService.patchEmailSetting(
      {
        smtp: JSON.stringify({ ...smtp, auth: JSON.stringify(auth) }),
        from: from,
        subject: JSON.stringify(subject)
      },
      id
    )
  }

  const handleCancel = () => {
    let tempSmtp = JSON.parse(JSON.stringify(emailSetting?.smtp))
    let tempAuth = JSON.parse(JSON.stringify(emailSetting?.smtp?.auth))
    let tempSubject = JSON.parse(JSON.stringify(emailSetting?.subject))

    setSmtp(tempSmtp)
    setAuth(tempAuth)
    setSubject(tempSubject)
    setFrom(emailSetting?.from)
  }

  return (
    <div>
      <form>
        <Typography component="h1" className={styles.settingsHeading}>
          {t('admin:components.setting.email')}
        </Typography>
        <Grid container spacing={3} key={emailSetting?.id}>
          <Grid item xs={12} sm={6}>
            <Typography>{t('admin:components.setting.smtp')}</Typography>
            <Paper variant="outlined" square className={styles.Paper}>
              <Paper component="div" className={styles.createInput}>
                <label> {t('admin:components.setting.host')}:</label>
                <InputBase
                  name="host"
                  className={styles.input}
                  value={smtp?.host || ''}
                  onChange={(e) => handleUpdateSmtp(e, 'host')}
                />
              </Paper>
              <Paper component="div" className={styles.createInput}>
                <label> {t('admin:components.setting.port')}:</label>
                <InputBase
                  name="port"
                  value={smtp?.port || ''}
                  className={styles.input}
                  onChange={(e) => handleUpdateSmtp(e, 'port')}
                />
              </Paper>
              <Paper component="div" className={styles.createInput}>
                <label>{t('admin:components.setting.secure')}</label>
                <Switch
                  checked={smtp?.secure || false}
                  onChange={handleSmtpSecure}
                  color="primary"
                  name="checkedB"
                  inputProps={{ 'aria-label': 'primary checkbox' }}
                />
              </Paper>
            </Paper>
            <Divider />
            <Typography>{t('admin:components.setting.auth')}</Typography>
            <Paper variant="outlined" square className={styles.Paper}>
              <Paper component="div" className={styles.createInput}>
                <label> {t('admin:components.setting.userName')}: </label>
                <InputBase
                  name="user"
                  className={styles.input}
                  value={auth?.user || ''}
                  onChange={(e) => handleUpdateAuth(e, 'user')}
                />
              </Paper>
              <Paper component="div" className={styles.createInput}>
                <label> {t('admin:components.setting.password')}:</label>
                <InputBase
                  name="pass"
                  className={styles.input}
                  type={showPassword ? 'text' : 'password'}
                  value={auth?.pass || ''}
                  onChange={(e) => handleUpdateAuth(e, 'pass')}
                />
                <IconButton size="large" onClick={() => setShowPassword(!showPassword)}>
                  <Icon color="orange" icon="ic:baseline-visibility-off" />
                </IconButton>
              </Paper>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>{t('admin:components.setting.from')}</Typography>
            <Paper variant="outlined" square className={styles.Paper}>
              <Paper component="div" className={styles.createInput}>
                <label> {t('admin:components.setting.from')}:</label>
                <InputBase
                  name="from"
                  className={styles.input}
                  value={from || ''}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </Paper>
            </Paper>
            <Divider />
            <Typography>{t('admin:components.setting.subject')}</Typography>
            <Paper variant="outlined" square className={styles.Paper}>
              <Paper component="div" className={styles.createInput}>
                <label>{t('admin:components.setting.login')}: </label>
                <InputBase
                  name="login"
                  value={subject?.login || ''}
                  className={styles.input}
                  onChange={(e) => handleUpdateSubject(e, 'login')}
                />
              </Paper>
              <Paper component="div" className={styles.createInput}>
                <label> {t('admin:components.setting.friend')}:</label>
                <InputBase
                  name="friend"
                  value={subject?.friend || ''}
                  className={styles.input}
                  onChange={(e) => handleUpdateSubject(e, 'friend')}
                />
              </Paper>
              <Paper component="div" className={styles.createInput}>
                <label> {t('admin:components.setting.group')}:</label>
                <InputBase
                  name=" group"
                  value={subject?.group || ''}
                  className={styles.input}
                  onChange={(e) => handleUpdateSubject(e, 'group')}
                />
              </Paper>
              <Paper component="div" className={styles.createInput}>
                <label> {t('admin:components.setting.party')}:</label>
                <InputBase
                  name=" party"
                  value={subject?.party || ''}
                  className={styles.input}
                  onChange={(e) => handleUpdateSubject(e, 'party')}
                />
              </Paper>
              <Paper component="div" className={styles.createInput}>
                <label>{t('admin:components.setting.smsNameCharLimit')}:</label>
                <InputBase
                  disabled
                  name=" smsNameCharacterLimit"
                  className={styles.input}
                  value={emailSetting?.smsNameCharacterLimit}
                />
              </Paper>
            </Paper>
          </Grid>
        </Grid>
        <Button
          sx={{ maxWidth: '100%' }}
          variant="outlined"
          className={styles.cancelButton}
          type="submit"
          onClick={handleCancel}
        >
          {t('admin:components.setting.cancel')}
        </Button>{' '}
        &nbsp;&nbsp;
        <Button
          sx={{ maxWidth: '100%' }}
          variant="contained"
          className={styles.saveBtn}
          type="submit"
          onClick={handleSubmit}
        >
          {t('admin:components.setting.save')}
        </Button>
      </form>
    </div>
  )
}

export default Email
