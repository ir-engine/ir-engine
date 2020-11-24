import { useRouter, NextRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { loginUserByJwt, refreshConnections } from '../../../redux/auth/service';
import { Container } from '@material-ui/core';
import { selectAuthState } from '../../../redux/auth/selector';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

interface Props {
  auth: any;
  router: NextRouter;
  loginUserByJwt: typeof loginUserByJwt;
  refreshConnections: typeof refreshConnections;
}

const mapStateToProps = (state: any): any => {
  return { auth: selectAuthState(state) };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  loginUserByJwt: bindActionCreators(loginUserByJwt, dispatch),
  refreshConnections: bindActionCreators(refreshConnections, dispatch)
});

const GoogleCallback = (props: Props): any => {
  const { auth, loginUserByJwt, refreshConnections, router } = props;

  const initialState = { error: '', token: '' };
  const [state, setState] = useState(initialState);

  useEffect(() => {
    const error = router.query.error as string;
    const token = router.query.token as string;
    const type = router.query.type as string;

    if (!error) {
      if (type === 'connection') {
        const user = auth.get('user');
        refreshConnections(user.id);
      } else {
        loginUserByJwt(token, '/', '/', '');
      }
    }

    setState({ ...state, error, token });
  }, []);

  return state.error && state.error !== '' ? (
    <Container>
      Google authentication failed.
      <br />
      {state.error}
    </Container>
  ) : (
    <Container>Authenticating...</Container>
  );
};

const GoogleCallbackWrapper = (props: any): any => {
  const router = useRouter();
  return <GoogleCallback {...props} router={router} />;
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GoogleCallbackWrapper);
