import React from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { 
  loginUserByGithub,
  loginUserByEmail,
  logoutUser, 
  registerUserByEmail
} from '../../../redux/auth/service'
import { selectAuthState } from '../../../redux/auth/selector'

interface LoginProps {
  auth: any,
  loginUserByEmail: typeof loginUserByEmail;
  logoutUser: typeof logoutUser;
  loginUserByGithub: typeof loginUserByGithub;
  registerUserByEmail: typeof registerUserByEmail;
}

const mapStateToProps = (state: any) => {
  return {
    auth: selectAuthState(state),
  }
}
const mapDispatchToProps = (dispatch: Dispatch) => ({
  loginUserByEmail: bindActionCreators(loginUserByEmail, dispatch),
  logoutUser: bindActionCreators(logoutUser, dispatch),
  loginUserByGithub: bindActionCreators(loginUserByGithub, dispatch),
  registerUserByEmail: bindActionCreators(registerUserByEmail, dispatch),
})

class Login extends React.Component<LoginProps> {
  state = {
    email: '',
    password: ''
  };

  handleInput = (e: any) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleEmailLogin = (e: any) => {
    e.preventDefault()
    this.props.loginUserByEmail({
      email: this.state.email,
      password: this.state.password
    });
  }

  handleGithubLogin = (e: any) => {
    e.preventDefault()
    this.props.loginUserByGithub();
  }

  handleEmailSignup = (e: any) => {
    e.preventDefault()
    
    this.props.registerUserByEmail({
      email: this.state.email,
      password: this.state.password
    });
  }

  render() {
    const { auth } = this.props;

    return (
      <Dialog open={!auth.get('isLogined')}>
        <DialogTitle id="login-form">Log In</DialogTitle>

        <DialogContent>
          <DialogContentText>
            You must be logged in to continue. Registration is easy and free!
          </DialogContentText>

          <Button onClick={(e: any) => this.handleGithubLogin(e)}>
            <a>Log In With Github</a>
          </Button>

          <TextField
            type="email"
            name="email"
            id="email"
            placeholder="email"
            value={this.state.email}
            onChange={(e: any) => this.handleInput(e)}
          />

          <TextField
            type="password"
            name="password"
            placeholder="password"
            value={this.state.password}
            onChange={(e: any) => this.handleInput(e)}
          />
          <Button id="signup" onClick={(e: any) => this.handleEmailSignup(e)}>
            Sign Up
          </Button>
          <Button id="login" onClick={(e: any) => this.handleEmailLogin(e)}>
            {' '}
            Login{' '}
          </Button>
        </DialogContent>
      </Dialog>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
