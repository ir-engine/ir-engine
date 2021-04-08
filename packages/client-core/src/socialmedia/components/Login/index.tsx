import React, { useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import CardMedia from '@material-ui/core/CardMedia';
import { Google } from '@styled-icons/bootstrap/Google';
import { Facebook } from '@styled-icons/bootstrap/Facebook';
import Fab from '@material-ui/core/Fab';
import styles from './Login.module.scss';
import { Config } from '../../../helper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ForgotPassword from '../../../user/components/Auth/ForgotPassword';
import PasswordLoginApp from '../../../user/components/Auth/PasswordLoginApp';
import RegisterApp from '../../../user/components/Auth/RegisterApp';
import ResetPassword from '../../../user/components/Auth/ResetPassword';
import { loginUserByOAuth, resetPassword, registerUserByEmail } from '../../../user/reducers/auth/service';

const mapStateToProps = (state: any): any => {
  return {};
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  loginUserByOAuth: bindActionCreators(loginUserByOAuth, dispatch),
  resetPassword: bindActionCreators(resetPassword, dispatch),
  registerUserByEmail: bindActionCreators(registerUserByEmail, dispatch),
});

interface Props {
  auth?: any;
  enableFacebookSocial?: boolean;
  enableGithubSocial?: boolean;
  enableGoogleSocial?: boolean;
  loginUserByOAuth?: typeof loginUserByOAuth;
  logo: string;
  isAddConnection?: boolean;
  resetPassword?: typeof resetPassword;
  registerUserByEmail?: typeof registerUserByEmail;
}
const FlatSignIn = (props: Props) => {
  const [view, setView] =  useState('login');
  const enableUserPassword = Config.publicRuntimeConfig?.auth ? Config.publicRuntimeConfig.auth.enableUserPassword : false;
  const enableGoogleSocial = Config.publicRuntimeConfig?.auth ? Config.publicRuntimeConfig.auth.enableGoogleSocial : false;
  const enableFacebookSocial = Config.publicRuntimeConfig?.auth ? Config.publicRuntimeConfig.auth.enableFacebookSocial : false;

  const socials = [
    enableGoogleSocial,
    enableFacebookSocial
  ];

  const socialCount = socials.filter(v => v).length;

  const userTabPanel = enableUserPassword && <PasswordLoginApp />;

  const handleGoogleLogin = (e: any): void => {
    e.preventDefault();
    loginUserByOAuth('google');
  };

  const handleFacebookLogin = (e: any): void => {
    e.preventDefault();
    loginUserByOAuth('facebook');
  };
let component = null;
let footer = null;

switch (view) {
    case 'sign-up': component = <RegisterApp />;                      
                    footer = <>{!props.isAddConnection &&  (
                      <p>
                        Have an account? 
                        <span onClick={()=>setView('login')}> Log in</span>
                      </p>
                    )} </>; break;
    case 'forget-password': component = <><ForgotPassword /><span onClick={()=>setView('reset-password')}> Reset Password Fake button (here would be a link from email)</span></>;
                  footer = <>{!props.isAddConnection &&  (
                    <p>
                      Don&apos;t have an account? 
                      <span onClick={()=>setView('sign-up')}> Sign Up</span>
                    </p>
                  )}</>;
                  break;          
                  // completeAction={()=>setView('login')} removed from ResetPassword since it failed lintsub
    case 'reset-password': component = <><ResetPassword resetPassword={resetPassword} token={''}  /><span className={styles.placeholder} /></>;                  
                  footer = <>{!props.isAddConnection &&  (
                    <p />
                  )} </>;break;

    //login by default
    default: component = <>{userTabPanel}
      <Typography variant="h3" align="right" onClick={()=>setView('forget-password')}>Forgot password?</Typography>  
      </>; 
      footer = <>{!props.isAddConnection &&  (
        <p>
          Don&apos;t have an account? 
          <span onClick={()=>setView('sign-up')}> Sign Up</span>
        </p>
      )}</>;
      break;
  }

  return <section className={styles.loginPage}>
        {view !== 'login' && <Button variant="text" className={styles.backButton}  onClick={()=>setView('login')}><ArrowBackIosIcon />Back</Button>}
        <span className={styles.placeholder} />
        <CardMedia   
          className={styles.logo}                  
              image={props.logo}
              title="ARC Logo"
          />
          <span className={styles.placeholder} />
          {component}        
          {enableUserPassword && socialCount > 0 && <section className={styles.hr}><span>OR</span></section>}
          {socialCount > 0 && 
              <section className={styles.socialIcons}>
                {enableGoogleSocial && <Fab><Google size="24" onClick={(e) => handleGoogleLogin(e)}/></Fab>}          
                {enableFacebookSocial && <Fab><Facebook size="24" onClick={(e) => handleFacebookLogin(e)}/></Fab>}          
              </section> 
          }
          <span className={styles.placeholder} />
          <section className={styles.footer}>{footer}</section>
      </section>;
};

export default connect(mapStateToProps, mapDispatchToProps)(FlatSignIn);
