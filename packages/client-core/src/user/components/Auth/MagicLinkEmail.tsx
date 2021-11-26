import React, { useState, useEffect } from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { useDispatch } from '../../../store'
import Grid from '@mui/material/Grid'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import { Link } from 'react-router-dom'
import { Config } from '@xrengine/common/src/config'
import styles from './Auth.module.scss'
import { AuthService } from '../../services/AuthService'
import { useAuthState } from '../../services/AuthService'
import { useTranslation } from 'react-i18next'
import { AuthSettingService } from '../../../admin/services/Setting/AuthSettingService'
import { useAdminAuthSettingState } from '../../../admin/services/Setting/AuthSettingService'

const initialState = {
  jwt: false,
  local: false,
  facebook: false,
  github: false,
  google: false,
  linkedin: false,
  twitter: false,
  smsMagicLink: false,
  emailMagicLink: false
}

interface Props {
  type?: 'email' | 'sms' | undefined
  isAddConnection?: boolean
}

const defaultState = {
  emailPhone: '',
  isSubmitted: false,
  isAgreedTermsOfService: false,
  label: '',
  descr: ''
}

const termsOfService = Config.publicRuntimeConfig.staticPages?.termsOfService ?? '/terms-of-service'

const MagicLinkEmail = (props: Props): any => {
  const { type, isAddConnection } = props

  const dispatch = useDispatch()
  const auth = useAuthState()
  const [state, setState] = useState(defaultState)
  const { t } = useTranslation()
  const authSettingState = useAdminAuthSettingState()
  const [authSetting] = authSettingState?.authSettings?.value || []
  const [authState, setAuthState] = useState(initialState)

  useEffect(() => {
    !authSetting && AuthSettingService.fetchAuthSetting()
  }, [])

  useEffect(() => {
    if (authSetting) {
      let temp = { ...initialState }
      authSetting?.authStrategies?.forEach((el) => {
        Object.entries(el).forEach(([strategyName, strategy]) => {
          temp[strategyName] = strategy
        })
      })
      setAuthState(temp)
    }
  }, [authSettingState?.updateNeeded?.value])

  const handleInput = (e: any): any => {
    setState({ ...state, [e.target.name]: e.target.value })
  }

  const handleCheck = (e: any): any => {
    setState({ ...state, [e.target.name]: e.target.checked })
  }

  const handleSubmit = (e: any): any => {
    e.preventDefault()
    if (!isAddConnection) {
      AuthService.createMagicLink(state.emailPhone, authState)
      setState({ ...state, isSubmitted: true })
      return
    }

    const user = auth.user
    const userId = user ? user.id.value : ''
    if (type === 'email') {
      AuthService.addConnectionByEmail(state.emailPhone, userId)
    } else {
      AuthService.addConnectionBySms(state.emailPhone, userId)
    }
  }
  let descr = ''
  let label = ''

  useEffect(() => {
    // Pass in a type
    if (type === 'email') {
      descr = t('user:auth.magiklink.descriptionEmail')
      label = t('user:auth.magiklink.lbl-email')
      return
    } else if (type === 'sms') {
      descr = t('user:auth.magiklink.descriptionSMS')
      label = t('user:auth.magiklink.lbl-phone')
      return
    } else if (!authSetting) {
      descr = t('user:auth.magiklink.descriptionEmail')
      label = t('user:auth.magiklink.lbl-email')
      return
    }
    // Auth config is using Sms and Email, so handle both
    if (authState?.emailMagicLink && authState?.smsMagicLink && !type) {
      descr = t('user:auth.magiklink.descriptionEmailSMS')
      label = t('user:auth.magiklink.lbl-emailPhone')
    } else if (authState?.smsMagicLink) {
      descr = t('user:auth.magiklink.descriptionSMSUS')
      label = t('user:auth.magiklink.lbl-phone')
    } else {
      descr = t('user:auth.magiklink.descriptionEmail')
      label = t('user:auth.magiklink.lbl-email')
    }

    setState({ ...state, label: label, descr: descr })
  }, [])

  return (
    <Container component="main" maxWidth="xs">
      <div>
        <Typography component="h1" variant="h5">
          {t('user:auth.magiklink.header')}
        </Typography>

        <Typography variant="body2" color="textSecondary" align="center">
          {state.descr}
        </Typography>

        <form className={styles.form} noValidate onSubmit={(e) => handleSubmit(e)}>
          <Grid container>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="emailPhone"
                label={state.label}
                name="emailPhone"
                // autoComplete="email"
                autoFocus
                onChange={(e) => handleInput(e)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    value={true}
                    onChange={(e) => handleCheck(e)}
                    color="primary"
                    name="isAgreedTermsOfService"
                  />
                }
                label={
                  <div className={styles.termsLink}>
                    {t('user:auth.magiklink.agree')}
                    <Link to={termsOfService}>{t('user:auth.magiklink.terms')}</Link>
                  </div>
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={styles.submit}
                disabled={!state.isAgreedTermsOfService}
              >
                {t('user:auth.magiklink.lbl-submit')}
              </Button>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  )
}

const MagicLinkEmailWrapper = (props: Props): any => <MagicLinkEmail {...props} />

export default MagicLinkEmailWrapper
