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
}

const mapStateToProps = (state: any): any => {
    return {
        authState: selectAuthState(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
});

export const IndexPage = (props: any): any => {
    const {
        authState
    } = props;
    const selfUser = authState.get('user');
  const [ sceneIsVisible, setSceneVisible ] = React.useState(true);
  const scene = sceneIsVisible? (<Scene />) : null;

  const buttonStyle: React.CSSProperties = {
    "position": "absolute",
    "bottom": '5px',
    "right": '5px'
  };

  useEffect(() => {
      if (selfUser.instanceId != null) {
          setSceneVisible(true);
      }
  }, [selfUser.instanceId, selfUser.partyId]);

  return(
    <Layout pageTitle="Home">
      <input type="button" value="scene" onClick={(e) => { setSceneVisible(!sceneIsVisible); e.currentTarget.blur(); }} style={ buttonStyle } />
      <NoSSR onSSR={<Loading/>}>
        {scene}
      </NoSSR>
    </Layout>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(IndexPage);
