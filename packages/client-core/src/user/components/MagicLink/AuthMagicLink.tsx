import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, withRouter } from 'react-router-dom'

import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import { AuthService } from '../../services/AuthService'
import { useAuthState } from '../../services/AuthService'
import ResetPassword from '../Auth/ResetPassword'
import { VerifyEmail } from '../Auth/VerifyEmail'

interface Props {
  //auth: any
  type: string
  token: string
  instanceId: string
  path: string
}

const AuthMagicLink = ({ token, type, instanceId, path }: Props): JSX.Element => {
  const { t } = useTranslation()
  const user = useAuthState().user
  useEffect(() => {
    if (type === 'login') {
      let redirectSuccess = path ? `${path}` : null
      if (redirectSuccess && instanceId != null)
        redirectSuccess += redirectSuccess.indexOf('?') > -1 ? `&instanceId=${instanceId}` : `?instanceId=${instanceId}`
      AuthService.loginUserByJwt(token, redirectSuccess || '/', '/')
    } else if (type === 'connection') {
      AuthService.loginUserMagicLink(token, '/', '/')
      // if (user !== null) {
      //   AuthService.refreshConnections(user.id.value!)
      // }
      // window.location.href = '/profile-connections'
    }
  }, [])

  return (
    <Container component="main" maxWidth="md">
      <Box mt={3}>
        <Typography variant="body2" color="textSecondary" align="center">
          {t('user:magikLink.wait')}
        </Typography>
      </Box>
    </Container>
  )
}

const AuthMagicLinkWrapper = (props: any): JSX.Element => {
  const search = new URLSearchParams(useLocation().search)
  const token = search.get('token') as string
  const type = search.get('type') as string
  const error = search.get('error') as string
  const path = search.get('path') as string
  const instanceId = search.get('instanceId') as string

  const handleResetPassword = (token: string, password: string): void => {
    AuthService.resetPassword(token, password)
  }

  if (type === 'verify') {
    return <VerifyEmail {...props} type={type} token={token} />
  } else if (type === 'reset') {
    return <ResetPassword resetPassword={handleResetPassword} token={token} />
  }
  return <AuthMagicLink {...props} token={token} type={type} instanceId={instanceId} path={path} />
}

export default withRouter(AuthMagicLinkWrapper)
