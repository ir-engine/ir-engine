import React from 'react'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import {
  resendVerificationEmail,
} from '../../../redux/auth/service'
import { selectAuthState } from '../../../redux/auth/selector'
import './auth.scss'
import EmptyLayout from '../Layout/EmptyLayout'
import { AuthUser } from 'interfaces/AuthUser'

interface Props {
  auth: any,
  resendVerificationEmail: typeof resendVerificationEmail
}

const mapStateToProps = (state: any) => {
  return {
    auth: selectAuthState(state),
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  resendVerificationEmail: bindActionCreators(resendVerificationEmail, dispatch)
})

class ConfirmEmail extends React.Component<Props> {
  handleResendEmail = (e: any) => {
    e.preventDefault()

    const authUser = this.props.auth.get("authUser") as AuthUser;
    this.props.resendVerificationEmail(authUser.identityProvider.token)
  }

  render() {
    return (
      <EmptyLayout>
        <Container component="main" maxWidth="md">
          <div className={'paper'}>
            <Typography component="h1" variant="h5">
            Confirmation Email
            </Typography>

            <Box mt={3}>
              <Typography variant="body2" color="textSecondary" align="center">
                Please check your email to verify your account.
                If you didn't get an email, please click 
                <Button onClick={(e) => this.handleResendEmail(e)}>here</Button> to resend the verification email.
              </Typography>
            </Box>
          </div>
        </Container>
      </EmptyLayout>
    )
  }
}

function ConfirmEmailWrapper(props: any) {
  return <ConfirmEmail {...props}/>
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConfirmEmailWrapper)
