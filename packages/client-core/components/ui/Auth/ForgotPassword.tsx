import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { forgotPassword } from '../../../redux/auth/service';
import Grid from '@material-ui/core/Grid';
import styles from './Auth.module.scss';

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  forgotPassword: bindActionCreators(forgotPassword, dispatch)
});

interface Props {
  classes: any;
  forgotPassword: typeof forgotPassword;
}

const ForgotPasswordComponent = (props: Props): any => {
  const { forgotPassword, classes } = props;
  const [state, setState] = useState({ email: '', isSubmitted: false });

  const handleInput = (e: any): void => {
    e.preventDefault();
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const handleForgot = (e: any): void => {
    e.preventDefault();
    forgotPassword(state.email);
    setState({ ...state, isSubmitted: true });
  };

  return (
    <Container component="main" maxWidth="xs">
      <div className={styles.paper}>
        <Typography component="h1" variant="h5">
          Forgot Password
        </Typography>

        <Typography variant="body2" color="textSecondary" align="center">
          Please enter your registered email address and we&apos;ll send you a
          password reset link.
        </Typography>

        <form
          className={styles.form}
          noValidate
          onSubmit={(e) => handleForgot(e)}
        >
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
                onChange={(e) => handleInput(e)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={styles.submit}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>

        {state.isSubmitted ? (
          <Typography variant="body2" color="textSecondary" align="center">
            <br />
            Reset Password Email was sent. Please check your email.
          </Typography>
        ) : (
          ''
        )}
      </div>
    </Container>
  );
};

const ForgotPasswordWrapper = (props: any): any => <ForgotPasswordComponent {...props} />;

export const ForgotPassword = connect(mapDispatchToProps)(ForgotPasswordWrapper);
