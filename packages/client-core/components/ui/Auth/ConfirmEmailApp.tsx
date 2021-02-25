import React from 'react';
import Router from "next/router";

import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { resendVerificationEmail } from '../../../redux/auth/service';
import { selectAuthState } from '../../../redux/auth/selector';
import { EmptyLayout }from '../Layout/EmptyLayout';
import { IdentityProvider } from '@xr3ngine/common/interfaces/IdentityProvider';
import CardMedia from '@material-ui/core/CardMedia';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';


import styles from '../../social/Login/Login.module.scss';

const mapStateToProps = (state: any): any => {
  return {
    auth: selectAuthState(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  resendVerificationEmail: bindActionCreators(resendVerificationEmail, dispatch)
});

interface Props {
  logo?: string;
  auth?: any;
  resendVerificationEmail?: typeof resendVerificationEmail;
}

const ConfirmEmail = (props: Props): any => {
  const { auth, resendVerificationEmail } = props;
  const handleResendEmail = (e: any): any => {
    e.preventDefault();

    const identityProvider = auth.get('identityProvider') as IdentityProvider;
    console.log('---------', identityProvider);
    resendVerificationEmail(identityProvider.token);
  };

  return (
    <section className={styles.loginPage}>
        <span className={styles.placeholder} />
        <CardMedia   
          className={styles.logo}                  
              image={props.logo}
              title="ARC Logo"
          />
          <span className={styles.placeholder} />
          <Typography component="h1" variant="h5" align="center">
            Confirmation Email
          </Typography>
          <section className={styles.content}>
            <Typography variant="body2" color="textSecondary" align="center">
                Please check your email to verify your account.
                If you didn&apos;t get an email, please click
              <Button variant="contained" color="primary" onClick={(e) => handleResendEmail(e)}>here</Button><br />
               to resend the verification email.
            </Typography>
          </section>
          <span className={styles.placeholder} />
          <section className={styles.footer}><p>Have an account? <span onClick={()=>Router.push('/login')}> Log in</span></p></section>
    </section>
  );
};

const ConfirmEmailWrapper = (props: Props): any => <ConfirmEmail {...props}/>;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConfirmEmailWrapper);
