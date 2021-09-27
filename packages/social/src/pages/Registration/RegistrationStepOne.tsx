import Button from '@material-ui/core/Button'
import InputAdornment from '@material-ui/core/InputAdornment'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import { Check, Close, Create, GitHub, Send } from '@material-ui/icons'
import { useAuthState } from '@xrengine/client-core/src/user/reducers/auth/AuthState'
import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/AuthService'
import { selectCreatorsState } from '../../reducers/creator/selector'
import { updateCreator } from '../../reducers/creator/service'
import React, { useEffect, useState } from 'react'
import { connect, useDispatch } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { FacebookIcon } from '../../../../client-core/src/common/components/Icons/FacebookIcon'
import { GoogleIcon } from '../../../../client-core/src/common/components/Icons/GoogleIcon'
import { LinkedInIcon } from '../../../../client-core/src/common/components/Icons/LinkedInIcon'
import { TwitterIcon } from '../../../../client-core/src/common/components/Icons/TwitterIcon'

import { Config, validateEmail, validatePhoneNumber } from '@xrengine/common/src/config'
import * as polyfill from 'credential-handler-polyfill'
import styles from './Registration.module.scss'
import { useTranslation } from 'react-i18next'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'
import { useSnackbar, SnackbarOrigin } from 'notistack'

import { getStoredAuthState } from '@xrengine/client-core/src/persisted.store'
import { changeWebXrNative, getWebXrNative } from '@xrengine/social/src/reducers/webxr_native/service'
import { createCreator } from '@xrengine/social/src/reducers/creator/service'
import { Link } from 'react-router-dom'

const mapStateToProps = (state: any): any => {
  return {
    creatorsState: selectCreatorsState(state)
  }
}

