import React, { useState, useEffect } from 'react'
import { Grid, Paper, Button, Typography } from '@mui/material'
import InputBase from '@mui/material/InputBase'
import { useStyles } from './styles'
import { useAuthState } from '../../../user/services/AuthService'
import { useAdminAuthSettingState } from '../../services/Setting/AuthSettingService'
import { AuthSettingService } from '../../services/Setting/AuthSettingService'
import Switch from '@mui/material/Switch'
import IconButton from '@mui/material/IconButton'
import { Icon } from '@iconify/react'

interface Props {}

const initialState = {
  jwt: true,
  local: false,
  facebook: false,
  github: false,
  google: false,
  linkedin: false,
  twitter: false,
  smsMagicLink: false,
  emailMagicLink: false
}

const OAUTH_TYPES = {
  FACEBOOK: 'facebook',
  GITHUB: 'github',
  GOOGLE: 'google',
  LINKEDIN: 'linkedin',
  TWITTER: 'twitter'
}

const Account = (props: Props) => {
  const classes = useStyles()
  const authSettingState = useAdminAuthSettingState()
  const [authSetting] = authSettingState?.authSettings?.value || []
  const id = authSetting?.id
  const [state, setState] = useState(initialState)
  const [holdAuth, setHoldAuth] = useState(initialState)
  const [keySecret, setKeySecret] = useState({
    github: authSetting?.oauth.github,
    google: authSetting?.oauth.google,
    twitter: authSetting?.oauth.twitter,
    linkedin: authSetting?.oauth.linkedin,
    facebook: authSetting?.oauth.facebook
  })
  const [showPassword, setShowPassword] = useState({
    facebook: {
      key: false,
      secret: false
    },
    github: {
      appid: false,
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
    if (user?.id?.value != null && authSettingState?.updateNeeded?.value) {
      AuthSettingService.fetchAuthSetting()
    }
  }, [authState?.user?.id?.value, authSettingState?.updateNeeded?.value])

  useEffect(() => {
    if (authSetting) {
      let temp = { ...initialState }
      authSetting?.authStrategies?.forEach((el) => {
        Object.entries(el).forEach(([strategyName, strategy]) => {
          temp[strategyName] = strategy
        })
      })
      setState(temp)
      setHoldAuth(temp)

      let tempKeySecret = JSON.parse(
        JSON.stringify({
          github: authSetting?.oauth.github,
          google: authSetting?.oauth.google,
          twitter: authSetting?.oauth.twitter,
          linkedin: authSetting?.oauth.linkedin,
          facebook: authSetting?.oauth.facebook
        })
      )
      setKeySecret(tempKeySecret)
    }
  }, [authSettingState?.updateNeeded?.value])

  const handleSubmit = () => {
    const auth = Object.keys(state)
      .filter((item) => (state[item] ? item : null))
      .filter(Boolean)
      .map((prop) => ({ [prop]: state[prop] }))

    const oauth = { ...authSetting.oauth, ...keySecret }

    for (let key of Object.keys(oauth)) {
      oauth[key] = JSON.stringify(oauth[key])
    }

    AuthSettingService.patchAuthSetting({ authStrategies: JSON.stringify(auth), oauth: JSON.stringify(oauth) }, id)
  }

  const handleCancel = () => {
    let temp = { ...initialState }
    authSetting?.authStrategies?.forEach((el) => {
      Object.entries(el).forEach(([strategyName, strategy]) => {
        temp[strategyName] = strategy
      })
    })

    let tempKeySecret = JSON.parse(
      JSON.stringify({
        github: authSetting?.oauth.github,
        google: authSetting?.oauth.google,
        twitter: authSetting?.oauth.twitter,
        linkedin: authSetting?.oauth.linkedin,
        facebook: authSetting?.oauth.facebook
      })
    )
    setKeySecret(tempKeySecret)
    setState(temp)
  }

  const handleOnChangeAppId = (event, type) => {
    setKeySecret({
      ...keySecret,
      [type]: {
        ...keySecret[type],
        appid: event.target.value
      }
    })
  }

  const handleOnChangeKey = (event, type) => {
    setKeySecret({
      ...keySecret,
      [type]: {
        ...keySecret[type],
        key: event.target.value
      }
    })
  }

  const handleOnChangeSecret = (event, type) => {
    setKeySecret({
      ...keySecret,
      [type]: {
        ...keySecret[type],
        secret: event.target.value
      }
    })
  }

  const onSwitchHandle = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked })
  }

  return (
    <div className={`${classes.root} ${classes.container}`}>
      <Typography component="h1" className={classes.settingsHeading}>
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
            {Object.keys(state).map((strategyName, i) => (
              <React.Fragment key={i}>
                <Paper component="div" className={classes.createInput} style={{ height: '2.5rem' }}>
                  <Grid container direction="row" justifyContent="space-between" alignItems="stretch">
                    <label>{strategyName}</label>
                    <Switch
                      checked={state[strategyName]}
                      color="primary"
                      name={strategyName}
                      disabled={strategyName === 'jwt'}
                      onChange={onSwitchHandle}
                      inputProps={{ 'aria-label': 'primary checkbox' }}
                    />
                  </Grid>
                </Paper>
              </React.Fragment>
            ))}
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
              <IconButton onClick={() => handleShowPassword('password-secret')} size="large">
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
                    value={keySecret?.facebook?.key || ''}
                    name="key"
                    style={{ color: '#fff' }}
                    onChange={(e) => handleOnChangeKey(e, OAUTH_TYPES.FACEBOOK)}
                    className={classes.input}
                    type={showPassword.facebook.key ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('facebook-key')} size="large">
                    <Icon
                      icon={showPassword.facebook.key ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                      color="orange"
                    />
                  </IconButton>
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label>Secret:</label>
                  <InputBase
                    value={keySecret?.facebook?.secret || ''}
                    name="secret"
                    style={{ color: '#fff' }}
                    onChange={(e) => handleOnChangeSecret(e, OAUTH_TYPES.FACEBOOK)}
                    className={classes.input}
                    type={showPassword.facebook.secret ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('facebook-secret')} size="large">
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
                  <label>App ID:</label>
                  <InputBase
                    value={keySecret?.github?.appid || ''}
                    name="key"
                    style={{ color: '#fff' }}
                    onChange={(e) => handleOnChangeAppId(e, OAUTH_TYPES.GITHUB)}
                    className={classes.input}
                    type={showPassword.github.appid ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('github-appid')} size="large">
                    <Icon
                      icon={showPassword.github.appid ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                      color="orange"
                    />
                  </IconButton>
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label>Key:</label>
                  <InputBase
                    value={keySecret?.github?.key || ''}
                    name="key"
                    style={{ color: '#fff' }}
                    onChange={(e) => handleOnChangeKey(e, OAUTH_TYPES.GITHUB)}
                    className={classes.input}
                    type={showPassword.github.key ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('github-key')} size="large">
                    <Icon
                      icon={showPassword.github.key ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                      color="orange"
                    />
                  </IconButton>
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label>Secret:</label>
                  <InputBase
                    value={keySecret?.github?.secret || ''}
                    name="secret"
                    style={{ color: '#fff' }}
                    onChange={(e) => handleOnChangeSecret(e, OAUTH_TYPES.GITHUB)}
                    className={classes.input}
                    type={showPassword.github.secret ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('github-secret')} size="large">
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
                    value={keySecret?.google?.key || ''}
                    name="key"
                    style={{ color: '#fff' }}
                    onChange={(e) => handleOnChangeKey(e, OAUTH_TYPES.GOOGLE)}
                    className={classes.input}
                  />

                  <IconButton onClick={() => handleShowPassword('google-key')} size="large">
                    <Icon
                      icon={showPassword.google.key ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                      color="orange"
                    />
                  </IconButton>
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label>Secret:</label>
                  <InputBase
                    value={keySecret?.google?.secret || ''}
                    name="secret"
                    style={{ color: '#fff' }}
                    onChange={(e) => handleOnChangeSecret(e, OAUTH_TYPES.GOOGLE)}
                    className={classes.input}
                    type={showPassword.google.secret ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('google-secret')} size="large">
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
                    value={keySecret?.linkedin?.key || ''}
                    name="key"
                    style={{ color: '#fff' }}
                    onChange={(e) => handleOnChangeKey(e, OAUTH_TYPES.LINKEDIN)}
                    className={classes.input}
                    type={showPassword.linkedin.key ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('linkedin-key')} size="large">
                    <Icon
                      icon={showPassword.linkedin.key ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                      color="orange"
                    />
                  </IconButton>
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label>Secret:</label>
                  <InputBase
                    value={keySecret?.linkedin?.secret || ''}
                    name="secret"
                    style={{ color: '#fff' }}
                    onChange={(e) => handleOnChangeSecret(e, OAUTH_TYPES.LINKEDIN)}
                    className={classes.input}
                    type={showPassword.linkedin.secret ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('linkedin-secret')} size="large">
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
                    value={keySecret?.twitter?.key || ''}
                    name="key"
                    style={{ color: '#fff' }}
                    onChange={(e) => handleOnChangeKey(e, OAUTH_TYPES.TWITTER)}
                    className={classes.input}
                    type={showPassword.twitter.key ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('twitter-key')} size="large">
                    <Icon
                      icon={showPassword.twitter.key ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                      color="orange"
                    />
                  </IconButton>
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label>Secret:</label>
                  <InputBase
                    value={keySecret?.twitter?.secret || ''}
                    name="secret"
                    style={{ color: '#fff' }}
                    onChange={(e) => handleOnChangeSecret(e, OAUTH_TYPES.TWITTER)}
                    className={classes.input}
                    type={showPassword.twitter.secret ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('twitter-secret')} size="large">
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
