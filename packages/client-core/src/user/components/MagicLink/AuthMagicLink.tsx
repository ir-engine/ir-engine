import React, { useEffect } from 'react'
import { useLocation, withRouter } from 'react-router-dom'
import { AuthService } from '../../reducers/auth/AuthService'
import { Dispatch, bindActionCreators } from 'redux'
import { connect, useDispatch } from 'react-redux'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import ResetPassword from '../Auth/ResetPassword'
import { VerifyEmail } from '../Auth/VerifyEmail' 
import { useTranslation } from 'react-i18next'
import { useAuthState } from '../../reducers/auth/AuthState'
interface Props {
  auth: any
  type: string
  token: string
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  //verifyEmail: bindActionCreators(verifyEmail, dispatch),
  // resetPassword: bindActionCreators(resetPassword, dispatch),
  // loginUserByJwt: bindActionCreators(loginUserByJwt, dispatch),
  // refreshConnections: bindActionCreators(refreshConnections, dispatch)
})

const AuthMagicLink = (props: Props): any => {
  const { auth, token, type } = props
  const { t } = useTranslation()
  const dispatch = useDispatch()

  useEffect(() => {
    if (type === 'login') {
      dispatch(AuthService.loginUserByJwt(token, '/', '/'))
    } else if (type === 'connection') {
      const user = useAuthState().user
      if (user !== null) {
        dispatch(AuthService.refreshConnections(user.id.value))
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
  const dispatch = useDispatch()
  
  const handleResetPassword = (token: string, password: string): any => {
    dispatch(AuthService.resetPassword(token, password))
  }

  if (type === 'verify') {
    return <VerifyEmail {...props} type={type} token={token} />
  } else if (type === 'reset') {
    return <ResetPassword resetPassword={handleResetPassword} type={type} token={token} />
  }
  return <AuthMagicLink {...props} token={token} type={type} />
}

export default withRouter(connect(null, mapDispatchToProps)(AuthMagicLinkWrapper))
