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
import { selectPartyState } from '../redux/party/selector';
import { selectLocationState } from '../redux/location/selector';
import { doLoginAuto } from '../redux/auth/service';
import {
    getLocation,
    joinLocationParty
} from '../redux/location/service';
import {
    provisionInstanceServer,
} from '../redux/instanceConnection/service';

interface Props {
    authState?: any;
    locationState?: any;
    partyState?: any;
    instanceConnectionState?: any;
    doLoginAuto?: typeof doLoginAuto;
    getLocation?: typeof getLocation;
    joinLocationParty?: typeof joinLocationParty;
    provisionInstanceServer?: typeof provisionInstanceServer;
}

const arenaLocationId = 'a98b8470-fd2d-11ea-bc7c-cd4cac9a8d61';

const mapStateToProps = (state: any): any => {
    return {
        authState: selectAuthState(state),
        instanceConnectionState: selectInstanceConnectionState(state),
        locationState: selectLocationState(state),
        partyState: selectPartyState(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    doLoginAuto: bindActionCreators(doLoginAuto, dispatch),
    getLocation: bindActionCreators(getLocation, dispatch),
    joinLocationParty: bindActionCreators(joinLocationParty, dispatch),
    provisionInstanceServer: bindActionCreators(provisionInstanceServer, dispatch)
});

export const IndexPage = (props: Props): any => {
  const {
      authState,
      locationState,
      partyState,
      instanceConnectionState,
      doLoginAuto,
      getLocation,
      joinLocationParty,
      provisionInstanceServer
  } = props;
  const selfUser = authState.get('user');
  const currentLocation = locationState.get('currentLocation').get('location');
  const [ sceneIsVisible, setSceneVisible ] = React.useState(false);

  useEffect(() => {
    doLoginAuto(true);
  }, []);

  useEffect(() => {
      if (authState.get('isLoggedIn') === true && authState.get('user').id != null && authState.get('user').id.length > 0 && currentLocation.id == null && locationState.get('fetchingCurrentLocation') !== true) {
          getLocation(arenaLocationId);
          console.log('Joining showroom party, auth state now is:');
          console.log(authState);
          console.log(locationState.get('currentLocation'));
          joinLocationParty(arenaLocationId);
      }
  }, [authState]);

  useEffect(() => {
      if (currentLocation.id != null && instanceConnectionState.get('instanceProvisioned') !== true && instanceConnectionState.get('instanceProvisioning') === false && selfUser.partyId != null) {
          console.log('Provisioning instance from arena useEffect')
          provisionInstanceServer(currentLocation.id);
      }
  }, [partyState]);

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
