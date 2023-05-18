import { useHookstate } from '@hookstate/core'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import { getMutableState } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/Box'
import Container from '@etherealengine/ui/src/Container'
import Typography from '@etherealengine/ui/src/Typography'

import { AuthService } from '../../services/AuthService'
import { AuthState } from '../../services/AuthService'
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
  const user = useHookstate(getMutableState(AuthState)).user
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
  const path = search.get('path') as string
  const instanceId = search.get('instanceId') as string

  if (type === 'verify') {
    return <VerifyEmail {...props} type={type} token={token} />
  }
  return <AuthMagicLink {...props} token={token} type={type} instanceId={instanceId} path={path} />
}

export default AuthMagicLinkWrapper
