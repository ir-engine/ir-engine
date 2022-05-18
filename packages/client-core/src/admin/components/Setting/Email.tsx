import React, { useEffect } from 'react'
import { Grid, Typography, Paper, Divider, Button } from '@mui/material'
import { useStyles } from './styles'
import InputBase from '@mui/material/InputBase'
import Switch from '@mui/material/Switch'
import { Icon } from '@iconify/react'
import IconButton from '@mui/material/IconButton'
import { useDispatch } from '../../../store'
import { useEmailSettingState } from '../../services/Setting/EmailSettingService'
import { EmailSettingService } from '../../services/Setting/EmailSettingService'
import { useAuthState } from '../../../user/services/AuthService'

interface emailProps {}

const Email = (props: emailProps) => {
  const classes = useStyles()
  const emailSettingState = useEmailSettingState()
  const emailSetting = emailSettingState?.email?.value || []
  const dispatch = useDispatch()
  const [secure, setSecure] = React.useState({
    checkedA: true,
    checkedB: true
  })
  const handleSave = (e) => {
    e.preventDefault()
  }

  const authState = useAuthState()
  const user = authState.user
  const handleSecure = (event) => {
    setSecure({ ...secure, [event.target.name]: event.target.checked })
  }

  useEffect(() => {
    if (user?.id?.value != null && emailSettingState?.updateNeeded?.value === true) {
      EmailSettingService.fetchedEmailSettings()
    }
  }, [authState])

  return (
    <div>
      <form onSubmit={handleSave}>
        <Typography component="h1" className={classes.settingsHeading}>
          EMAIL
        </Typography>
        {emailSetting.map((el) => (
          <Grid container spacing={3} key={el.id}>
            <Grid item xs={12} sm={6}>
              <Typography>SMTP</Typography>
              <Paper variant="outlined" square className={classes.Paper}>
                <Paper component="div" className={classes.createInput}>
                  <label> Host:</label>
                  <InputBase
                    name="host"
                    className={classes.input}
                    disabled
                    value={el.smtp.host}
                    style={{ color: '#fff' }}
                  />
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label> Port:</label>
                  <InputBase
                    name="port"
                    value={el.smtp.port}
                    className={classes.input}
                    disabled
                    style={{ color: '#fff' }}
                  />
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label>Secure</label>
                  <Switch
                    disabled
                    checked={secure.checkedB}
                    onChange={handleSecure}
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
                    value={el.smtp.auth.user}
                    disabled
                    style={{ color: '#fff' }}
                  />
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label> Password:</label>
                  <InputBase
                    name="pass"
                    className={classes.input}
                    type="password"
                    value={el.smtp.auth.pass}
                    disabled
                    style={{ color: '#fff' }}
                  />
                  <IconButton size="large">
                    <Icon icon="ic:baseline-visibility-off" color="orange" />
                  </IconButton>
                </Paper>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>From</Typography>
              <Paper variant="outlined" square className={classes.Paper}>
                <Paper component="div" className={classes.createInput}>
                  <label> From:</label>
                  <InputBase name="from" className={classes.input} style={{ color: '#fff' }} value={el.from} />
                </Paper>
              </Paper>
              <Divider />
              <Typography>Subject</Typography>
              <Paper variant="outlined" square className={classes.Paper}>
                <Paper component="div" className={classes.createInput}>
                  <label>login: </label>
                  <InputBase
                    name="login"
                    value={el.subject.login}
                    className={classes.input}
                    style={{ color: '#fff' }}
                  />
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label> friend:</label>
                  <InputBase
                    name="friend"
                    value={el.subject.friend}
                    className={classes.input}
                    style={{ color: '#fff' }}
                  />
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label> group:</label>
                  <InputBase
                    name=" group"
                    value={el.subject.group}
                    className={classes.input}
                    style={{ color: '#fff' }}
                  />
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label> Party:</label>
                  <InputBase
                    name=" party"
                    value={el.subject.party}
                    className={classes.input}
                    style={{ color: '#fff' }}
                  />
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label> SMS Name Character Limit:</label>
                  <InputBase
                    disabled
                    name=" smsNameCharacterLimit"
                    className={classes.input}
                    value={el.smsNameCharacterLimit}
                    style={{ color: '#fff' }}
                  />
                </Paper>
              </Paper>
            </Grid>
          </Grid>
        ))}
        <Button variant="outlined" type="submit" style={{ color: '#fff' }}>
          Cancel
        </Button>{' '}
        &nbsp;&nbsp;
        <Button variant="contained" type="submit">
          save
        </Button>
      </form>
    </div>
  )
}

export default Email
