import React, { useEffect } from 'react'
import { useLocation, withRouter } from 'react-router-dom'
import { loginUserByJwt, refreshConnections, verifyEmail, resetPassword } from '../../reducers/auth/service'
import { Dispatch, bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import ResetPassword from '../Auth/ResetPassword'
import { VerifyEmail } from '../Auth/VerifyEmail'
import { User } from '@xrengine/common/src/interfaces/User'
import { useTranslation } from 'react-i18next'

interface Props {
  auth: any
  verifyEmail: typeof verifyEmail
  resetPassword: typeof resetPassword
  loginUserByJwt: typeof loginUserByJwt
  refreshConnections: typeof refreshConnections
  type: string
  token: string
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  verifyEmail: bindActionCreators(verifyEmail, dispatch),
  resetPassword: bindActionCreators(resetPassword, dispatch),
  loginUserByJwt: bindActionCreators(loginUserByJwt, dispatch),
  refreshConnections: bindActionCreators(refreshConnections, dispatch)
})

const AuthMagicLink = (props: Props): any => {
  const { auth, loginUserByJwt, refreshConnections, token, type } = props
  const { t } = useTranslation()

  useEffect(() => {
    if (type === 'login') {
      loginUserByJwt(token, '/', '/')
    } else if (type === 'connection') {
      const user = auth.get('user') as User
      if (user) {
        refreshConnections(user.id)
      }
      window.location.href = '/profile-connections'
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

const AuthMagicLinkWrapper = (props: any): any => {
  const search = new URLSearchParams(useLocation().search)
  const token = search.get('token') as string
  const type = search.get('type') as string

  if (type === 'verify') {
    return <VerifyEmail {...props} type={type} token={token} />
  } else if (type === 'reset') {
    return <ResetPassword {...props} type={type} token={token} />
  }
  return <AuthMagicLink {...props} token={token} type={type} />
}

export default withRouter(connect(null, mapDispatchToProps)(AuthMagicLinkWrapper))
