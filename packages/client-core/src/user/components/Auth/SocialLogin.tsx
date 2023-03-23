import React from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Container from '@etherealengine/ui/src/primitives/mui/Container'
import Grid from '@etherealengine/ui/src/primitives/mui/Grid'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import { AuthService } from '../../services/AuthService'
import styles from './index.module.scss'

interface Props {
  enableFacebookSocial?: boolean
  enableGithubSocial?: boolean
  enableGoogleSocial?: boolean
  enableLinkedInSocial?: boolean
  enableTwitterSocial?: boolean
  enableDiscordSocial?: boolean
}

const SocialLogin = ({
  enableDiscordSocial,
  enableFacebookSocial,
  enableGithubSocial,
  enableGoogleSocial,
  enableLinkedInSocial,
  enableTwitterSocial
}: Props): JSX.Element => {
  const { t } = useTranslation()
  const location = useLocation()

  const handleGithubLogin = (e: any): void => {
    e.preventDefault()
    AuthService.loginUserByOAuth('github', location)
  }

  const handleGoogleLogin = (e: any): void => {
    e.preventDefault()
    AuthService.loginUserByOAuth('google', location)
  }

  const handleFacebookLogin = (e: any): void => {
    e.preventDefault()
    AuthService.loginUserByOAuth('facebook', location)
  }

  const handleLinkedinLogin = (e: any): void => {
    e.preventDefault()
    AuthService.loginUserByOAuth('linkedin', location)
  }

  const handleTwitterLogin = (e: any): void => {
    e.preventDefault()
    AuthService.loginUserByOAuth('twitter', location)
  }

  const handleDiscordLogin = (e: any): void => {
    e.preventDefaule()
    AuthService.loginUserByOAuth('discord', location)
  }

  const githubButton = enableGithubSocial ? (
    <Grid item xs={12}>
      <Button
        onClick={(e) => handleGithubLogin(e)}
        startIcon={<Icon type="GitHub" />}
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
        startIcon={<Icon type="Facebook" width="20px" height="20px" />}
        variant="contained"
        className={styles.facebook}
        fullWidth={true}
      ></Button>
    </Grid>
  ) : (
    ''
  )

  const linkedinButton = enableLinkedInSocial ? (
    <Grid item xs={12}>
      <Button
        onClick={(e) => handleLinkedinLogin(e)}
        startIcon={<Icon type="LinkedIn" />}
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
        startIcon={<Icon type="Twitter" />}
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

  const discordButton = enableDiscordSocial ? (
    <Grid item xs={12}>
      <Button
        onClick={(e) => handleDiscordLogin(e)}
        startIcon={<Icon type="ChatBubble" />}
        variant="contained"
        className={styles.discord}
        fullWidth={true}
      >
        {t('user:auth.social.discord')}
      </Button>
    </Grid>
  ) : (
    ''
  )

  return (
    <Container component="main" maxWidth="xs">
      <div className={styles.paper}>
        <Grid container justifyContent="center" spacing={2}>
          {discordButton}
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

export default SocialLogin
