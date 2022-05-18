import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'

import Button from '@mui/material/Button'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'

import { AuthService, useAuthState } from '../../services/AuthService'
import styles from '../Login/index.module.scss'

interface Props {
  logo?: string
}

const ConfirmEmail = (props: Props): JSX.Element => {
  const history = useHistory()
  const auth = useAuthState()
  const { t } = useTranslation()

  const handleResendEmail = (e: any): any => {
    e.preventDefault()

    const identityProvider = auth.identityProvider

    AuthService.resendVerificationEmail(identityProvider.token.value)
  }

  return (
    <section className={styles.loginPage}>
      <span className={styles.placeholder} />
      <CardMedia className={styles.logo} image={props.logo} title="ARC Logo" />
      <span className={styles.placeholder} />
      <Typography component="h1" variant="h5" align="center">
        {t('user:auth.confirmEmail.header')}
      </Typography>
      <section className={styles.content}>
        <Typography variant="body2" color="textSecondary" align="center">
          <Trans t={t} i18nKey="user:auth.confirmEmail.resendEmail">
            {t('user:auth.confirmEmail.resendEmail', {
              here: `${(
                <>
                  <Button variant="contained" color="primary" onClick={(e) => handleResendEmail(e)}>
                    here
                  </Button>
                  <br />
                </>
              )}`
            })}
          </Trans>
        </Typography>
      </section>
      <span className={styles.placeholder} />
      <section className={styles.footer}>
        <p>
          <Trans t={t} i18nKey="user:auth.confirmEmail.resendEmail">
            {t('user:auth.confirmEmail.haveAnAccount')}{' '}
            <span onClick={() => history.push('/')}>{t('user:auth.register.login')}</span>
          </Trans>
        </p>
      </section>
    </section>
  )
}

const ConfirmEmailWrapper = (props: Props): any => <ConfirmEmail {...props} />

export default ConfirmEmailWrapper
