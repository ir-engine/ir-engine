import React, { useState } from 'react'
import { useDispatch } from '../../../store'
import CardMedia from '@material-ui/core/CardMedia'
import { Google } from '@styled-icons/bootstrap/Google'
import { Facebook } from '@styled-icons/bootstrap/Facebook'
import Fab from '@material-ui/core/Fab'
import styles from './Login.module.scss'
import { Config } from '@standardcreative/common/src/config'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'
import ForgotPassword from '../../../user/components/Auth/ForgotPassword'
import PasswordLoginApp from '../../../user/components/Auth/PasswordLoginApp'
import RegisterApp from '../../../user/components/Auth/RegisterApp'
import ResetPassword from '../../../user/components/Auth/ResetPassword'
import { AuthService } from '../../state/AuthService'
import { useTranslation } from 'react-i18next'

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
  const enableUserPassword = Config.publicRuntimeConfig?.auth
    ? Config.publicRuntimeConfig.auth.enableUserPassword
    : false
  const enableGoogleSocial = Config.publicRuntimeConfig?.auth
    ? Config.publicRuntimeConfig.auth.enableGoogleSocial
    : false
  const enableFacebookSocial = Config.publicRuntimeConfig?.auth
    ? Config.publicRuntimeConfig.auth.enableFacebookSocial
    : false
  const { t } = useTranslation()

  const dispatch = useDispatch()

  const socials = [enableGoogleSocial, enableFacebookSocial]

  const socialCount = socials.filter((v) => v).length

  const userTabPanel = enableUserPassword && <PasswordLoginApp />

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

  let component = null
  let footer = null

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
      <CardMedia className={styles.logo} image={props.logo} title="Logo" />
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
              <Google size="24" onClick={(e) => handleGoogleLogin(e)} />
            </Fab>
          )}
          {enableFacebookSocial && (
            <Fab>
              <Facebook size="24" onClick={(e) => handleFacebookLogin(e)} />
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
