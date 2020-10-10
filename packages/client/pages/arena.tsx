import { AppProps } from 'next/app'
import React, { useEffect } from 'react';
//import './style.scss';
import {Button} from '@material-ui/core';
import NoSSR from 'react-no-ssr';
import { connect } from 'react-redux';
import {Store, Dispatch, bindActionCreators} from 'redux';
import Loading from '../components/gl/loading';
import Scene from '../components/gl/scene';
import Layout from '../components/ui/Layout';
import { selectAuthState } from '../redux/auth/selector';
import { selectInstanceConnectionState } from '../redux/instanceConnection/selector';
import { selectLocationState } from '../redux/location/selector';
import { doLoginAuto } from '../redux/auth/service';
import {
    joinShowroomParty,
    setShowroomEnabled,
    setShowroomLocation
} from '../redux/location/service';

interface Props {
    authState?: any;
    instanceConnectionState?: any;
    doLoginAuto?: typeof doLoginAuto;
    joinShowroomParty?: typeof joinShowroomParty;
    setShowroomLocation?: typeof setShowroomLocation;
}

const showroomLocationId = 'a98b8470-fd2d-11ea-bc7c-cd4cac9a8d61';

const mapStateToProps = (state: any): any => {
    return {
        authState: selectAuthState(state),
        instanceConnectionState: selectInstanceConnectionState(state),
        locationState: selectLocationState(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    doLoginAuto: bindActionCreators(doLoginAuto, dispatch),
    joinShowroomParty: bindActionCreators(joinShowroomParty, dispatch),
    setShowroomLocation: bindActionCreators(setShowroomLocation, dispatch)
});

export const IndexPage = (props: Props): any => {
  const {
      authState,
      instanceConnectionState,
      doLoginAuto,
      joinShowroomParty,
      setShowroomLocation
  } = props;
  const selfUser = authState.get('user');
  const [ sceneIsVisible, setSceneVisible ] = React.useState(true);

  useEffect(() => {
    setShowroomEnabled(true);
    doLoginAuto(true);
  }, []);

  useEffect(() => {
      if (authState.get('isLoggedIn') === true && authState.get('user').id != null && authState.get('user').id.length > 0) {
          setShowroomLocation(showroomLocationId);
          console.log('Joining showroom party, auth state now is:')
          console.log(authState);
          joinShowroomParty(showroomLocationId);
      }
  }, [authState]);

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
