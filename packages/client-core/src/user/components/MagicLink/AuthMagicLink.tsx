import React, { useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import {
  loginUserByJwt,
  refreshConnections,
  verifyEmail,
  resetPassword
} from '../../reducers/auth/service';
import { Dispatch, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import ResetPassword from '../Auth/ResetPassword';
import { VerifyEmail } from '../Auth/VerifyEmail';
import { User } from '@xr3ngine/common/src/interfaces/User';

interface Props {
  match: any;
  auth: any;
  verifyEmail: typeof verifyEmail;
  resetPassword: typeof resetPassword;
  loginUserByJwt: typeof loginUserByJwt;
  refreshConnections: typeof refreshConnections;
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  verifyEmail: bindActionCreators(verifyEmail, dispatch),
  resetPassword: bindActionCreators(resetPassword, dispatch),
  loginUserByJwt: bindActionCreators(loginUserByJwt, dispatch),
  refreshConnections: bindActionCreators(refreshConnections, dispatch)
});

const AuthMagicLink = (props: Props): any => {
  const { auth, loginUserByJwt, refreshConnections, match } = props;

  useEffect(() => {
    const type = match.params.type as string;
    const token = match.params.token as string;

    if (type === 'login') {
      loginUserByJwt(token, '/', '/');
    } else if (type === 'connection') {
      const user = auth.get('user') as User;
      if (user) {
        refreshConnections(user.id);
      }
      window.location.href = '/profile-connections';
    }
  }, []);

  return (
    <Container component="main" maxWidth="md">
      <Box mt={3}>
        <Typography variant="body2" color="textSecondary" align="center">
          Please wait a moment while processing...
        </Typography>
      </Box>
    </Container>
  );
};

const AuthMagicLinkWrapper = (props: any): any => {
  const type = props.match.params.type as string;
  const token = props.match.params.token as string;

  if (type === 'verify') {
    return <VerifyEmail {...props} type={type} token={token} />;
  } else if (type === 'reset') {
    return <ResetPassword {...props} type={type} token={token} />;
  }
  return <AuthMagicLink {...props} match={props.match} />;
};

export default withRouter(connect(null, mapDispatchToProps)(AuthMagicLinkWrapper));
