import { Icon } from '@iconify/react'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button, Divider, Grid, Paper, Typography } from '@mui/material'
import IconButton from '@mui/material/IconButton'

import { useAuthState } from '../../../user/services/AuthService'
import InputSwitch from '../../common/InputSwitch'
import InputText from '../../common/InputText'
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
              <InputText
                name="host"
                label={t('admin:components.setting.host')}
                value={smtp?.host || ''}
                onChange={(e) => handleUpdateSmtp(e, 'host')}
              />

              <InputText
                name="port"
                label={t('admin:components.setting.port')}
                value={smtp?.port || ''}
                onChange={(e) => handleUpdateSmtp(e, 'port')}
              />

              <InputSwitch
                name="email"
                label={t('admin:components.setting.secure')}
                checked={smtp?.secure || false}
                onChange={handleSmtpSecure}
              />
            </Paper>
            <Divider />
            <Typography>{t('admin:components.setting.auth')}</Typography>
            <Paper variant="outlined" square className={styles.Paper}>
              <InputText
                name="user"
                label={t('admin:components.setting.userName')}
                value={auth?.user || ''}
                onChange={(e) => handleUpdateAuth(e, 'user')}
              />

              <InputText
                name="pass"
                label={t('admin:components.setting.password')}
                value={auth?.pass || ''}
                type={showPassword ? 'text' : 'password'}
                endAdornment={
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    <Icon
                      icon={showPassword ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                      color="orange"
                    />
                  </IconButton>
                }
                onChange={(e) => handleUpdateAuth(e, 'pass')}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>{t('admin:components.setting.from')}</Typography>

            <InputText
              name="from"
              label={t('admin:components.setting.from')}
              value={from || ''}
              onChange={(e) => setFrom(e.target.value)}
            />

            <Divider />
            <Typography>{t('admin:components.setting.subject')}</Typography>
            <Paper variant="outlined" square className={styles.Paper}>
              <InputText
                name="login"
                label={t('admin:components.setting.login')}
                value={subject?.login || ''}
                onChange={(e) => handleUpdateSubject(e, 'login')}
              />

              <InputText
                name="friend"
                label={t('admin:components.setting.friend')}
                value={subject?.friend || ''}
                onChange={(e) => handleUpdateSubject(e, 'friend')}
              />

              <InputText
                name="group"
                label={t('admin:components.setting.group')}
                value={subject?.group || ''}
                onChange={(e) => handleUpdateSubject(e, 'group')}
              />

              <InputText
                name="party"
                label={t('admin:components.setting.party')}
                value={subject?.party || ''}
                onChange={(e) => handleUpdateSubject(e, 'party')}
              />

              <InputText
                name="smsNameCharacterLimit"
                label={t('admin:components.setting.smsNameCharLimit')}
                value={emailSetting?.smsNameCharacterLimit}
                disabled
              />
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