const Registration = (props: any): any => {
  const {
    updateUsername,
    loginUserByOAuth,
    logoutUser,
    changeActiveMenu,
    setRegistrationOpen,
    creatorsState,
    doLoginAuto
  } = props

  const dispatch = useDispatch()
  const { t } = useTranslation()
  const auth = useAuthState()

  const selfUser = auth.user

  // const [username, setUsername] = useState(selfUser?.name)
  const [creator, setCreator] = useState(creatorsState && creatorsState.get('currentCreator'))
  const [emailPhone, setEmailPhone] = useState('')
  const [error, setError] = useState(false)
  const [errorUsername, setErrorUsername] = useState(false)
  const [emailPhoneForm, setEmailPhoneForm] = useState(false)

  let type = ''

  const loadCredentialHandler = async () => {
    try {
      const mediator = `${Config.publicRuntimeConfig.mediatorServer}/mediator?origin=${encodeURIComponent(
        window.location.origin
      )}`

      await polyfill.loadOnce(mediator)
      // console.log('Ready to work with credentials!')
    } catch (e) {
      console.error('Error loading polyfill:', e)
    }
  }

  useEffect(() => {
    loadCredentialHandler()
  }, []) // Only run once

  // useEffect(() => {
  //   selfUser && setUsername(selfUser.name)
  // }, [selfUser.name])

  const updateUserName = (e) => {
    e.preventDefault()
    const creator = creatorsState.get('currentCreator')
    dispatch(
      updateCreator(
        {
          ...creator,
          username: e.target.value
        },
        callBacksFromUpdateUsername
      )
    )
  }
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const callBacksFromUpdateUsername = (str: string) => {
    const anchorOrigin: SnackbarOrigin = { horizontal: 'right', vertical: 'top' }
    switch (str) {
      case 'succes': {
        enqueueSnackbar('Data saved successfully', { variant: 'success', anchorOrigin })
        break
      }
      case 'reject': {
        enqueueSnackbar('This name is already taken', { variant: 'error', anchorOrigin })
        break
      }
    }
  }

  const [crutch, setCrutch] = useState(false)

  const authData = getStoredAuthState()
  const accessToken = authData?.authUser ? authData.authUser.accessToken : undefined

  useEffect(() => {
    if (accessToken || crutch) {
      dispatch(AuthService.doLoginAuto(true))
      dispatch(getWebXrNative())
    }
  }, [accessToken, crutch])

  useEffect(() => {
    if (auth?.authUser?.accessToken) {
      dispatch(createCreator())
    }
  }, [auth.isLoggedIn.value, auth.user.id.value])

  const handleUpdateUsername = () => {
    dispatch(updateCreator(creator, callBacksFromUpdateUsername))
  }
  const handleInputChange = (e) => setEmailPhone(e.target.value)

  const validate = () => {
    if (emailPhone === '') return false
    if (validateEmail(emailPhone.trim())) type = 'email'
    else if (validatePhoneNumber(emailPhone.trim())) type = 'sms'
    else {
      setError(true)
      return false
    }

    setError(false)
    return true
  }

  const handleSubmit = (e: any): any => {
    e.preventDefault()
    if (!validate()) return
    if (type === 'email') dispatch(AuthService.addConnectionByEmail(emailPhone, authData.user.id))
    if (type === 'sms') dispatch(AuthService.addConnectionBySms(emailPhone, authData.user.id))
    return
  }

  const handleOAuthServiceClick = (e) => {
    loginUserByOAuth(e.currentTarget.id)
  }
  const handleGoEmailClick = () => {
    setEmailPhoneForm(!emailPhoneForm)
    setCrutch(true)
  }

  const handleLogout = async (e) => {
    if (changeActiveMenu != null) changeActiveMenu(null)
    else if (setRegistrationOpen != null) setRegistrationOpen(false)
    await logoutUser()
    // window.location.reload()
  }

  return (
    <div className={styles.menuPanel}>
      <section className={styles.profilePanel}>
        <div className={styles.logo}>
          <span>Log in to</span>
          <img src="/assets/LogoColored.png" alt="logo" crossOrigin="anonymous" className="logo" />
        </div>
        {emailPhoneForm && creatorsState.get('currentCreator')?.username && (
          <div className={styles.emailPhoneSection}>
            <div className={styles.socialBack} onClick={handleGoEmailClick}>
              <ArrowBackIosIcon />
            </div>
            <Typography align="center" variant="body1">
              {t('user:usermenu.registration.connect')}
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                margin="none"
                size="small"
                label={t('user:usermenu.profile.lbl-username')}
                variant="outlined"
                defaultValue={creatorsState.get('currentCreator')?.username}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') updateUserName(e)
                }}
                className={styles.usernameInput}
                error={errorUsername}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <a href="#" className={styles.materialIconBlock} onClick={updateUserName}>
                        <Check className={styles.primaryForeground} />
                      </a>
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                className={styles.emailField}
                size="small"
                placeholder={t('user:usermenu.registration.ph-phoneEmail')}
                variant="outlined"
                onChange={handleInputChange}
                onBlur={validate}
                error={error}
                helperText={error ? t('user:usermenu.registration.ph-phoneEmail') : null}
              />
              <Button className={styles.logIn} variant="contained" onClick={handleSubmit}>
                Log in
              </Button>
              <Link to="/">
                <Button className={styles.logIn} variant="contained">
                  Continue as guest
                </Button>
              </Link>
            </form>
          </div>
        )}
        {!emailPhoneForm && (
          <section className={styles.socialBlock}>
            <div className={styles.socialContainer}>
              <div className={styles.socialWrap} onClick={handleGoEmailClick}>
                <a href="#">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    width="42"
                    height="42"
                    viewBox="0 0 42 42"
                    fill="none"
                  >
                    <rect width="42" height="42" transform="matrix(-1 0 0 1 42 0)" fill="url(#pattern0)" />
                    <defs>
                      <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
                        <use xlinkHref="#image0" transform="scale(0.0208333)" />
                      </pattern>
                      <image
                        id="image0"
                        width="48"
                        height="48"
                        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAANlBMVEVHcEwAAAAJChIMDBkWGCIOEBcOEBcJCg8QEhwNDxQUFiAAAAAAAAAVFyMDBAYQEhsWGCMAAAD5xs1FAAAAEHRSTlMA7zAQ33+jXkIgxt/B72+Q9PCfEQAAASBJREFUSMftVMsSgyAM5CUEENT//9k2aEesQNLeOtM9EciSLCwI8cd30GDNugbrmPnwzN5hWJRprTB9mM9guD0NhFC2DIEgYP9G7WNfAkYB/4oUXQLbsGe4XMMGwnVLIHvCHuorfItJgiAJpta8q06khul6aGFIyLilfkXlIsZ+0gn3PBga6yXPsJKB07WkmUJxUAohlUGgX4+pzRo8470tZ/6iWU/O29JOssB/1grA//K35LONctvkHDJHB8xbhZn6mdQlHRGHVbLc7sgD5x19ZKXxh81HuWmcP0N95yOGwzX5ptKVJpvSfcR8dTsGZMiWCUt11Tg4nG/8Zr7bbG7vhAViWxwe1nKbjT1tz8tHFbdZ2S3QWXNRdn0zWvtFPAAmbxZPKTUEzQAAAABJRU5ErkJggg=="
                      />
                    </defs>
                  </svg>
                </a>
                <Typography variant="h3" className={styles.textBlock}>
                  {t('user:usermenu.registration.ph-phoneEmail')}
                  {/* Login as guest */}
                </Typography>
              </div>
              <div className={styles.socialWrap} id="facebook" onClick={handleOAuthServiceClick}>
                <a href="#">
                  <FacebookIcon width="40" height="40" viewBox="0 0 40 40" />
                </a>
                <Typography variant="h3" className={styles.textBlock}>
                  {t('user:usermenu.registration.facebook')}
                </Typography>
              </div>
              <div className={styles.socialWrap} id="google" onClick={handleOAuthServiceClick}>
                <a href="#">
                  <GoogleIcon width="40" height="40" viewBox="0 0 40 40" />
                </a>
                <Typography variant="h3" className={styles.textBlock}>
                  {t('user:usermenu.registration.google')}
                </Typography>
              </div>
              <div className={styles.socialWrap} id="linkedin2" onClick={handleOAuthServiceClick}>
                <a href="#">
                  <LinkedInIcon width="40" height="40" viewBox="0 0 40 40" />
                </a>
                <Typography variant="h3" className={styles.textBlock}>
                  {t('user:usermenu.registration.linkedin')}
                </Typography>
              </div>
              <div className={styles.socialWrap} id="twitter" onClick={handleOAuthServiceClick}>
                <a href="#">
                  <TwitterIcon width="40" height="40" viewBox="0 0 40 40" />
                </a>
                <Typography variant="h3" className={styles.textBlock}>
                  {t('user:usermenu.registration.twitter')}
                </Typography>
              </div>
              <div className={styles.socialWrap} id="github" onClick={handleOAuthServiceClick}>
                <a href="#">
                  <GitHub />
                </a>
                <Typography variant="h3" className={styles.textBlock}>
                  {t('user:usermenu.registration.gitHub')}
                </Typography>
              </div>
            </div>
            <Typography variant="h4" className={styles.smallTextBlock}>
              {t('user:usermenu.profile.createOne')}
            </Typography>
          </section>
        )}
      </section>
    </div>
  )
}

export default connect(mapStateToProps)(Registration)
