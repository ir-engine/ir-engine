import React from 'react';
import getConfig from 'next/config';
import MagicLinkEmail from '../ui/Auth/MagicLinkEmail';
import { PasswordLogin } from '../ui/Auth/PasswordLogin';
import SocialLogin from '../ui/Auth/SocialLogin';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { loginUserByOAuth } from '../../redux/auth/service';

import { Google } from '@styled-icons/bootstrap/Google';
import { Facebook } from '@styled-icons/bootstrap/Facebook';
import Fab from '@material-ui/core/Fab';

import styles from './styles/Login.module.scss';

const config = getConfig().publicRuntimeConfig;

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

const FlatSignIn = (props: Props) => {
  let enableUserPassword = false;
  let enableGoogleSocial = false;
  let enableFacebookSocial = false;

  if (config?.auth) {
    enableUserPassword = config.auth.enableUserPassword;
    enableGoogleSocial = config.auth.enableGoogleSocial;
    enableFacebookSocial = config.auth.enableFacebookSocial;
  }

  const socials = [
    enableGoogleSocial,
    enableFacebookSocial
  ];
  const enabled = [
    enableUserPassword,
    enableGoogleSocial,
    enableFacebookSocial
  ];

  const enabledCount = enabled.filter(v => v).length;
  const socialCount = socials.filter(v => v).length;

  let component = <MagicLinkEmail />;
  if (enabledCount === 1) {
   if (enableUserPassword) {
      component = <PasswordLogin />;
    } else if (socialCount > 0) {
      component = <SocialLogin />;
    }
  } else {
   const userTabPanel = enableUserPassword && <PasswordLogin/>;

  const handleGoogleLogin = (e: any): void => {
    e.preventDefault();
    loginUserByOAuth('google');
  };

  const handleFacebookLogin = (e: any): void => {
    e.preventDefault();
    loginUserByOAuth('facebook');
  };
console.log('auth', props.auth)
  component = (
    <section className={styles.loginPage}>
      {userTabPanel}
      {enableUserPassword && socialCount > 0 && <section className={styles.hr}><span>OR</span></section>}
      {socialCount > 0 && 
          <section className={styles.socialIcons}>
            {enableGoogleSocial && <Fab><Google size="24" onClick={(e) => handleGoogleLogin(e)}/></Fab>}          
            {enableFacebookSocial && <Fab><Facebook size="24" onClick={(e) => handleFacebookLogin(e)}/></Fab>}          
          </section> 
      }
    </section>
  );
  }

  return component;
};

export default connect(mapStateToProps, mapDispatchToProps)(FlatSignIn);