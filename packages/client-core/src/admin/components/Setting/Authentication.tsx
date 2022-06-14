import { Icon } from '@iconify/react'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button, Grid, Paper, Typography } from '@mui/material'
import IconButton from '@mui/material/IconButton'

import { useAuthState } from '../../../user/services/AuthService'
import InputSwitch from '../../common/InputSwitch'
import InputText from '../../common/InputText'
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
            <InputText
              name="service"
              label={t('admin:components.setting.service')}
              value={authSetting?.service || ''}
              disabled
            />

            <InputText
              name="secret"
              label={t('admin:components.setting.secret')}
              value={authSetting?.secret || ''}
              disabled
            />

            <InputText
              name="entity"
              label={t('admin:components.setting.entity')}
              value={authSetting?.entity || ''}
              disabled
            />

            <Typography component="h1" className={styles.settingsHeading}>
              {t('admin:components.setting.authStrategies')}
            </Typography>
            {Object.keys(state).map((strategyName, i) => (
              <InputSwitch
                key={i}
                name={strategyName}
                label={strategyName}
                checked={state[strategyName]}
                disabled={strategyName === 'jwt'}
                onChange={onSwitchHandle}
              />
            ))}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <label>{t('admin:components.setting.local')}</label>

            <InputText
              name="username"
              label={t('admin:components.setting.userName')}
              value={authSetting?.local.usernameField || ''}
              disabled
            />

            <InputText
              name="password"
              label={t('admin:components.setting.password')}
              value={authSetting?.local.passwordField || ''}
              type={showPassword.password.secret ? 'text' : 'password'}
              disabled
              endAdornment={
                <IconButton onClick={() => handleShowPassword('password-secret')}>
                  <Icon
                    icon={showPassword.password.secret ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                    color="orange"
                  />
                </IconButton>
              }
            />

            <Typography component="h1" className={styles.settingsHeading}>
              {t('admin:components.setting.oauth')}
            </Typography>
            <label>{t('admin:components.setting.defaults')}</label>

            <InputText
              name="host"
              label={t('admin:components.setting.host')}
              value={authSetting?.oauth?.defaults?.host || ''}
              disabled
            />

            <InputText
              name="protocol"
              label={t('admin:components.setting.protocol')}
              value={authSetting?.oauth?.defaults?.protocol || ''}
              disabled
            />

            {holdAuth?.discord && (
              <Paper className={styles.Paper} elevation={0}>
                <label>{t('admin:components.setting.discord')}</label>

                <InputText
                  name="key"
                  label={t('admin:components.setting.key')}
                  value={keySecret?.discord?.key || ''}
                  type={showPassword.discord.key ? 'text' : 'password'}
                  endAdornment={
                    <IconButton onClick={() => handleShowPassword('discord-key')}>
                      <Icon
                        icon={showPassword.discord.key ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                        color="orange"
                      />
                    </IconButton>
                  }
                  onChange={(e) => handleOnChangeKey(e, OAUTH_TYPES.DISCORD)}
                />

                <InputText
                  name="secret"
                  label={t('admin:components.setting.secret')}
                  value={keySecret?.discord?.secret || ''}
                  type={showPassword.discord.secret ? 'text' : 'password'}
                  endAdornment={
                    <IconButton onClick={() => handleShowPassword('discord-secret')}>
                      <Icon
                        icon={showPassword.discord.secret ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                        color="orange"
                      />
                    </IconButton>
                  }
                  onChange={(e) => handleOnChangeSecret(e, OAUTH_TYPES.DISCORD)}
                />

                <InputText
                  name="callbackGithub"
                  label={t('admin:components.setting.callback')}
                  value={authSetting?.callback?.discord || ''}
                  disabled
                />
              </Paper>
            )}
            {holdAuth?.facebook && (
              <Paper className={styles.Paper} elevation={0}>
                <label>{t('admin:components.setting.facebook')}</label>

                <InputText
                  name="key"
                  label={t('admin:components.setting.key')}
                  value={keySecret?.facebook?.key || ''}
                  type={showPassword.facebook.key ? 'text' : 'password'}
                  endAdornment={
                    <IconButton onClick={() => handleShowPassword('facebook-key')}>
                      <Icon
                        icon={showPassword.facebook.key ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                        color="orange"
                      />
                    </IconButton>
                  }
                  onChange={(e) => handleOnChangeKey(e, OAUTH_TYPES.FACEBOOK)}
                />

                <InputText
                  name="key"
                  label={t('admin:components.setting.secret')}
                  value={keySecret?.facebook?.secret || ''}
                  type={showPassword.facebook.secret ? 'text' : 'password'}
                  endAdornment={
                    <IconButton onClick={() => handleShowPassword('facebook-secret')}>
                      <Icon
                        icon={showPassword.facebook.secret ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                        color="orange"
                      />
                    </IconButton>
                  }
                  onChange={(e) => handleOnChangeSecret(e, OAUTH_TYPES.FACEBOOK)}
                />

                <InputText
                  name="callbackFacebook"
                  label={t('admin:components.setting.callback')}
                  value={authSetting?.callback?.facebook || ''}
                  disabled
                />
              </Paper>
            )}
            {holdAuth?.github && (
              <Paper className={styles.Paper} style={{ marginTop: '10px' }} elevation={0}>
                <label>{t('admin:components.setting.github')}</label>

                <InputText
                  name="appid"
                  label={t('admin:components.setting.appId')}
                  value={keySecret?.github?.appid || ''}
                  type={showPassword.github.appid ? 'text' : 'password'}
                  endAdornment={
                    <IconButton onClick={() => handleShowPassword('github-appid')}>
                      <Icon
                        icon={showPassword.github.appid ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                        color="orange"
                      />
                    </IconButton>
                  }
                  onChange={(e) => handleOnChangeAppId(e, OAUTH_TYPES.GITHUB)}
                />

                <InputText
                  name="key"
                  label={t('admin:components.setting.key')}
                  value={keySecret?.github?.key || ''}
                  type={showPassword.github.key ? 'text' : 'password'}
                  endAdornment={
                    <IconButton onClick={() => handleShowPassword('github-key')}>
                      <Icon
                        icon={showPassword.github.key ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                        color="orange"
                      />
                    </IconButton>
                  }
                  onChange={(e) => handleOnChangeKey(e, OAUTH_TYPES.GITHUB)}
                />

                <InputText
                  name="secret"
                  label={t('admin:components.setting.secret')}
                  value={keySecret?.github?.secret || ''}
                  type={showPassword.github.secret ? 'text' : 'password'}
                  endAdornment={
                    <IconButton onClick={() => handleShowPassword('github-secret')}>
                      <Icon
                        icon={showPassword.github.secret ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                        color="orange"
                      />
                    </IconButton>
                  }
                  onChange={(e) => handleOnChangeSecret(e, OAUTH_TYPES.GITHUB)}
                />

                <InputText
                  name="callbackGithub"
                  label={t('admin:components.setting.callback')}
                  value={authSetting?.callback?.github || ''}
                  disabled
                />
              </Paper>
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            {holdAuth?.google && (
              <Paper className={styles.Paper} style={{ marginBottom: '10px' }} elevation={0}>
                <label>{t('admin:components.setting.google')}</label>

                <InputText
                  name="key"
                  label={t('admin:components.setting.key')}
                  value={keySecret?.google?.key || ''}
                  type={showPassword.google.key ? 'text' : 'password'}
                  endAdornment={
                    <IconButton onClick={() => handleShowPassword('google-key')}>
                      <Icon
                        icon={showPassword.google.key ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                        color="orange"
                      />
                    </IconButton>
                  }
                  onChange={(e) => handleOnChangeKey(e, OAUTH_TYPES.GOOGLE)}
                />

                <InputText
                  name="secret"
                  label={t('admin:components.setting.secret')}
                  value={keySecret?.google?.secret || ''}
                  type={showPassword.google.secret ? 'text' : 'password'}
                  endAdornment={
                    <IconButton onClick={() => handleShowPassword('google-secret')}>
                      <Icon
                        icon={showPassword.google.secret ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                        color="orange"
                      />
                    </IconButton>
                  }
                  onChange={(e) => handleOnChangeSecret(e, OAUTH_TYPES.GOOGLE)}
                />

                <InputText
                  name="callbackGoogle"
                  label={t('admin:components.setting.callback')}
                  value={authSetting?.callback?.google || ''}
                  disabled
                />
              </Paper>
            )}
            {holdAuth?.linkedin && (
              <Paper className={styles.Paper} style={{ marginBottom: '10px' }} elevation={0}>
                <label>{t('admin:components.setting.linkedIn')}</label>

                <InputText
                  name="key"
                  label={t('admin:components.setting.key')}
                  value={keySecret?.linkedin?.key || ''}
                  type={showPassword.linkedin.key ? 'text' : 'password'}
                  endAdornment={
                    <IconButton onClick={() => handleShowPassword('linkedin-key')}>
                      <Icon
                        icon={showPassword.linkedin.key ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                        color="orange"
                      />
                    </IconButton>
                  }
                  onChange={() => handleShowPassword('linkedin-key')}
                />

                <InputText
                  name="secret"
                  label={t('admin:components.setting.secret')}
                  value={keySecret?.linkedin?.secret || ''}
                  type={showPassword.linkedin.secret ? 'text' : 'password'}
                  endAdornment={
                    <IconButton onClick={() => handleShowPassword('linkedin-secret')}>
                      <Icon
                        icon={showPassword.linkedin.secret ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                        color="orange"
                      />
                    </IconButton>
                  }
                  onChange={(e) => handleOnChangeSecret(e, OAUTH_TYPES.LINKEDIN)}
                />

                <InputText
                  name="callbackLinkedin"
                  label={t('admin:components.setting.callback')}
                  value={authSetting?.callback?.linkedin || ''}
                  disabled
                />
              </Paper>
            )}
            {holdAuth?.twitter && (
              <Paper className={styles.Paper} elevation={0} style={{ marginBottom: '10px' }}>
                <label style={{ color: '#ffff' }}>{t('admin:components.setting.twitter')}</label>

                <InputText
                  name="key"
                  label={t('admin:components.setting.key')}
                  value={keySecret?.twitter?.key || ''}
                  type={showPassword.twitter.key ? 'text' : 'password'}
                  endAdornment={
                    <IconButton onClick={() => handleShowPassword('twitter-key')}>
                      <Icon
                        icon={showPassword.twitter.key ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                        color="orange"
                      />
                    </IconButton>
                  }
                  onChange={(e) => handleOnChangeKey(e, OAUTH_TYPES.TWITTER)}
                />

                <InputText
                  name="secret"
                  label={t('admin:components.setting.secret')}
                  value={keySecret?.twitter?.secret || ''}
                  type={showPassword.twitter.secret ? 'text' : 'password'}
                  endAdornment={
                    <IconButton onClick={() => handleShowPassword('twitter-secret')}>
                      <Icon
                        icon={showPassword.twitter.secret ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                        color="orange"
                      />
                    </IconButton>
                  }
                  onChange={(e) => handleOnChangeSecret(e, OAUTH_TYPES.TWITTER)}
                />

                <InputText
                  name="callbackTwitter"
                  label={t('admin:components.setting.callback')}
                  value={authSetting?.callback?.twitter || ''}
                  disabled
                />
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
