import React from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import GitHubIcon from '@material-ui/icons/GitHub';
import FacebookIcon from '@material-ui/icons/Facebook';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import {
  loginUserByOAuth
} from '../../../redux/auth/service';
import styles from './Auth.module.scss';

const mapStateToProps = (state: any): any => {
  return {};
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  loginUserByOAuth: bindActionCreators(loginUserByOAuth, dispatch)
});

interface Props {
  auth?: any;
  enableFacebookSocial?: boolean;
  enableGithubSocial?: boolean;
  enableGoogleSocial?: boolean;
  loginUserByOAuth?: typeof loginUserByOAuth;
}

const SocialLogin = (props: Props): any => {
  const {
    enableFacebookSocial,
    enableGithubSocial,
    enableGoogleSocial,
    loginUserByOAuth
  } = props;

  const handleGithubLogin = (e: any): void => {
    e.preventDefault();
    loginUserByOAuth('github');
  };

  const handleGoogleLogin = (e: any): void => {
    e.preventDefault();
    loginUserByOAuth('google');
  };

  const handleFacebookLogin = (e: any): void => {
    e.preventDefault();
    loginUserByOAuth('facebook');
  };

  const githubButton = enableGithubSocial ? (
    <Grid item xs={12}>
      <Button
        onClick={(e) => handleGithubLogin(e)}
        startIcon={<GitHubIcon />}
        variant="contained"
        className={styles.github}
        fullWidth={true}
      >
        Login with GitHub
      </Button>
    </Grid>
  ) : (
    ''
  );
  const googleButton = enableGoogleSocial ? (
    <Grid item xs={12}>
      <Button
        onClick={(e) => handleGoogleLogin(e)}
        variant="contained"
        className={styles.google}
        fullWidth={true}
      >
        Login with Google
      </Button>
    </Grid>
  ) : (
    ''
  );
  const facebookButton = enableFacebookSocial ? (
    <Grid item xs={12}>
      <Button
        onClick={(e) => handleFacebookLogin(e)}
        startIcon={<FacebookIcon />}
        variant="contained"
        className={styles.facebook}
        fullWidth={true}
      >
        Login with Facebook
      </Button>
    </Grid>
  ) : (
    ''
  );

  return (
    <Container component="main" maxWidth="xs">
      <div className={styles.paper}>
        <Grid container justify="center" spacing={2}>
          {githubButton}
          {facebookButton}
          {googleButton}
        </Grid>
      </div>
    </Container>
  );
};

const SocialLoginWrapper = (props: Props): any => <SocialLogin {...props} />;

export default connect(mapStateToProps, mapDispatchToProps)(SocialLoginWrapper);
