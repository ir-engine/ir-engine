import React, { useEffect } from 'react'
import { Grid, Paper, Button, Typography } from '@material-ui/core'
import InputBase from '@material-ui/core/InputBase'
import { useStyles } from './styles'
import { useAuthState } from '../../../user/state/AuthService'
import { useAdminAuthSettingState } from '../../state/Setting/AuthSettingService'
import { AuthSettingService } from '../../state/Setting/AuthSettingService'
import { useDispatch } from '../../../store'
import Switch from '@material-ui/core/Switch'
import IconButton from '@material-ui/core/IconButton'
import { Icon } from '@iconify/react'

interface Props {}
const initialState = {
  jwt: true,
  local: true,
  facebook: true,
  github: true,
  google: true,
  linkedin: true,
  twitter: true
}
const Account = (props: Props) => {
  const classes = useStyles()
  const authSettingState = useAdminAuthSettingState()
  const [authSetting] = authSettingState?.authSettings?.authSettings?.value || []
  const id = authSetting?.id
  const dispatch = useDispatch()
  const [state, setState] = React.useState(initialState)
  const [holdAuth, setHoldAuth] = React.useState(initialState)
  const [showPassword, setShowPassword] = React.useState({
    facebook: {
      key: false,
      secret: false
    },
    github: {
      key: false,
      secret: false
    },
    google: {
      key: false,
      secret: false
    },
    linkedin: {
      key: false,
      secret: false
    },
    twitter: {
      key: false,
      secret: false
    },
    password: {
      secret: false
    }
  })

  const handleShowPassword = (key) => {
    const [social, value] = key.split('-')
    setShowPassword({
      ...showPassword,
      [social]: {
        ...showPassword[social],
        [value]: !showPassword[social][value]
      }
    })
  }
  const authState = useAuthState()
  const user = authState.user

  useEffect(() => {
    if (user?.id?.value != null && authSettingState.authSettings.updateNeeded.value) {
      AuthSettingService.fetchAuthSetting()
    }
  }, [authState.user?.id?.value])

  useEffect(() => {
    if (authSetting) {
      let temp = { ...state }
      authSetting?.authStrategies?.forEach((el) => {
        Object.entries(el).forEach(([strategyName, strategy]) => {
          temp[strategyName] = strategy
        })
      })
      setState(temp)
      setHoldAuth(temp)
    }
  }, [authSettingState?.authSettings?.updateNeeded?.value])

  const handleSubmit = () => {
    const auth = Object.keys(state).map((prop) => ({ [prop]: state[prop] }))
    AuthSettingService.pathAuthSetting({ authStrategies: JSON.stringify(auth) }, id)
  }
  const handleCancel = () => {
    let temp = { ...state }
    authSetting?.authStrategies?.forEach((el) => {
      Object.entries(el).forEach(([strategyName, strategy]) => {
        temp[strategyName] = strategy
      })
    })
    setState(temp)
  }

  const onSwitchHandle = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked })
  }

  return (
    <div className={`${classes.root} ${classes.container}`}>
      <Typography component="h1" className={classes.settingsHeading}>
        {' '}
        AUTHENTICATION
      </Typography>

      <form autoComplete="off" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={6} sm={4}>
            <label> Service</label>
            <Paper component="div" className={classes.createInput}>
              <InputBase
                value={authSetting?.service || ''}
                name="service"
                style={{ color: '#fff' }}
                disabled
                className={classes.input}
              />
            </Paper>
            <label>Secret</label>
            <Paper component="div" className={classes.createInput}>
              <InputBase
                value={authSetting?.secret || ''}
                name="secret"
                style={{ color: '#fff' }}
                disabled
                className={classes.input}
              />
            </Paper>
            <label>Entity</label>
            <Paper component="div" className={classes.createInput}>
              <InputBase
                value={authSetting?.entity || ''}
                name="entity"
                style={{ color: '#fff' }}
                disabled
                className={classes.input}
              />
            </Paper>
            <Typography component="h1" className={classes.settingsHeading}>
              Authentication Strategies
            </Typography>

            {authSetting?.authStrategies.map((el, i) => {
              return Object.entries(el).map(([strategyName, strategy]) => (
                <React.Fragment key={i}>
                  <Paper component="div" className={classes.createInput} style={{ height: '2.5rem' }}>
                    <Grid container direction="row" justifyContent="space-between" alignItems="stretch">
                      <label>{strategyName}</label>
                      <Switch
                        // disabled
                        checked={state[strategyName]}
                        color="primary"
                        name={strategyName}
                        disabled={strategyName === 'jwt' ? true : false}
                        onChange={onSwitchHandle}
                        inputProps={{ 'aria-label': 'primary checkbox' }}
                      />
                    </Grid>
                  </Paper>
                </React.Fragment>
              ))
            })}
          </Grid>

          <Grid item xs={12} sm={4}>
            <label>Local</label>
            <Paper component="div" className={classes.createInput}>
              <label>User Name:</label>
              <InputBase
                value={authSetting?.local.usernameField || ''}
                name="username"
                style={{ color: '#fff' }}
                disabled
                className={classes.input}
              />
            </Paper>
            <Paper component="div" className={classes.createInput}>
              <label>Password:</label>
              <InputBase
                value={authSetting?.local.passwordField || ''}
                name="password"
                style={{ color: '#fff' }}
                disabled
                className={classes.input}
                type={showPassword.password.secret ? 'text' : 'password'}
              />
              <IconButton onClick={() => handleShowPassword('password-secret')}>
                <Icon
                  icon={showPassword.password.secret ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                  color="orange"
                />
              </IconButton>
            </Paper>

            <Typography component="h1" className={classes.settingsHeading}>
              OAUTH
            </Typography>
            <label>Defaults</label>
            <Paper component="div" className={classes.createInput}>
              <label>Host:</label>
              <InputBase
                value={authSetting?.oauth?.defaults?.host || ''}
                name="host"
                style={{ color: '#fff' }}
                disabled
                className={classes.input}
              />
            </Paper>
            <Paper component="div" className={classes.createInput}>
              <label>Protocol:</label>
              <InputBase
                value={authSetting?.oauth?.defaults?.protocol || ''}
                name="protocol"
                style={{ color: '#fff' }}
                disabled
                className={classes.input}
              />
            </Paper>
            {holdAuth?.facebook && (
              <Paper className={classes.Paper} elevation={0}>
                <label style={{ color: '#fff' }}>Facebook</label>
                <Paper component="div" className={classes.createInput}>
                  <label>Key:</label>
                  <InputBase
                    value={authSetting?.oauth?.facebook?.key || ''}
                    name="key"
                    style={{ color: '#fff' }}
                    disabled
                    className={classes.input}
                    type={showPassword.facebook.key ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('facebook-key')}>
                    <Icon
                      icon={showPassword.facebook.key ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                      color="orange"
                    />
                  </IconButton>
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label>Secret:</label>
                  <InputBase
                    value={authSetting?.oauth?.facebook?.secret || ''}
                    name="secret"
                    style={{ color: '#fff' }}
                    disabled
                    className={classes.input}
                    type={showPassword.facebook.secret ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('facebook-secret')}>
                    <Icon
                      icon={showPassword.facebook.secret ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                      color="orange"
                    />
                  </IconButton>
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label>Callback:</label>
                  <InputBase
                    value={authSetting?.callback?.facebook || ''}
                    name="callbackGithub"
                    style={{ color: '#fff' }}
                    disabled
                    className={classes.input}
                  />
                </Paper>
              </Paper>
            )}
            {holdAuth?.github && (
              <Paper className={classes.Paper} style={{ marginTop: '10px' }} elevation={0}>
                <label style={{ color: '#fff' }}>Github</label>
                <Paper component="div" className={classes.createInput}>
                  <label>Key:</label>
                  <InputBase
                    value={authSetting?.oauth?.github?.key || ''}
                    name="key"
                    style={{ color: '#fff' }}
                    disabled
                    className={classes.input}
                    type={showPassword.github.key ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('github-key')}>
                    <Icon
                      icon={showPassword.github.key ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                      color="orange"
                    />
                  </IconButton>
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label>Secret:</label>
                  <InputBase
                    value={authSetting?.oauth?.github.secret || ''}
                    name="secret"
                    style={{ color: '#fff' }}
                    disabled
                    className={classes.input}
                    type={showPassword.github.secret ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('github-secret')}>
                    <Icon
                      icon={showPassword.github.secret ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                      color="orange"
                    />
                  </IconButton>
                </Paper>

                <Paper component="div" className={classes.createInput}>
                  <label>Callback:</label>
                  <InputBase
                    value={authSetting?.callback?.github || ''}
                    name="callbackGithub"
                    style={{ color: '#fff' }}
                    disabled
                    className={classes.input}
                  />
                </Paper>
              </Paper>
            )}
          </Grid>
          <Grid item xs={12} sm={4}>
            {holdAuth?.google && (
              <Paper className={classes.Paper} style={{ marginBottom: '10px' }} elevation={0}>
                <label style={{ color: '#fff' }}>Google</label>
                <Paper component="div" className={classes.createInput}>
                  <label>Key:</label>
                  <InputBase
                    type={showPassword.google.key ? 'text' : 'password'}
                    value={authSetting?.oauth?.google.key || ''}
                    name="key"
                    style={{ color: '#fff' }}
                    disabled
                    className={classes.input}
                  />

                  <IconButton onClick={() => handleShowPassword('google-key')}>
                    <Icon
                      icon={showPassword.google.key ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                      color="orange"
                    />
                  </IconButton>
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label>Secret:</label>
                  <InputBase
                    value={authSetting?.oauth?.google?.secret || ''}
                    name="secret"
                    style={{ color: '#fff' }}
                    disabled
                    className={classes.input}
                    type={showPassword.google.secret ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('google-secret')}>
                    <Icon
                      icon={showPassword.google.secret ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                      color="orange"
                    />
                  </IconButton>
                </Paper>

                <Paper component="div" className={classes.createInput}>
                  <label>Callback:</label>
                  <InputBase
                    value={authSetting?.callback?.google || ''}
                    name="callbackGoogle"
                    style={{ color: '#fff' }}
                    disabled
                    className={classes.input}
                  />
                </Paper>
              </Paper>
            )}

            {holdAuth?.linkedin && (
              <Paper className={classes.Paper} style={{ marginBottom: '10px' }} elevation={0}>
                <label style={{ color: '#fff' }}>LinkedIn</label>
                <Paper component="div" className={classes.createInput}>
                  <label>Key:</label>
                  <InputBase
                    value={authSetting?.oauth?.linkedin?.key || ''}
                    name="key"
                    style={{ color: '#fff' }}
                    disabled
                    className={classes.input}
                    type={showPassword.linkedin.key ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('linkedin-key')}>
                    <Icon
                      icon={showPassword.linkedin.key ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                      color="orange"
                    />
                  </IconButton>
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label>Secret:</label>
                  <InputBase
                    value={authSetting?.oauth?.linkedin?.secret || ''}
                    name="secret"
                    style={{ color: '#fff' }}
                    disabled
                    className={classes.input}
                    type={showPassword.linkedin.secret ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('linkedin-secret')}>
                    <Icon
                      icon={showPassword.linkedin.secret ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                      color="orange"
                    />
                  </IconButton>
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label>Callback:</label>
                  <InputBase
                    value={authSetting?.callback?.linkedin || ''}
                    name="callbackLinkedin"
                    style={{ color: '#fff' }}
                    disabled
                    className={classes.input}
                  />
                </Paper>
              </Paper>
            )}

            {holdAuth?.twitter && (
              <Paper className={classes.Paper} elevation={0} style={{ marginBottom: '10px' }}>
                <label style={{ color: '#ffff' }}>Twitter</label>
                <Paper component="div" className={classes.createInput}>
                  <label>Key:</label>
                  <InputBase
                    value={authSetting?.oauth?.twitter?.key || ''}
                    name="key"
                    style={{ color: '#fff' }}
                    disabled
                    className={classes.input}
                    type={showPassword.twitter.key ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('twitter-key')}>
                    <Icon
                      icon={showPassword.twitter.key ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                      color="orange"
                    />
                  </IconButton>
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label>Secret:</label>
                  <InputBase
                    value={authSetting?.oauth?.twitter?.secret || ''}
                    name="secret"
                    style={{ color: '#fff' }}
                    disabled
                    className={classes.input}
                    type={showPassword.twitter.secret ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('twitter-secret')}>
                    <Icon
                      icon={showPassword.twitter.secret ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                      color="orange"
                    />
                  </IconButton>
                </Paper>

                <Paper component="div" className={classes.createInput}>
                  <label>Callback:</label>
                  <InputBase
                    value={authSetting?.callback?.twitter || ''}
                    name="callbackTwitter"
                    style={{ color: '#fff' }}
                    disabled
                    className={classes.input}
                  />
                </Paper>
              </Paper>
            )}
          </Grid>
        </Grid>
        <Button variant="outlined" style={{ color: '#fff' }} onClick={handleCancel}>
          Cancel
        </Button>
        &nbsp; &nbsp;
        <Button variant="contained" onClick={handleSubmit}>
          Save
        </Button>
      </form>
    </div>
  )
}

export default Account
