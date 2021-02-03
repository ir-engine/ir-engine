import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import EmptyLayout from '../Layout/EmptyLayout';
import { resetPassword } from '../../../redux/auth/service';
import styles from './Auth.module.scss';

interface Props {
  resetPassword: typeof resetPassword;
  token: string;
}

const ResetPassword = (props: Props): any => {
  const { resetPassword, token } = props;
  const initialState = { password: '' };
  const [state, setState] = useState(initialState);

  const handleInput = (e: any): void => {
    e.preventDefault();
    setState({ ...state, [e.target.name]: e.target.value });
  };
  const handleReset = (e: any): void => {
    e.preventDefault();
    resetPassword(token, state.password);
  };

  return (
    <EmptyLayout>
      <Container component="main" maxWidth="xs">
        <div className={styles.paper}>
          <Typography component="h1" variant="h5">
            Reset Password
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center">
            Please enter your password for your email address
          </Typography>
          <form className={styles.form} noValidate onSubmit={(e) => handleReset(e)}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="password"
              label="Password"
              name="password"
              autoComplete="password"
              autoFocus
              onChange={(e) => handleInput(e)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={styles.submit}
            >
              Submit
            </Button>
          </form>
        </div>
      </Container>
    </EmptyLayout>
  );
};

export default ResetPassword;
