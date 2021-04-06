import { selectAuthState } from "@xr3ngine/client-core/src/user/reducers/auth/selector";
import FlatSignIn from '@xr3ngine/client-core/src/socialmedia/components/Login';
import { doLoginAuto, resetPassword } from '@xr3ngine/client-core/src/user/reducers/auth/service';
import React from 'react';
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import { ThemeProvider } from "styled-components";
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


  return(
  <ThemeProvider theme={theme}>
      <FlatSignIn resetPassword={resetPassword} logo="/assets/LogoColored.png" />
    </ThemeProvider>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(IndexPage);
function selectInstanceConnectionState(state: any) {
  throw new Error("Function not implemented.");
}

