import React, { useState, useEffect } from 'react'
import { Grid, Typography, Paper, Divider, Button } from '@mui/material'
import { useStyles } from './styles'
import InputBase from '@mui/material/InputBase'
import Switch from '@mui/material/Switch'
import { Icon } from '@iconify/react'
import IconButton from '@mui/material/IconButton'
import { useEmailSettingState } from '../../services/Setting/EmailSettingService'
import { EmailSettingService } from '../../services/Setting/EmailSettingService'
import { useAuthState } from '../../../user/services/AuthService'

interface emailProps {}

const Email = (props: emailProps) => {
  const classes = useStyles()
  const emailSettingState = useEmailSettingState()
  const [emailSetting] = emailSettingState?.email?.value || []
  const id = emailSetting?.id
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
  }, [authState])

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

    EmailSettingService.pathEmailSetting(
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
        <Typography component="h1" className={classes.settingsHeading}>
          EMAIL
        </Typography>
        <Grid container spacing={3} key={emailSetting?.id}>
          <Grid item xs={12} sm={6}>
            <Typography>SMTP</Typography>
            <Paper variant="outlined" square className={classes.Paper}>
              <Paper component="div" className={classes.createInput}>
                <label> Host:</label>
                <InputBase
                  name="host"
                  className={classes.input}
                  value={smtp?.host || ''}
                  style={{ color: '#fff' }}
                  onChange={(e) => handleUpdateSmtp(e, 'host')}
                />
              </Paper>
              <Paper component="div" className={classes.createInput}>
                <label> Port:</label>
                <InputBase
                  name="port"
                  value={smtp?.port || ''}
                  className={classes.input}
                  style={{ color: '#fff' }}
                  onChange={(e) => handleUpdateSmtp(e, 'port')}
                />
              </Paper>
              <Paper component="div" className={classes.createInput}>
                <label>Secure</label>
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
            <Typography>Auth</Typography>
            <Paper variant="outlined" square className={classes.Paper}>
              <Paper component="div" className={classes.createInput}>
                <label> User Name: </label>
                <InputBase
                  name="user"
                  className={classes.input}
                  value={auth?.user || ''}
                  style={{ color: '#fff' }}
                  onChange={(e) => handleUpdateAuth(e, 'user')}
                />
              </Paper>
              <Paper component="div" className={classes.createInput}>
                <label> Password:</label>
                <InputBase
                  name="pass"
                  className={classes.input}
                  type={showPassword ? 'text' : 'password'}
                  value={auth?.pass || ''}
                  style={{ color: '#fff' }}
                  onChange={(e) => handleUpdateAuth(e, 'pass')}
                />
                <IconButton size="large" onClick={() => setShowPassword(!showPassword)}>
                  <Icon color="orange" icon="ic:baseline-visibility-off" />
                </IconButton>
              </Paper>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>From</Typography>
            <Paper variant="outlined" square className={classes.Paper}>
              <Paper component="div" className={classes.createInput}>
                <label> From:</label>
                <InputBase
                  name="from"
                  className={classes.input}
                  style={{ color: '#fff' }}
                  value={from || ''}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </Paper>
            </Paper>
            <Divider />
            <Typography>Subject</Typography>
            <Paper variant="outlined" square className={classes.Paper}>
              <Paper component="div" className={classes.createInput}>
                <label>login: </label>
                <InputBase
                  name="login"
                  value={subject?.login || ''}
                  className={classes.input}
                  style={{ color: '#fff' }}
                  onChange={(e) => handleUpdateSubject(e, 'login')}
                />
              </Paper>
              <Paper component="div" className={classes.createInput}>
                <label> friend:</label>
                <InputBase
                  name="friend"
                  value={subject?.friend || ''}
                  className={classes.input}
                  style={{ color: '#fff' }}
                  onChange={(e) => handleUpdateSubject(e, 'friend')}
                />
              </Paper>
              <Paper component="div" className={classes.createInput}>
                <label> group:</label>
                <InputBase
                  name=" group"
                  value={subject?.group || ''}
                  className={classes.input}
                  style={{ color: '#fff' }}
                  onChange={(e) => handleUpdateSubject(e, 'group')}
                />
              </Paper>
              <Paper component="div" className={classes.createInput}>
                <label> Party:</label>
                <InputBase
                  name=" party"
                  value={subject?.party || ''}
                  className={classes.input}
                  style={{ color: '#fff' }}
                  onChange={(e) => handleUpdateSubject(e, 'party')}
                />
              </Paper>
              <Paper component="div" className={classes.createInput}>
                <label> SMS Name Character Limit:</label>
                <InputBase
                  disabled
                  name=" smsNameCharacterLimit"
                  className={classes.input}
                  value={emailSetting?.smsNameCharacterLimit}
                  style={{ color: '#fff' }}
                />
              </Paper>
            </Paper>
          </Grid>
        </Grid>
        <Button variant="outlined" type="submit" style={{ color: '#fff' }} onClick={handleCancel}>
          Cancel
        </Button>{' '}
        &nbsp;&nbsp;
        <Button variant="contained" type="submit" onClick={handleSubmit}>
          save
        </Button>
      </form>
    </div>
  )
}

export default Email
