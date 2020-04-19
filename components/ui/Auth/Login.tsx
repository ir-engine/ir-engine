import React, { Fragment } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import EmailIcon from '@material-ui/icons/Email';
import SocialIcon from '@material-ui/icons/Public';
import UserIcon from '@material-ui/icons/Person';
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { 
  loginUserByGithub,
  loginUserByEmail,
  loginUserByGoogle,
  loginUserByFacebook,
  createMagicLink,
} from '../../../redux/auth/service'
import { selectAuthState } from '../../../redux/auth/selector'
import getConfig from 'next/config'
import MagicLinkEmail from './MagicLinkEmail';
import { Tabs, Tab } from '@material-ui/core';
import './auth.scss'
import SocialLogin from './SocialLogin';
import { showDialog } from '../../../redux/dialog/service';
import SignUp from '../Auth/Register';
import ForgotPassword from '../Auth/ForgotPassword';

const config = getConfig().publicRuntimeConfig;

interface Props {
  auth: any
  loginUserByEmail: typeof loginUserByEmail
  loginUserByGithub: typeof loginUserByGithub
  loginUserByGoogle: typeof loginUserByGoogle
  loginUserByFacebook: typeof loginUserByFacebook,
  createMagicLink: typeof createMagicLink,
  showDialog: typeof showDialog
}

const mapStateToProps = (state: any) => {
  return {
    auth: selectAuthState(state),
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loginUserByEmail: bindActionCreators(loginUserByEmail, dispatch),
  loginUserByGithub: bindActionCreators(loginUserByGithub, dispatch),
  loginUserByGoogle: bindActionCreators(loginUserByGoogle, dispatch),
  loginUserByFacebook: bindActionCreators(loginUserByFacebook, dispatch),
  createMagicLink: bindActionCreators(createMagicLink, dispatch),
  showDialog: bindActionCreators(showDialog, dispatch)
})

class SignIn extends React.Component<Props> {
  state = {
    email: '',
    password: ''
  }

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

  render() {
    return (
        <Container component="main" maxWidth="xs">
          <div className={'paper'}>
            <Avatar className={'avatar'}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <form className={'form'} noValidate onSubmit={(e) => this.handleEmailLogin(e)}>
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
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    onChange={(e) => this.handleInput(e)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Checkbox value="remember" color="primary" />}
                    label="Remember me"
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
                    Sign In
                  </Button>
                </Grid>

                <Grid item xs>
                  <Link href="#" variant="body2" onClick={() => this.props.showDialog({
                      children: (
                        <ForgotPassword />
                      )
                    })}>
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="#" variant="body2" onClick={() => this.props.showDialog({
                      children: (
                        <SignUp />
                      )
                    })}>
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </form>
          </div>
        </Container>
    );
  }
}

function TabPanel(props: any) {
  const { children, value, index } = props;

  return (
    <Fragment>
      {value === index && children}
    </Fragment>
  );
}

function SignInWrapper(props: any) {
  // const isEnableEmailMagicLink = (config ? config.isEnableEmailMagicLink : true);
  let isEnableSmsMagicLink = true;
  let isEnableEmailMagicLink = true;
  let isEnableUserPassword = false;
  let isEnableGithub = false;
  let isEnableGoogle = false;
  let isEnableFacebook = false;
  const [tabIndex, setTabIndex] = React.useState(0);

  const handleChange = (event: any, newValue: number) => {
    event.preventDefault();
    setTabIndex(newValue);
  };

  if (config && config.auth) {
      isEnableSmsMagicLink = config.auth.isEnableSmsMagicLink;
      isEnableEmailMagicLink = config.auth.isEnableEmailMagicLink;
      isEnableUserPassword = config.auth.isEnableUserPassword;
      isEnableGithub = config.auth.isEnableGithub;
      isEnableGoogle = config.auth.isEnableGoogle;
      isEnableFacebook = config.auth.isEnableFacebook;
  }

  const socials = [
    isEnableGithub, 
    isEnableGoogle, 
    isEnableFacebook
  ];
  const enabled = [
    isEnableSmsMagicLink,
    isEnableEmailMagicLink,
    isEnableUserPassword,
    isEnableGithub,
    isEnableGoogle,
    isEnableFacebook,
  ];

  const enabled_count = enabled.filter(v => v).length;
  const social_count = socials.filter(v => v).length;

  let component = <MagicLinkEmail {...props}></MagicLinkEmail>;
  if (enabled_count == 1) {
    if (isEnableSmsMagicLink) {
      component = <MagicLinkEmail {...props}></MagicLinkEmail>;
    }
    else if (isEnableEmailMagicLink) {
      component = <MagicLinkEmail {...props}></MagicLinkEmail>;
    }
    else if (isEnableUserPassword) {
      component = <SignIn {...props}></SignIn>
    }
    else if (social_count > 0) {
      component = <SocialLogin {...props}></SocialLogin>
    }
  }
  else {
    let index = 0;
    const emailTab      = isEnableEmailMagicLink  && <Tab icon={<EmailIcon/>} label="Email | SMS"/>
    const emailTabPanel = isEnableEmailMagicLink  && <TabPanel value={tabIndex} index={index}><MagicLinkEmail {...props}/></TabPanel>
    isEnableEmailMagicLink && ++index;
    
    const userTab       = isEnableUserPassword && <Tab icon={<UserIcon/>} label="UserName + Password"/>
    const userTabPanel  = isEnableUserPassword && <TabPanel value={tabIndex} index={index}><SignIn {...props}/></TabPanel>
    isEnableUserPassword && ++index;

    const socialTab       = social_count > 0 && <Tab icon={<SocialIcon/>} label="Social"/>
    const socialTabPanel  = social_count > 0 && <TabPanel value={tabIndex} index={index}><SocialLogin {...props} isEnableFacebook={isEnableFacebook} isEnableGoogle={isEnableGoogle} isEnableGithub={isEnableGithub}/></TabPanel>
    social_count > 0 && ++index;
    
    console.log(social_count, socialTabPanel);
    
    component = (
      <Fragment>
        <Tabs
          value={tabIndex}
          onChange={handleChange}
          variant="fullWidth"
          indicatorColor="secondary"
          textColor="secondary"
          aria-label="Login Configure"
        >
          {emailTab}
          {userTab}
          {socialTab}
        </Tabs>
        {emailTabPanel}
        {userTabPanel}
        {socialTabPanel}
      </Fragment>
    )
  }

  return component;
  // return (
  //   <EmptyLayout>
  //     {component}
  //   </EmptyLayout>
  // );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SignInWrapper)
