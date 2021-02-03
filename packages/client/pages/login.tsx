import React, { useEffect } from 'react';
//import './Admin.module.scss';
import {Button} from '@material-ui/core';
import NoSSR from 'react-no-ssr';
import { connect } from "react-redux";
import {bindActionCreators, Dispatch} from "redux";
import Layout from '@xr3ngine/client-core/components/ui/Layout';
import { selectAuthState } from "@xr3ngine/client-core/redux/auth/selector";
import { selectInstanceConnectionState } from '@xr3ngine/client-core/redux/instanceConnection/selector';
import { doLoginAuto } from '@xr3ngine/client-core/redux/auth/service';

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
    <Layout pageTitle="Home" login={true} />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(IndexPage);
