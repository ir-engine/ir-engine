import { ThemeProvider } from '@material-ui/core';
import { DefaultInitializationOptions, initializeEngine } from '@xr3ngine/engine/src/initialize';
import { NetworkSchema } from '@xr3ngine/engine/src/networking/interfaces/NetworkSchema';
import { DefaultNetworkSchema } from '@xr3ngine/engine/src/templates/networking/DefaultNetworkSchema';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import NoSSR from 'react-no-ssr';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { SocketWebRTCClientTransport } from '../../classes/transports/SocketWebRTCClientTransport';
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
import { getLocationByName
} from '../../redux/location/service';
import { selectPartyState } from '../../redux/party/selector';

import theme from '../../theme';

interface Props {
  appState?: any;
  authState?: any;
  locationState?: any;
  partyState?: any;
  instanceConnectionState?: any;
  doLoginAuto?: typeof doLoginAuto;
  getLocationByName?: typeof getLocationByName;
  connectToInstanceServer?: typeof connectToInstanceServer;
  provisionInstanceServer?: typeof provisionInstanceServer;
}

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
  getLocationByName: bindActionCreators(getLocationByName, dispatch),
  connectToInstanceServer: bindActionCreators(connectToInstanceServer, dispatch),
  provisionInstanceServer: bindActionCreators(provisionInstanceServer, dispatch)
});

const EditorRoomPage = (props: Props) => {
  const { locationName } = useRouter().query as any;

  const {
    appState,
    authState,
    locationState,
    partyState,
    instanceConnectionState,
    doLoginAuto,
    getLocationByName,
    connectToInstanceServer,
    provisionInstanceServer
  } = props;

  const appLoaded = appState.get('loaded');
  const selfUser = authState.get('user');
  const party = partyState.get('party');
  const instanceId = selfUser?.instanceId ?? party?.instanceId;
  let sceneId = null;
  let userBanned = false;
  let locationId = null;
  useEffect(() => {
    const networkSchema: NetworkSchema = {
      ...DefaultNetworkSchema,
      transport: SocketWebRTCClientTransport,
    };

    const InitializationOptions = {
      ...DefaultInitializationOptions,
      networking: {
        schema: networkSchema,
      }
    };

    initializeEngine(InitializationOptions);
    doLoginAuto(true);
  }, []);

  useEffect(() => {
    const currentLocation = locationState.get('currentLocation').get('location');
    console.log("Current location from authState useEffect is ", currentLocation)
    locationId = currentLocation.id;
    userBanned = selfUser?.locationBans?.find(ban => ban.locationId === locationId) != null;
    if (authState.get('isLoggedIn') === true && authState.get('user').id != null && authState.get('user').id.length > 0 && currentLocation.id == null && userBanned === false && locationState.get('fetchingCurrentLocation') !== true) {
      getLocationByName(locationName);
    }
  }, [authState]);

  useEffect(() => {
    const currentLocation = locationState.get('currentLocation').get('location');
    console.log("Current location is ", currentLocation);
    sceneId = currentLocation.sceneId;
    if (currentLocation.id != null &&
      userBanned === false &&
      instanceConnectionState.get('instanceProvisioned') !== true &&
      instanceConnectionState.get('instanceProvisioning') === false)
      provisionInstanceServer(currentLocation.id, undefined, sceneId);
  }, [locationState]);

  useEffect(() => {
    if (
      instanceConnectionState.get('instanceProvisioned') === true &&
      instanceConnectionState.get('updateNeeded') === true &&
      instanceConnectionState.get('instanceServerConnecting') === false &&
      instanceConnectionState.get('connected') === false
    ) {
      console.log('Calling connectToInstanceServer from location page');
      connectToInstanceServer();
    }
  }, [instanceConnectionState]);

  useEffect(() => {
    if (appLoaded === true && instanceConnectionState.get('instanceProvisioned') === false && instanceConnectionState.get('instanceProvisioning') === false) {
      if (instanceId != null) {
        client.service('instance').get(instanceId)
          .then((instance) => {
            const currentLocation = locationState.get('currentLocation').get('location');
            console.log("provisionInstanceServer for location ", currentLocation);
            sceneId = currentLocation.sceneId;
            console.log('Provisioning instance from arena page init useEffect');
            provisionInstanceServer(instance.locationId, instanceId, sceneId);
          });
      }
    }
  }, [appState]);

  return (
    <ThemeProvider theme={theme}>
      <Layout pageTitle="Home">
        <NoSSR onSSR={<Loading />}>
          {userBanned === false && sceneId !== null ? (<Scene sceneId={sceneId} />) : null}
          {userBanned !== false ? (<div className="banned">You have been banned from this location</div>) : null}
        </NoSSR>
      </Layout>
    </ThemeProvider>
  );
};


export default connect(mapStateToProps, mapDispatchToProps)(EditorRoomPage);
