import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { selectAuthState } from '../../../redux/auth/selector';
import {
  createMagicLink,
  addConnectionByEmail,
  addConnectionBySms
} from '../../../redux/auth/service';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import NextLink from 'next/link';
import getConfig from 'next/config';
import styles from './Auth.module.scss';
import { User } from '@xr3ngine/common/interfaces/User';

const config = getConfig().publicRuntimeConfig.staticPages;
const authConfig = getConfig().publicRuntimeConfig.auth;

interface Props {
  auth?: any;
  type?: 'email' | 'sms' | undefined;
  isAddConnection?: boolean;
  createMagicLink?: typeof createMagicLink;
  addConnectionBySms?: typeof addConnectionBySms;
  addConnectionByEmail?: typeof addConnectionByEmail;
}

const mapStateToProps = (state: any): any => {
  return {
    auth: selectAuthState(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  createMagicLink: bindActionCreators(createMagicLink, dispatch),
  addConnectionBySms: bindActionCreators(addConnectionBySms, dispatch),
  addConnectionByEmail: bindActionCreators(addConnectionByEmail, dispatch)
});

const defaultState = {
  emailPhone: '',
  isSubmitted: false,
  isAgreedTermsOfService: false,
  label: '',
  descr: ''
};

const termsOfService = (config?.termsOfService) ?? '/terms-of-service';

const MagicLinkEmail = (props: Props): any => {
  const { auth, type, isAddConnection, createMagicLink, addConnectionBySms, addConnectionByEmail } = props;
  const [state, setState] = useState(defaultState);

  const handleInput = (e: any): any => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const handleCheck = (e: any): any => {
    setState({ ...state, [e.target.name]: e.target.checked });
  };

  const handleSubmit = (e: any): any => {
    e.preventDefault();
    if (!isAddConnection) {
      createMagicLink(state.emailPhone);
      setState({ ...state, isSubmitted: true });
      return;
    }

    const user = auth.get('user') as User;
    const userId = user ? user.id : '';
    if (type === 'email') {
      addConnectionByEmail(state.emailPhone, userId);
    } else {
      addConnectionBySms(state.emailPhone, userId);
    }
  };
  let descr = '';
  let label = '';

  useEffect(() => {
    // Pass in a type
    if (type === 'email') {
      descr =
        "Please enter your email address and we'll send you a login link via Email.";
      label = 'Email address';
      return;
    } else if (type === 'sms') {
      descr =
        "Please enter your phone number and we'll send you a login link via SMS.";
      label = 'Phone number';
      return;
    } else if (!authConfig) {
      descr =
        "Please enter your email address and we'll send you a login link via Email. ";
      label = 'Email address';
      return;
    }
    // Auth config is using Sms and Email, so handle both
    if (
      authConfig.enableSmsMagicLink &&
      authConfig.enableEmailMagicLink &&
      !type
    ) {
      descr =
        "Please enter your email address or phone number (10 digit, US only) and we'll send you a login link via Email or SMS.";
      label = 'Email or Phone number';
    } else if (authConfig.enableSmsMagicLink) {
      descr =
        "Please enter your phone number (10 digit, US only) and we'll send you a login link via SMS.";
      label = 'Phone number';
    } else {
      descr =
        "Please enter your email address and we'll send you a login link via Email. ";
      label = 'Email address';
    }

    setState({ ...state, label: label, descr: descr });
  }, []);

  return (
    <Container component="main" maxWidth="xs">
      <div>
        <Typography component="h1" variant="h5">
          Login Link
        </Typography>

        <Typography variant="body2" color="textSecondary" align="center">
          {state.descr}
        </Typography>

        <form className={styles.form} noValidate onSubmit={(e) => handleSubmit(e)}>
          <Grid container>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="emailPhone"
                label={state.label}
                name="emailPhone"
                // autoComplete="email"
                autoFocus
                onChange={(e) => handleInput(e)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    value={true}
                    onChange={(e) => handleCheck(e)}
                    color="primary"
                    name="isAgreedTermsOfService"
                  />
                }
                label={
                  <div className={styles.termsLink}>
                    I agree to the{' '}
                    <NextLink href={termsOfService} >
                      Terms &amp; Conditions
                    </NextLink>
                  </div>
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={styles.submit}
                disabled={!state.isAgreedTermsOfService}
              >
                Send Login Link
              </Button>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  );
};

const MagicLinkEmailWrapper = (props: Props): any => <MagicLinkEmail {...props} />;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MagicLinkEmailWrapper);
