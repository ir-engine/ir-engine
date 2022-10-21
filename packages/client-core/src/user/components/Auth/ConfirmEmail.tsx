import React from 'react'
import { Trans, useTranslation } from 'react-i18next'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import EmptyLayout from '../../../common/components/EmptyLayout'
import { AuthService } from '../../services/AuthService'
import { useAuthState } from '../../services/AuthService'
import styles from './index.module.scss'

const ConfirmEmail = (): JSX.Element => {
  const auth = useAuthState()
  const { t } = useTranslation()
  const handleResendEmail = (e: any): any => {
    e.preventDefault()

    const identityProvider = auth.authUser.identityProvider

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
                {t('user:auth.confirmEmail.resendEmail', {
                  here: `${(
                    <Button variant="contained" color="primary" onClick={(e) => handleResendEmail(e)}>
                      here
                    </Button>
                  )}`
                })}
              </Trans>
            </Typography>
          </Box>
        </div>
      </Container>
    </EmptyLayout>
  )
}

export default ConfirmEmail
