import Layout from '@xr3ngine/client-core/components/ui/Layout/OverlayLayout';
import { selectAuthState } from "@xr3ngine/client-core/redux/auth/selector";
import { doLoginAuto } from '@xr3ngine/client-core/redux/auth/service';
import { selectInstanceConnectionState } from '@xr3ngine/client-core/redux/instanceConnection/selector';
import React from 'react';
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import { ThemeProvider } from "styled-components";

import FlatSignIn from '@xr3ngine/client-core/components/social/Login';
import theme from '../theme';

interface Props {
    authState?: any;
    instanceConnectionState?: any;
    doLoginAuto?: any;
}

const mapStateToProps = (state: any): any => {
    return {
        authState: selectAuthState(state),
        instanceConnectionState: selectInstanceConnectionState(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    doLoginAuto: bindActionCreators(doLoginAuto, dispatch)
});

export const IndexPage = (props: any): any => {
  const {
    authState
  } = props;

  // <Button className="right-bottom" variant="contained" color="secondary" aria-label="scene" onClick={(e) => { setSceneVisible(!sceneIsVisible); e.currentTarget.blur(); }}>scene</Button>

  return(
  <ThemeProvider theme={theme}>
      <FlatSignIn logo="/assets/LogoColored.png" />
    </ThemeProvider>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(IndexPage);
