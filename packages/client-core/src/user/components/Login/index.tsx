import React, { useEffect, useState } from 'react'
import CardMedia from '@mui/material/CardMedia'
import GoogleIcon from '@mui/icons-material/Google'
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined'
import Fab from '@mui/material/Fab'
import styles from './Login.module.scss'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import ForgotPassword from '../../../user/components/Auth/ForgotPassword'
import PasswordLoginApp from '../../../user/components/Auth/PasswordLoginApp'
import RegisterApp from '../../../user/components/Auth/RegisterApp'
import ResetPassword from '../../../user/components/Auth/ResetPassword'
import { AuthService } from '../../services/AuthService'
import { useTranslation } from 'react-i18next'
import { AuthSettingService } from '../../../admin/services/Setting/AuthSettingService'
import { useAdminAuthSettingState } from '../../../admin/services/Setting/AuthSettingService'

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

interface Props {
  auth?: any
  enableFacebookSocial?: boolean
  enableGithubSocial?: boolean
  enableGoogleSocial?: boolean
  logo: string
  isAddConnection?: boolean
}
const FlatSignIn = (props: Props) => {
  const [view, setView] = useState('login')

  const { t } = useTranslation()

  const authSettingState = useAdminAuthSettingState()
  const [authSetting] = authSettingState?.authSettings?.value || []
  const [authState, setAuthState] = useState(initialState)

  const enableUserPassword = authState?.local
  const enableGoogleSocial = authState?.google
  const enableFacebookSocial = authState?.facebook

  const socials = [enableGoogleSocial, enableFacebookSocial]

  const socialCount = socials.filter((v) => v).length

  const userTabPanel = enableUserPassword && <PasswordLoginApp />

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

  const handleGoogleLogin = (e: any): void => {
    e.preventDefault()
    AuthService.loginUserByOAuth('google')
  }

  const handleFacebookLogin = (e: any): void => {
    e.preventDefault()
    AuthService.loginUserByOAuth('facebook')
  }

  const handleResetPassword = (token: string, password: string): any => {
    AuthService.resetPassword(token, password)
  }

  let component = null! as any
  let footer = null! as any

  switch (view) {
    case 'sign-up':
      component = <RegisterApp />
      footer = (
        <>
          {!props.isAddConnection && (
            <p>
              {t('social:login.account')}
              <span onClick={() => setView('login')}>{t('social:login.login')}</span>
            </p>
          )}{' '}
        </>
      )
      break
    case 'forget-password':
      component = (
        <>
          <ForgotPassword />
          <span onClick={() => setView('reset-password')}>{t('social:login.resetPassword')}</span>
        </>
      )
      footer = (
        <>
          {!props.isAddConnection && (
            <p>
              {t('social:login.notHavingAccount')}
              <span onClick={() => setView('sign-up')}>{t('social:login.signUp')}</span>
            </p>
          )}
        </>
      )
      break
    // completeAction={()=>setView('login')} removed from ResetPassword since it failed lintsub
    case 'reset-password':
      component = (
        <>
          <ResetPassword resetPassword={handleResetPassword} token={''} />
          <span className={styles.placeholder} />
        </>
      )
      footer = <>{!props.isAddConnection && <p />} </>
      break

    //login by default
    default:
      component = (
        <>
          {userTabPanel}
          <Typography variant="h3" align="right" onClick={() => setView('forget-password')}>
            {t('social:login.forgotPassword')}
          </Typography>
        </>
      )
      footer = (
        <>
          {!props.isAddConnection && (
            <p>
              {t('social:login.notHavingAccount')}
              <span onClick={() => setView('sign-up')}>{t('social:login.signUp')}</span>
            </p>
          )}
        </>
      )
      break
  }

  return (
    <section className={styles.loginPage}>
      {view !== 'login' && (
        <Button variant="text" className={styles.backButton} onClick={() => setView('login')}>
          <ArrowBackIosIcon />
          {t('social:login.back')}
        </Button>
      )}
      <span className={styles.placeholder} />
      <CardMedia className={styles.logo} image={props.logo} title="ARC Logo" />
      <span className={styles.placeholder} />
      {component}
      {enableUserPassword && socialCount > 0 && (
        <section className={styles.hr}>
          <span>{t('social:login.or')}</span>
        </section>
      )}
      {socialCount > 0 && (
        <section className={styles.socialIcons}>
          {enableGoogleSocial && (
            <Fab>
              <GoogleIcon onClick={(e) => handleGoogleLogin(e)} />
            </Fab>
          )}
          {enableFacebookSocial && (
            <Fab>
              <FacebookOutlinedIcon onClick={(e) => handleFacebookLogin(e)} />
            </Fab>
          )}
        </section>
      )}
      <span className={styles.placeholder} />
      <section className={styles.footer}>{footer}</section>
    </section>
  )
}

export default FlatSignIn
