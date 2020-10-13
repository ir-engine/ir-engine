import React, { useEffect } from 'react';
//import './style.scss';
import {Button} from '@material-ui/core';
import NoSSR from 'react-no-ssr';
import { connect } from "react-redux";
import {bindActionCreators, Dispatch} from "redux";
import Loading from '../components/gl/loading';
import Scene from "../components/gl/scene";
import Layout from '../components/ui/Layout';
import { selectAuthState } from "../redux/auth/selector";
import { selectInstanceConnectionState } from '../redux/instanceConnection/selector';

interface Props {
    authState?: any;
    instanceConnectionState?: any;
}

const mapStateToProps = (state: any): any => {
    return {
        authState: selectAuthState(state),
        instanceConnectionState: selectInstanceConnectionState(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
});

export const IndexPage = (props: any): any => {
  const {
    authState,
    instanceConnectionState
  } = props;
  const selfUser = authState.get('user');
  const [ sceneIsVisible, setSceneVisible ] = React.useState(true);

  useEffect(() => {
      if (selfUser?.instanceId != null || instanceConnectionState.get('instanceProvisioned') === true) {
          setSceneVisible(true);
      }
  }, [selfUser?.instanceId, selfUser?.partyId, instanceConnectionState]);

  // <Button className="right-bottom" variant="contained" color="secondary" aria-label="scene" onClick={(e) => { setSceneVisible(!sceneIsVisible); e.currentTarget.blur(); }}>scene</Button>

  return(
    <Layout pageTitle="Home">
      <NoSSR onSSR={<Loading/>}>
        {sceneIsVisible? (<Scene />) : null}
      </NoSSR>
    </Layout>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(IndexPage);
