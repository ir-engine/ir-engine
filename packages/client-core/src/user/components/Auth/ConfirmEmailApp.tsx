import React from 'react'
import { useHistory } from 'react-router-dom'

import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { resendVerificationEmail } from '../../reducers/auth/service'
import { selectAuthState } from '../../reducers/auth/selector'
import { IdentityProvider } from '@xrengine/common/src/interfaces/IdentityProvider'
import CardMedia from '@material-ui/core/CardMedia'
import { Trans, useTranslation } from 'react-i18next'

import styles from '../../../socialmedia/components/Login/Login.module.scss'

const mapStateToProps = (state: any): any => {
  return {
    auth: selectAuthState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  resendVerificationEmail: bindActionCreators(resendVerificationEmail, dispatch)
})

interface Props {
  logo?: string
  auth?: any
  resendVerificationEmail?: typeof resendVerificationEmail
}

const ConfirmEmail = (props: Props): any => {
  const history = useHistory()
  const { auth, resendVerificationEmail } = props
  const { t } = useTranslation()
  const handleResendEmail = (e: any): any => {
    e.preventDefault()

    const identityProvider = auth.get('identityProvider') as IdentityProvider
    console.log('---------', identityProvider)
    resendVerificationEmail(identityProvider.token)
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
            Please check your email to verify your account. If you didn&apos;t get an email, please click
            <Button variant="contained" color="primary" onClick={(e) => handleResendEmail(e)}>
              here
            </Button>
            <br />
            to resend the verification email.
          </Trans>
        </Typography>
      </section>
      <span className={styles.placeholder} />
      <section className={styles.footer}>
        <p>
          <Trans t={t} i18nKey="user:auth.confirmEmail.resendEmail">
            Have an account? <span onClick={() => history.push('/login')}> Log in</span>
          </Trans>
        </p>
      </section>
    </section>
  )
}

const ConfirmEmailWrapper = (props: Props): any => <ConfirmEmail {...props} />

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmEmailWrapper)
