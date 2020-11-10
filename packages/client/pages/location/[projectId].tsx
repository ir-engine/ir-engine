import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import NoSSR from 'react-no-ssr';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import Loading from '../../components/scenes/loading';
import Scene from '../../components/scenes/multiplayer';
import Layout from '../../components/ui/Layout';
import { selectAppState } from '../../redux/app/selector';
import { selectAuthState } from '../../redux/auth/selector';
import { doLoginAuto } from '../../redux/auth/service';
import { client } from '../../redux/feathers';
import { selectInstanceConnectionState } from '../../redux/instanceConnection/selector';
import {
  connectToInstanceServer,
  provisionInstanceServer
} from '../../redux/instanceConnection/service';
import { selectLocationState } from '../../redux/location/selector';
import {
  getLocation
} from '../../redux/location/service';
import { selectPartyState } from '../../redux/party/selector';

interface Props {
  appState?: any;
  authState?: any;
  locationState?: any;
  partyState?: any;
  instanceConnectionState?: any;
  doLoginAuto?: typeof doLoginAuto;
  getLocation?: typeof getLocation;
  connectToInstanceServer?: typeof connectToInstanceServer;
  provisionInstanceServer?: typeof provisionInstanceServer;
}

const locationId = 'a98b8470-fd2d-11ea-bc7c-cd4cac9a8d61';

const mapStateToProps = (state: any): any => {
  return {
    appState: selectAppState(state),
    authState: selectAuthState(state),
    instanceConnectionState: selectInstanceConnectionState(state),
    locationState: selectLocationState(state),
    partyState: selectPartyState(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  doLoginAuto: bindActionCreators(doLoginAuto, dispatch),
  getLocation: bindActionCreators(getLocation, dispatch),
  connectToInstanceServer: bindActionCreators(connectToInstanceServer, dispatch),
  provisionInstanceServer: bindActionCreators(provisionInstanceServer, dispatch)
});

const EditorRoomPage = (props: Props) => {
  const { projectId } = useRouter().query as any;

  const {
    appState,
    authState,
    locationState,
    partyState,
    instanceConnectionState,
    doLoginAuto,
    getLocation,
    connectToInstanceServer,
    provisionInstanceServer
  } = props;

  const appLoaded = appState.get('loaded');
  const selfUser = authState.get('user');
  const party = partyState.get('party');
  const instanceId = selfUser?.instanceId ?? party?.instanceId;

  const userBanned = selfUser?.locationBans?.find(ban => ban.locationId === locationId) != null;
  useEffect(() => {
    doLoginAuto(true);
  }, []);

  useEffect(() => {
    const currentLocation = locationState.get('currentLocation').get('location');
    if (authState.get('isLoggedIn') === true && authState.get('user').id != null && authState.get('user').id.length > 0 && currentLocation.id == null && userBanned === false && locationState.get('fetchingCurrentLocation') !== true) {
      getLocation(locationId);
    }
  }, [authState]);

  useEffect(() => {
    const currentLocation = locationState.get('currentLocation').get('location');
    if (currentLocation.id != null &&
      userBanned === false &&
      instanceConnectionState.get('instanceProvisioned') !== true &&
      instanceConnectionState.get('instanceProvisioning') === false)
      provisionInstanceServer(currentLocation.id, undefined, projectId);
  }, [locationState]);

  useEffect(() => {
    if (
      instanceConnectionState.get('instanceProvisioned') === true &&
      instanceConnectionState.get('updateNeeded') === true &&
      instanceConnectionState.get('instanceServerConnecting') === false &&
      instanceConnectionState.get('connected') === false
    ) {
      console.log('Calling connectToInstanceServer from arena page');
      connectToInstanceServer();
    }
  }, [instanceConnectionState]);

  useEffect(() => {
    if (appLoaded === true && instanceConnectionState.get('instanceProvisioned') === false && instanceConnectionState.get('instanceProvisioning') === false) {
      if (instanceId != null) {
        client.service('instance').get(instanceId)
          .then((instance) => {
            console.log('Provisioning instance from arena page init useEffect');
            provisionInstanceServer(instance.locationId, instanceId, projectId);
          });
      }
    }
  }, [appState]);

  return (
    <Layout pageTitle="Home">
      <NoSSR onSSR={<Loading />}>
        {userBanned === false ? (<Scene sceneId={projectId} />) : null}
        {userBanned !== false ? (<div className="banned">You have been banned from this location</div>) : null}
      </NoSSR>
    </Layout>
  );
};


export default connect(mapStateToProps, mapDispatchToProps)(EditorRoomPage);
