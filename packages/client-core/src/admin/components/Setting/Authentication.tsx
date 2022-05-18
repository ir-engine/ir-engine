import { Icon } from '@iconify/react'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button, Grid, Paper, Typography } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import Switch from '@mui/material/Switch'

import { useAuthState } from '../../../user/services/AuthService'
import { AuthSettingService, useAdminAuthSettingState } from '../../services/Setting/AuthSettingService'
import styles from '../../styles/settings.module.scss'

interface Props {}

const initialState = {
  jwt: true,
  local: false,
  discord: false,
  facebook: false,
  github: false,
  google: false,
  linkedin: false,
  twitter: false,
  smsMagicLink: false,
  emailMagicLink: false
}

const OAUTH_TYPES = {
  DISCORD: 'discord',
  FACEBOOK: 'facebook',
  GITHUB: 'github',
  GOOGLE: 'google',
  LINKEDIN: 'linkedin',
  TWITTER: 'twitter'
}

const Account = (props: Props) => {
  const authSettingState = useAdminAuthSettingState()
  const [authSetting] = authSettingState?.authSettings?.value || []
  const id = authSetting?.id
  const { t } = useTranslation()
  const [state, setState] = useState(initialState)
  const [holdAuth, setHoldAuth] = useState(initialState)
  const [keySecret, setKeySecret] = useState({
    discord: authSetting?.oauth.discord,
    github: authSetting?.oauth.github,
    google: authSetting?.oauth.google,
    twitter: authSetting?.oauth.twitter,
    linkedin: authSetting?.oauth.linkedin,
    facebook: authSetting?.oauth.facebook
  })
  const [showPassword, setShowPassword] = useState({
    discord: {
      key: false,
      secret: false
    },
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
          discord: authSetting?.oauth.discord,
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
        discord: authSetting?.oauth.discord,
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
    <div className={`${styles.root} ${styles.container}`}>
      <Typography component="h1" className={styles.settingsHeading}>
        {t('admin:components.setting.authentication')}
      </Typography>
      <form autoComplete="off" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <label> {t('admin:components.setting.service')}</label>
            <Paper component="div" className={styles.createInput}>
              <InputBase value={authSetting?.service || ''} name="service" disabled className={styles.input} />
            </Paper>
            <label>{t('admin:components.setting.secret')}</label>
            <Paper component="div" className={styles.createInput}>
              <InputBase value={authSetting?.secret || ''} name="secret" disabled className={styles.input} />
            </Paper>
            <label>{t('admin:components.setting.entity')}</label>
            <Paper component="div" className={styles.createInput}>
              <InputBase value={authSetting?.entity || ''} name="entity" disabled className={styles.input} />
            </Paper>
            <Typography component="h1" className={styles.settingsHeading}>
              {t('admin:components.setting.authStrategies')}
            </Typography>
            {Object.keys(state).map((strategyName, i) => (
              <React.Fragment key={i}>
                <Paper component="div" className={styles.createInput} style={{ height: '2.5rem' }}>
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
          <Grid item xs={12} sm={6} md={4}>
            <label>{t('admin:components.setting.local')}</label>
            <Paper component="div" className={styles.createInput}>
              <label>{t('admin:components.setting.userName')}:</label>
              <InputBase
                value={authSetting?.local.usernameField || ''}
                name="username"
                disabled
                className={styles.input}
              />
            </Paper>
            <Paper component="div" className={styles.createInput}>
              <label>{t('admin:components.setting.password')}:</label>
              <InputBase
                value={authSetting?.local.passwordField || ''}
                name="password"
                disabled
                className={styles.input}
                type={showPassword.password.secret ? 'text' : 'password'}
              />
              <IconButton onClick={() => handleShowPassword('password-secret')} size="large">
                <Icon
                  icon={showPassword.password.secret ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                  color="orange"
                />
              </IconButton>
            </Paper>

            <Typography component="h1" className={styles.settingsHeading}>
              {t('admin:components.setting.oauth')}
            </Typography>
            <label>{t('admin:components.setting.defaults')}</label>
            <Paper component="div" className={styles.createInput}>
              <label>{t('admin:components.setting.host')}:</label>
              <InputBase
                value={authSetting?.oauth?.defaults?.host || ''}
                name="host"
                disabled
                className={styles.input}
              />
            </Paper>
            <Paper component="div" className={styles.createInput}>
              <label>{t('admin:components.setting.protocol')}:</label>
              <InputBase
                value={authSetting?.oauth?.defaults?.protocol || ''}
                name="protocol"
                disabled
                className={styles.input}
              />
            </Paper>
            {holdAuth?.discord && (
              <Paper className={styles.Paper} elevation={0}>
                <label>{t('admin:components.setting.discord')}</label>
                <Paper component="div" className={styles.createInput}>
                  <label>{t('admin:components.setting.key')}:</label>
                  <InputBase
                    value={keySecret?.discord?.key || ''}
                    name="key"
                    onChange={(e) => handleOnChangeKey(e, OAUTH_TYPES.DISCORD)}
                    className={styles.input}
                    type={showPassword.discord.key ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('discord-key')} size="large">
                    <Icon
                      icon={showPassword.discord.key ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                      color="orange"
                    />
                  </IconButton>
                </Paper>
                <Paper component="div" className={styles.createInput}>
                  <label>{t('admin:components.setting.secret')}:</label>
                  <InputBase
                    value={keySecret?.discord?.secret || ''}
                    name="secret"
                    onChange={(e) => handleOnChangeSecret(e, OAUTH_TYPES.DISCORD)}
                    className={styles.input}
                    type={showPassword.discord.secret ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('discord-secret')} size="large">
                    <Icon
                      icon={showPassword.discord.secret ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                      color="orange"
                    />
                  </IconButton>
                </Paper>
                <Paper component="div" className={styles.createInput}>
                  <label>{t('admin:components.setting.callback')}:</label>
                  <InputBase
                    value={authSetting?.callback?.discord || ''}
                    name="callbackGithub"
                    disabled
                    className={styles.input}
                  />
                </Paper>
              </Paper>
            )}
            {holdAuth?.facebook && (
              <Paper className={styles.Paper} elevation={0}>
                <label>{t('admin:components.setting.facebook')}</label>
                <Paper component="div" className={styles.createInput}>
                  <label>{t('admin:components.setting.key')}:</label>
                  <InputBase
                    value={keySecret?.facebook?.key || ''}
                    name="key"
                    onChange={(e) => handleOnChangeKey(e, OAUTH_TYPES.FACEBOOK)}
                    className={styles.input}
                    type={showPassword.facebook.key ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('facebook-key')} size="large">
                    <Icon
                      icon={showPassword.facebook.key ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                      color="orange"
                    />
                  </IconButton>
                </Paper>
                <Paper component="div" className={styles.createInput}>
                  <label>{t('admin:components.setting.secret')}</label>
                  <InputBase
                    value={keySecret?.facebook?.secret || ''}
                    name="secret"
                    onChange={(e) => handleOnChangeSecret(e, OAUTH_TYPES.FACEBOOK)}
                    className={styles.input}
                    type={showPassword.facebook.secret ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('facebook-secret')} size="large">
                    <Icon
                      icon={showPassword.facebook.secret ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                      color="orange"
                    />
                  </IconButton>
                </Paper>
                <Paper component="div" className={styles.createInput}>
                  <label>{t('admin:components.setting.callback')}:</label>
                  <InputBase
                    value={authSetting?.callback?.facebook || ''}
                    name="callbackGithub"
                    disabled
                    className={styles.input}
                  />
                </Paper>
              </Paper>
            )}
            {holdAuth?.github && (
              <Paper className={styles.Paper} style={{ marginTop: '10px' }} elevation={0}>
                <label>{t('admin:components.setting.github')}</label>
                <Paper component="div" className={styles.createInput}>
                  <label>{t('admin:components.setting.appId')}:</label>
                  <InputBase
                    value={keySecret?.github?.appid || ''}
                    name="key"
                    onChange={(e) => handleOnChangeAppId(e, OAUTH_TYPES.GITHUB)}
                    className={styles.input}
                    type={showPassword.github.appid ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('github-appid')} size="large">
                    <Icon
                      icon={showPassword.github.appid ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                      color="orange"
                    />
                  </IconButton>
                </Paper>
                <Paper component="div" className={styles.createInput}>
                  <label>{t('admin:components.setting.key')}:</label>
                  <InputBase
                    value={keySecret?.github?.key || ''}
                    name="key"
                    onChange={(e) => handleOnChangeKey(e, OAUTH_TYPES.GITHUB)}
                    className={styles.input}
                    type={showPassword.github.key ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('github-key')} size="large">
                    <Icon
                      icon={showPassword.github.key ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                      color="orange"
                    />
                  </IconButton>
                </Paper>
                <Paper component="div" className={styles.createInput}>
                  <label>{t('admin:components.setting.secret')}:</label>
                  <InputBase
                    value={keySecret?.github?.secret || ''}
                    name="secret"
                    onChange={(e) => handleOnChangeSecret(e, OAUTH_TYPES.GITHUB)}
                    className={styles.input}
                    type={showPassword.github.secret ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('github-secret')} size="large">
                    <Icon
                      icon={showPassword.github.secret ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                      color="orange"
                    />
                  </IconButton>
                </Paper>

                <Paper component="div" className={styles.createInput}>
                  <label>{t('admin:components.setting.callback')}:</label>
                  <InputBase
                    value={authSetting?.callback?.github || ''}
                    name="callbackGithub"
                    disabled
                    className={styles.input}
                  />
                </Paper>
              </Paper>
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            {holdAuth?.google && (
              <Paper className={styles.Paper} style={{ marginBottom: '10px' }} elevation={0}>
                <label>{t('admin:components.setting.google')}</label>
                <Paper component="div" className={styles.createInput}>
                  <label>{t('admin:components.setting.key')}:</label>
                  <InputBase
                    type={showPassword.google.key ? 'text' : 'password'}
                    value={keySecret?.google?.key || ''}
                    name="key"
                    onChange={(e) => handleOnChangeKey(e, OAUTH_TYPES.GOOGLE)}
                    className={styles.input}
                  />

                  <IconButton onClick={() => handleShowPassword('google-key')} size="large">
                    <Icon
                      icon={showPassword.google.key ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                      color="orange"
                    />
                  </IconButton>
                </Paper>
                <Paper component="div" className={styles.createInput}>
                  <label>{t('admin:components.setting.secret')}:</label>
                  <InputBase
                    value={keySecret?.google?.secret || ''}
                    name="secret"
                    onChange={(e) => handleOnChangeSecret(e, OAUTH_TYPES.GOOGLE)}
                    className={styles.input}
                    type={showPassword.google.secret ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('google-secret')} size="large">
                    <Icon
                      icon={showPassword.google.secret ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                      color="orange"
                    />
                  </IconButton>
                </Paper>

                <Paper component="div" className={styles.createInput}>
                  <label>{t('admin:components.setting.callback')}:</label>
                  <InputBase
                    value={authSetting?.callback?.google || ''}
                    name="callbackGoogle"
                    disabled
                    className={styles.input}
                  />
                </Paper>
              </Paper>
            )}
            {holdAuth?.linkedin && (
              <Paper className={styles.Paper} style={{ marginBottom: '10px' }} elevation={0}>
                <label>{t('admin:components.setting.linkedIn')}</label>
                <Paper component="div" className={styles.createInput}>
                  <label>{t('admin:components.setting.key')}:</label>
                  <InputBase
                    value={keySecret?.linkedin?.key || ''}
                    name="key"
                    onChange={(e) => handleOnChangeKey(e, OAUTH_TYPES.LINKEDIN)}
                    className={styles.input}
                    type={showPassword.linkedin.key ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('linkedin-key')} size="large">
                    <Icon
                      icon={showPassword.linkedin.key ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                      color="orange"
                    />
                  </IconButton>
                </Paper>
                <Paper component="div" className={styles.createInput}>
                  <label>{t('admin:components.setting.secret')}:</label>
                  <InputBase
                    value={keySecret?.linkedin?.secret || ''}
                    name="secret"
                    onChange={(e) => handleOnChangeSecret(e, OAUTH_TYPES.LINKEDIN)}
                    className={styles.input}
                    type={showPassword.linkedin.secret ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('linkedin-secret')} size="large">
                    <Icon
                      icon={showPassword.linkedin.secret ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                      color="orange"
                    />
                  </IconButton>
                </Paper>
                <Paper component="div" className={styles.createInput}>
                  <label>{t('admin:components.setting.callback')}:</label>
                  <InputBase
                    value={authSetting?.callback?.linkedin || ''}
                    name="callbackLinkedin"
                    disabled
                    className={styles.input}
                  />
                </Paper>
              </Paper>
            )}
            {holdAuth?.twitter && (
              <Paper className={styles.Paper} elevation={0} style={{ marginBottom: '10px' }}>
                <label style={{ color: '#ffff' }}>{t('admin:components.setting.twitter')}</label>
                <Paper component="div" className={styles.createInput}>
                  <label>{t('admin:components.setting.key')}:</label>
                  <InputBase
                    value={keySecret?.twitter?.key || ''}
                    name="key"
                    onChange={(e) => handleOnChangeKey(e, OAUTH_TYPES.TWITTER)}
                    className={styles.input}
                    type={showPassword.twitter.key ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('twitter-key')} size="large">
                    <Icon
                      icon={showPassword.twitter.key ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                      color="orange"
                    />
                  </IconButton>
                </Paper>
                <Paper component="div" className={styles.createInput}>
                  <label>{t('admin:components.setting.secret')}:</label>
                  <InputBase
                    value={keySecret?.twitter?.secret || ''}
                    name="secret"
                    onChange={(e) => handleOnChangeSecret(e, OAUTH_TYPES.TWITTER)}
                    className={styles.input}
                    type={showPassword.twitter.secret ? 'text' : 'password'}
                  />
                  <IconButton onClick={() => handleShowPassword('twitter-secret')} size="large">
                    <Icon
                      icon={showPassword.twitter.secret ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                      color="orange"
                    />
                  </IconButton>
                </Paper>

                <Paper component="div" className={styles.createInput}>
                  <label>{t('admin:components.setting.callback')}:</label>
                  <InputBase
                    value={authSetting?.callback?.twitter || ''}
                    name="callbackTwitter"
                    disabled
                    className={styles.input}
                  />
                </Paper>
              </Paper>
            )}
          </Grid>
        </Grid>
        <Button sx={{ maxWidth: '100%' }} variant="outlined" className={styles.cancelButton} onClick={handleCancel}>
          {t('admin:components.setting.cancel')}
        </Button>
        &nbsp; &nbsp;
        <Button sx={{ maxWidth: '100%' }} variant="contained" className={styles.saveBtn} onClick={handleSubmit}>
          {t('admin:components.setting.save')}
        </Button>
      </form>
    </div>
  )
}

export default Account
