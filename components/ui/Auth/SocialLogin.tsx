import React from 'react'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Container from '@material-ui/core/Container'
import GitHubIcon from '@material-ui/icons/GitHub'
import FacebookIcon from '@material-ui/icons/Facebook'
import GoogleIcon from '../../assets/GoogleIcon'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { selectAuthState } from '../../../redux/auth/selector'
import {
  loginUserByGithub,
  loginUserByGoogle,
  loginUserByFacebook
} from '../../../redux/auth/service'
import './auth.scss'

interface Props {
  auth: any
  loginUserByGithub: typeof loginUserByGithub
  loginUserByGoogle: typeof loginUserByGoogle
  loginUserByFacebook: typeof loginUserByFacebook
  isEnableFacebook?: boolean
  isEnableGoogle?: boolean
  isEnableGithub?: boolean
};

const mapStateToProps = (state: any) => {
  return {
    auth: selectAuthState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loginUserByGithub: bindActionCreators(loginUserByGithub, dispatch),
  loginUserByGoogle: bindActionCreators(loginUserByGoogle, dispatch),
  loginUserByFacebook: bindActionCreators(loginUserByFacebook, dispatch)
})

class SocialLogin extends React.Component<Props> {
  state = {
    email: '',
    password: ''
  }

  handleInput = (e: any) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleGithubLogin = (e: any) => {
    e.preventDefault()
    this.props.loginUserByGithub()
  }

  handleGoogleLogin = (e: any) => {
    e.preventDefault()
    this.props.loginUserByGithub()
  }

  handleFacebookLogin = (e: any) => {
    e.preventDefault()
    this.props.loginUserByGithub()
  }

  render () {
    const { isEnableFacebook, isEnableGoogle, isEnableGithub } = this.props
    console.log('social login', isEnableFacebook, isEnableGoogle, isEnableGithub)
    const githubButton = isEnableGithub
      ? (
        <Grid item xs={12}>
          <Button
            onClick={(e) => this.handleGithubLogin(e)}
            startIcon={<GitHubIcon/>}
            variant="contained"
            className="github"
            fullWidth={true}
          >
            Login with GitHub
          </Button>
        </Grid>
      ) : ''
    const googleButton = isEnableGoogle
      ? (
        <Grid item xs={12}>
          <Button
            onClick={(e) => this.handleGoogleLogin(e)}
            startIcon={<GoogleIcon/>}
            variant="contained"
            className="google"
            fullWidth={true}
          >
              Login with Google
          </Button>
        </Grid>
      ) : ''
    const facebookButton = isEnableFacebook
      ? (
        <Grid item xs={12}>
          <Button
            onClick={(e) => this.handleFacebookLogin(e)}
            startIcon={<FacebookIcon/>}
            variant="contained"
            className="facebook"
            fullWidth={true}
          >
            Login with Facebook
          </Button>
        </Grid>
      ) : ''

    return (
      <Container component="main" maxWidth="xs">
        <div className="paper">
          <Grid container justify="center" spacing={2}>
            {githubButton}
            {facebookButton}
            {googleButton}
          </Grid>
        </div>
      </Container>
    )
  }
}

function SocialLoginWrapper(props: any) {
  return <SocialLogin {...props}/>
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SocialLoginWrapper)
