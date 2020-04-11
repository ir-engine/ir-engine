import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import {
  resetPassword,
} from '../../../redux/auth/service'
import { selectAuthState } from '../../../redux/auth/selector'
import './auth.scss'

interface Props {
  auth: any
  resetPassword: typeof resetPassword
};

const mapStateToProps = (state: any) => {
  return {
    auth: selectAuthState(state),
  }
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  resetPassword: bindActionCreators(resetPassword, dispatch)
});

class ResetPassword extends React.Component<Props> {
  state = {
    password: '',
    token: ''
  }

  componentDidMount() {

  }

  handleInput = (e: any) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleForgot = (e: any) => {
    e.preventDefault();

    this.props.resetPassword(this.state.token, this.state.password);
  }

  render() {
    return (
      <Container component="main" maxWidth="xs">
        <div className={'paper'}>
          <Typography component="h1" variant="h5">
            Reset Password
          </Typography>
  
          <Typography variant="body2" color="textSecondary" align="center">
            Please enter your password for your email address
          </Typography>
  
          <form className={'form'} noValidate onSubmit={(e) => this.handleForgot(e)}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="password"
              label="Password"
              name="password"
              autoComplete="password"
              autoFocus
              onChange={(e) => this.handleInput(e)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={'submit'}
            >
              Submit
            </Button>
          </form>
        </div>
      </Container>
    );
  }
}

function ResetPasswordWrapper(props: any) {
  return <ResetPassword {...props}/>
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ResetPasswordWrapper);
