import React from 'react'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Container from '@material-ui/core/Container'
import GitHubIcon from '@material-ui/icons/GitHub'
import FacebookIcon from '@material-ui/icons/Facebook'
import LinkedinIcon from '@material-ui/icons/LinkedIn'
import TwitterIcon from '@material-ui/icons/Twitter'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import styles from './Auth.module.scss'
import { loginUserByOAuth } from '../../reducers/auth/service'
import { useTranslation } from 'react-i18next'

const mapStateToProps = (state: any): any => {
  return {}
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  loginUserByOAuth: bindActionCreators(loginUserByOAuth, dispatch)
})

interface Props {
  auth?: any
  enableFacebookSocial?: boolean
  enableGithubSocial?: boolean
  enableGoogleSocial?: boolean
  enableLinkedInSocial?: boolean
  enableTwitterSocial?: boolean
  loginUserByOAuth?: typeof loginUserByOAuth
}

const SocialLogin = (props: Props): any => {
  const {
    enableFacebookSocial,
    enableGithubSocial,
    enableGoogleSocial,
    enableLinkedInSocial,
    enableTwitterSocial,
    loginUserByOAuth
  } = props
  const { t } = useTranslation()

  const handleGithubLogin = (e: any): void => {
    e.preventDefault()
    loginUserByOAuth('github')
  }

  const handleGoogleLogin = (e: any): void => {
    e.preventDefault()
    loginUserByOAuth('google')
  }

  const handleFacebookLogin = (e: any): void => {
    e.preventDefault()
    loginUserByOAuth('facebook')
  }

  const handleLinkedinLogin = (e: any): void => {
    e.preventDefault()
    loginUserByOAuth('linkedin2')
  }

  const handleTwitterLogin = (e: any): void => {
    e.preventDefault()
    loginUserByOAuth('twitter')
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

export default connect(mapStateToProps, mapDispatchToProps)(SocialLoginWrapper)
