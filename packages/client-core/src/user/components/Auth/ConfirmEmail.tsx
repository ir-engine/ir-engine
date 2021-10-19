import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { EmptyLayout } from '../../../common/components/Layout/EmptyLayout'
import { useDispatch } from '../../../store'
import { AuthService } from '../../state/AuthService'
import { useAuthState } from '../../state/AuthState'
import styles from './Auth.module.scss'

interface Props {}

const ConfirmEmail = (props: Props): any => {
  const dispatch = useDispatch()
  const auth = useAuthState()
  const { t } = useTranslation()
  const handleResendEmail = (e: any): any => {
    e.preventDefault()

    const identityProvider = auth.identityProvider

    AuthService.resendVerificationEmail(identityProvider.token.value)
  }

  return (
    <EmptyLayout>
      <Container component="main" maxWidth="md">
        <div className={styles.paper}>
          <Typography component="h1" variant="h5">
            {t('user:auth.confirmEmail.header')}
          </Typography>
          <Box mt={3}>
            <Typography variant="body2" color="textSecondary" align="center">
              <Trans t={t} i18nKey="user:auth.confirmEmail.resendEmail">
                Please check your email to verify your account. If you didn&apos;t get an email, please click
                <Button variant="contained" color="primary" onClick={(e) => handleResendEmail(e)}>
                  here
                </Button>{' '}
                to resend the verification email.
              </Trans>
            </Typography>
          </Box>
        </div>
      </Container>
    </EmptyLayout>
  )
}

const ConfirmEmailWrapper = (props): any => <ConfirmEmail {...props} />

export default ConfirmEmailWrapper
