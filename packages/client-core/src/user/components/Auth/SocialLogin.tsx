import React from 'react'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Container from '@material-ui/core/Container'
import GitHubIcon from '@material-ui/icons/GitHub'
import FacebookIcon from '@material-ui/icons/Facebook'
import LinkedinIcon from '@material-ui/icons/LinkedIn'
import TwitterIcon from '@material-ui/icons/Twitter'
import styles from './Auth.module.scss'
import { AuthService } from '../../state/AuthService'
import { useTranslation } from 'react-i18next'
import { useDispatch } from '../../../store'

interface Props {
  auth?: any
  enableFacebookSocial?: boolean
  enableGithubSocial?: boolean
  enableGoogleSocial?: boolean
  enableLinkedInSocial?: boolean
  enableTwitterSocial?: boolean
}

const SocialLogin = (props: Props): any => {
  const { enableFacebookSocial, enableGithubSocial, enableGoogleSocial, enableLinkedInSocial, enableTwitterSocial } =
    props
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const handleGithubLogin = (e: any): void => {
    e.preventDefault()
    AuthService.loginUserByOAuth('github')
  }

  const handleGoogleLogin = (e: any): void => {
    e.preventDefault()
    AuthService.loginUserByOAuth('google')
  }

  const handleFacebookLogin = (e: any): void => {
    e.preventDefault()
    AuthService.loginUserByOAuth('facebook')
  }

  const handleLinkedinLogin = (e: any): void => {
    e.preventDefault()
    AuthService.loginUserByOAuth('linkedin2')
  }

  const handleTwitterLogin = (e: any): void => {
    e.preventDefault()
    AuthService.loginUserByOAuth('twitter')
  }

  const githubButton = enableGithubSocial ? (
    <Grid item xs={12}>
      <Button
        onClick={(e) => handleGithubLogin(e)}
        startIcon={<GitHubIcon />}
        variant="contained"
        className={styles.github}
        fullWidth={true}
      >
        {t('user:auth.social.gitHub')}
      </Button>
    </Grid>
  ) : (
    ''
  )
  const googleButton = enableGoogleSocial ? (
    <Grid item xs={12}>
      <Button onClick={(e) => handleGoogleLogin(e)} variant="contained" className={styles.google} fullWidth={true}>
        {t('user:auth.social.google')}
      </Button>
    </Grid>
  ) : (
    ''
  )
  const facebookButton = enableFacebookSocial ? (
    <Grid item xs={12}>
      <Button
        onClick={(e) => handleFacebookLogin(e)}
        startIcon={<FacebookIcon />}
        variant="contained"
        className={styles.facebook}
        fullWidth={true}
      >
        {t('user:auth.social.facebook')}
      </Button>
    </Grid>
  ) : (
    ''
  )

  const linkedinButton = enableLinkedInSocial ? (
    <Grid item xs={12}>
      <Button
        onClick={(e) => handleLinkedinLogin(e)}
        startIcon={<LinkedinIcon />}
        variant="contained"
        className={styles.facebook}
        fullWidth={true}
      >
        {t('user:auth.social.linkedin')}
      </Button>
    </Grid>
  ) : (
    ''
  )

  const twitterButton = enableTwitterSocial ? (
    <Grid item xs={12}>
      <Button
        onClick={(e) => handleTwitterLogin(e)}
        startIcon={<TwitterIcon />}
        variant="contained"
        className={styles.facebook}
        fullWidth={true}
      >
        {t('user:auth.social.twitter')}
      </Button>
    </Grid>
  ) : (
    ''
  )
  return (
    <Container component="main" maxWidth="xs">
      <div className={styles.paper}>
        <Grid container justify="center" spacing={2}>
          {githubButton}
          {facebookButton}
          {googleButton}
          {linkedinButton}
          {twitterButton}
        </Grid>
      </div>
    </Container>
  )
}

const SocialLoginWrapper = (props: Props): any => <SocialLogin {...props} />

export default SocialLoginWrapper
