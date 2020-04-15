import React from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import {
  forgotPassword,
} from '../../../redux/auth/service'
import { selectAuthState } from '../../../redux/auth/selector'
import Grid from '@material-ui/core/Grid'
import './auth.scss'
import EmptyLayout from '../Layout/EmptyLayout'

interface Props {
  auth: any
  forgotPassword: typeof forgotPassword
};

const mapStateToProps = (state: any) => {
  return {
    auth: selectAuthState(state),
  }
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  forgotPassword: bindActionCreators(forgotPassword, dispatch)
});

class ForgotPassword extends React.Component<Props> {
  state = {
    email: '',
    isSubmitted: false
  }

  handleInput = (e: any) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleForgot = (e: any) => {
    e.preventDefault();

    this.props.forgotPassword(this.state.email);
    this.setState({
      isSubmitted: true
    });
  }

  render() {
    return (
      <EmptyLayout>
        <Container component="main" maxWidth="xs">
          <div className={'paper'}>
            <Typography component="h1" variant="h5">
              Forgot Password
            </Typography>
    
            <Typography variant="body2" color="textSecondary" align="center">
              Please enter your registered email address and we'll send you a password reset link.
            </Typography>
    
            <form className={'form'} noValidate onSubmit={(e) => this.handleForgot(e)}>
              <Grid container>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    onChange={(e) => this.handleInput(e)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={'submit'}
                  >
                    Submit
                  </Button>
                </Grid>
              </Grid>
            </form>

            {this.state.isSubmitted ? 
            (
              <Typography variant="body2" color="textSecondary" align="center">
                <br/>
                Reset Password Email was sent. Please check your email.
              </Typography>
            )
            : ''}
            
          </div>
        </Container>
      </EmptyLayout>
    );
  }
}

function ForgotPasswordWrapper(props: any) {
  return <ForgotPassword {...props}/>
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ForgotPasswordWrapper);
