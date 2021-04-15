import { withRouter } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { loginUserByJwt, refreshConnections } from '../../reducers/auth/service';
import Container from '@material-ui/core/Container';
import { selectAuthState } from '../../reducers/auth/selector';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';


const mapStateToProps = (state: any): any => {
  return {
    auth: selectAuthState(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  loginUserByJwt: bindActionCreators(loginUserByJwt, dispatch),
  refreshConnections: bindActionCreators(refreshConnections, dispatch)
});

const GithubCallbackComponent = (props): any => {
  const { auth, loginUserByJwt, refreshConnections, match } = props;

  const initialState = { error: '', token: '' };
  const [state, setState] = useState(initialState);

  useEffect(() => {
    const error = match.params.error as string;
    const token = match.params.token as string;
    const type = match.params.type as string;
    const path = match.params.path as string;
    const instanceId = match.params.instanceId as string;

    if (!error) {
      if (type === 'connection') {
        const user = auth.get('user');
        refreshConnections(user.id);
      } else {
        let redirectSuccess = `${path}`;
        if (instanceId != null) redirectSuccess += `?instanceId=${instanceId}`;
        loginUserByJwt(token, redirectSuccess || '/', '/');
      }
    }

    setState({ ...state, error, token });
  }, []);

  return state.error && state.error !== '' ? (
    <Container>
      Github authentication failed.
      <br />
      {state.error}
    </Container>
  ) : (
    <Container>Authenticating...</Container>
  );
};

export const GithubCallback = withRouter(connect(mapStateToProps, mapDispatchToProps)(GithubCallbackComponent));
