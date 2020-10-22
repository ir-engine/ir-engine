import React, { useEffect } from 'react';
import NoSSR from 'react-no-ssr';
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Loading from '../components/scenes/loading';
import Scene from "../components/scenes/charactercreator";
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
      <input type="button" value="scene" onClick={(e) => { setSceneVisible(!sceneIsVisible); e.currentTarget.blur(); }} style={ buttonStyle } />
      <NoSSR onSSR={<Loading/>}>
        {sceneIsVisible? (<Scene />) : null}
      </NoSSR>
    </Layout>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(IndexPage);
