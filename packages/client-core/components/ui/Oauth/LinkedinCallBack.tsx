import { useRouter, NextRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { loginUserByJwt, refreshConnections } from '../../../redux/auth/service';
import { selectAuthState } from '../../../redux/auth/selector';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Container } from '@material-ui/core';

interface Props {
    auth: any;
    router: NextRouter;
    loginUserByJwt: typeof loginUserByJwt;
    refreshConnections: typeof refreshConnections;
  }

  const mapStateToProps = (state: any): any => {
    return {
      auth: selectAuthState(state)
    };
  };

  const mapDispatchToProps = (dispatch: Dispatch): any => ({
    loginUserByJwt: bindActionCreators(loginUserByJwt, dispatch),
    refreshConnections: bindActionCreators(refreshConnections, dispatch)
  });

  const LinkedinCallbackComponent = (props: Props): any => {
      const { auth, loginUserByJwt, refreshConnections, router } = props;

      const initialState = { error: '', token: '' };
      const [state, setState] = useState(initialState);

      useEffect(()=> {
        const error = router.query.error as string;
        const token = router.query.token as string;
        const type = router.query.type as string;
        const path = router.query.path as string;
        const instanceId = router.query.instanceId as string;

        if(!error){
            if (type === 'connection') {
                const user = auth.get("user");
                refreshConnections(user.id);
            } else {
                loginUserByJwt(token, `${path}?instanceId=${instanceId}` || '/', '/');
            }
        }

        setState({ ...state, error, token });
      }, []);

      return state.error && state.error !== '' ? (
        <Container>
          Linkedin authentication failed.
          <br />
          {state.error}
        </Container>
      ) : (
        <Container>Authenticating...</Container>
      );
  }

  const LinkedInHomeWrapper = (props: any): any => <LinkedinCallbackComponent {...props} router={ useRouter() } />;

  export const LinkedinCallback = connect(mapStateToProps, mapDispatchToProps)(LinkedInHomeWrapper);