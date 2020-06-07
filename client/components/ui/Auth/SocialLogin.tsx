import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Container from '@material-ui/core/Container'
import GitHubIcon from '@material-ui/icons/GitHub'
import FacebookIcon from '@material-ui/icons/Facebook'
import GoogleIcon from '../../assets/GoogleIcon'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import {
  loginUserByGithub,
  loginUserByGoogle,
  loginUserByFacebook
} from '../../../redux/auth/service'
import './style.scss'

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loginUserByGithub: bindActionCreators(loginUserByGithub, dispatch),
  loginUserByGoogle: bindActionCreators(loginUserByGoogle, dispatch),
  loginUserByFacebook: bindActionCreators(loginUserByFacebook, dispatch)
})

interface Props {
  auth: any
  isEnabledFacebook?: boolean
  isEnabledGithub?: boolean
  isEnabledGoogle?: boolean
  loginUserByGithub: typeof loginUserByGithub
  loginUserByGoogle: typeof loginUserByGoogle
  loginUserByFacebook: typeof loginUserByFacebook
};

const SocialLogin = (props: Props) => {
  const {
    isEnabledFacebook,
    isEnabledGithub,
    isEnabledGoogle,
    loginUserByFacebook,
    loginUserByGoogle,
    loginUserByGithub
  } = props

  const handleGithubLogin = (e: any) => {
    e.preventDefault()
    loginUserByGithub()
  }

  const handleGoogleLogin = (e: any) => {
    e.preventDefault()
    loginUserByGoogle()
  }

  const handleFacebookLogin = (e: any) => {
    e.preventDefault()
    loginUserByFacebook()
  }

  const githubButton = isEnabledGithub ? (
    <Grid item xs={12}>
      <Button
        onClick={(e) => handleGithubLogin(e)}
        startIcon={<GitHubIcon />}
        variant="contained"
        className="github"
        fullWidth={true}
      >
        Login with GitHub
      </Button>
    </Grid>
  ) : (
    ''
  )
  const googleButton = isEnabledGoogle ? (
    <Grid item xs={12}>
      <Button
        onClick={(e) => handleGoogleLogin(e)}
        startIcon={<GoogleIcon />}
        variant="contained"
        className="google"
        fullWidth={true}
      >
        Login with Google
      </Button>
    </Grid>
  ) : (
    ''
  )
  const facebookButton = isEnabledFacebook ? (
    <Grid item xs={12}>
      <Button
        onClick={(e) => handleFacebookLogin(e)}
        startIcon={<FacebookIcon />}
        variant="contained"
        className="facebook"
        fullWidth={true}
      >
        Login with Facebook
      </Button>
    </Grid>
  ) : (
    ''
  )

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

const SocialLoginWrapper = (props: any) => <SocialLogin {...props} />

export default connect(mapDispatchToProps)(SocialLoginWrapper)
