import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import CardMedia from '@etherealengine/ui/src/primitives/mui/CardMedia'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import Fab from '@mui/material/Fab'

import { AuthSettingsState } from '../../../admin/services/Setting/AuthSettingService'
import { initialAuthState } from '../../../common/initialAuthState'
import ForgotPassword from '../../../user/components/Auth/ForgotPassword'
import PasswordLoginApp from '../../../user/components/Auth/PasswordLoginApp'
import RegisterApp from '../../../user/components/Auth/RegisterApp'
import ResetPassword from '../../../user/components/Auth/ResetPassword'
import { AuthService } from '../../services/AuthService'
import styles from './index.module.scss'

interface Props {
  //auth?: any
  enableFacebookSocial?: boolean
  enableGithubSocial?: boolean
  enableGoogleSocial?: boolean
  logo: string
  isAddConnection?: boolean
}

const FlatSignIn = (props: Props) => {
  const view = useHookstate('login')

  const { t } = useTranslation()
  const location = useLocation()

  const authSettingState = useHookstate(getMutableState(AuthSettingsState))
  const [authSetting] = authSettingState?.authSettings?.value || []
  const authState = useHookstate(initialAuthState)

  const enableUserPassword = authState?.value?.local
  const enableGoogleSocial = authState?.value?.google
  const enableFacebookSocial = authState?.value?.facebook

  const socials = [enableGoogleSocial, enableFacebookSocial]

  const socialCount = socials.filter((v) => v).length

  const userTabPanel = enableUserPassword && <PasswordLoginApp />

  useEffect(() => {
    if (authSetting) {
      let temp = { ...initialAuthState }
      authSetting?.authStrategies?.forEach((el) => {
        Object.entries(el).forEach(([strategyName, strategy]) => {
          temp[strategyName] = strategy
        })
      })
      authState.set(temp)
    }
  }, [authSettingState?.updateNeeded?.value])

  const handleGoogleLogin = (e: any): void => {
    e.preventDefault()
    AuthService.loginUserByOAuth('google', location)
  }

  const handleFacebookLogin = (e: any): void => {
    e.preventDefault()
    AuthService.loginUserByOAuth('facebook', location)
  }

  const handleResetPassword = (token: string, password: string): void => {
    AuthService.resetPassword(token, password)
  }

  let component: JSX.Element
  let footer: JSX.Element

  switch (view.value) {
    case 'sign-up':
      component = <RegisterApp />
      footer = (
        <>
          {!props.isAddConnection && (
            <p>
              {t('social:login.account')}
              <span onClick={() => view.set('login')}>{t('social:login.login')}</span>
            </p>
          )}{' '}
        </>
      )
      break
    case 'forget-password':
      component = (
        <>
          <ForgotPassword />
          <span onClick={() => view.set('reset-password')}>{t('social:login.resetPassword')}</span>
        </>
      )
      footer = (
        <>
          {!props.isAddConnection && (
            <p>
              {t('social:login.notHavingAccount')}
              <span onClick={() => view.set('sign-up')}>{t('social:login.signUp')}</span>
            </p>
          )}
        </>
      )
      break
    // completeAction={()=>view.set('login')} removed from ResetPassword since it failed lintsub
    case 'reset-password':
      component = (
        <>
          <ResetPassword resetPassword={handleResetPassword} />
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
          <Typography variant="h3" align="right" onClick={() => view.set('forget-password')}>
            {t('social:login.forgotPassword')}
          </Typography>
        </>
      )
      footer = (
        <>
          {!props.isAddConnection && (
            <p>
              {t('social:login.notHavingAccount')}
              <span onClick={() => view.set('sign-up')}>{t('social:login.signUp')}</span>
            </p>
          )}
        </>
      )
      break
  }

  return (
    <section className={styles.loginPage}>
      {view.value !== 'login' && (
        <Button variant="text" className={styles.backButton} onClick={() => view.set('login')}>
          <Icon type="ArrowBackIos" />
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
              <Icon type="Google" onClick={(e) => handleGoogleLogin(e)} />
            </Fab>
          )}
          {enableFacebookSocial && (
            <Fab>
              <Icon type="FacebookOutlined" onClick={(e) => handleFacebookLogin(e)} />
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
