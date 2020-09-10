import React, { useEffect } from 'react';
import NoSSR from 'react-no-ssr';

import Scene, {EnginePage} from "../components/gl/scene";
import Loading from '../components/gl/loading';
import Layout from '../components/ui/Layout';
import { selectAuthState } from "../redux/auth/selector";
import {selectInstanceConnectionState} from "../redux/instanceConnection/selector";
import {bindActionCreators, Dispatch} from "redux";
import {connect} from "react-redux";


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
  const [ sceneIsVisible, setSceneVisible ] = React.useState(false);
  const scene = sceneIsVisible? (<Scene />) : null;

  const buttonStyle: React.CSSProperties = {
    "position": "absolute",
    "bottom": '5px',
    "right": '5px'
  };

  useEffect(() => {
      if (selfUser?.instanceId != null || instanceConnectionState.get('instanceProvisioned') === true) {
          setSceneVisible(true);
      }
  }, [selfUser?.instanceId, selfUser?.partyId, instanceConnectionState]);

  return(
    <Layout pageTitle="Home">
      <input type="button" value="scene" onClick={() => { setSceneVisible(!sceneIsVisible); }} style={ buttonStyle } />
      <NoSSR onSSR={<Loading/>}>
        {scene}
      </NoSSR>
    </Layout>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(IndexPage);
