import url from 'url';
import querystring from 'querystring';
import { Button, Snackbar } from '@material-ui/core';
import { DefaultInitializationOptions, initializeEngine } from '@xr3ngine/engine/src/initialize';
import { NetworkSchema } from '@xr3ngine/engine/src/networking/interfaces/NetworkSchema';
import { loadScene } from '@xr3ngine/engine/src/scene/functions/SceneLoading';
import { DefaultNetworkSchema } from '@xr3ngine/engine/src/templates/networking/DefaultNetworkSchema';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import NoSSR from 'react-no-ssr';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { SocketWebRTCClientTransport } from '../../classes/transports/SocketWebRTCClientTransport';
import Loading from '../../components/scenes/loading';
import Scene from '../../components/scenes/location';
import Layout from '../../components/ui/Layout';
import UserMenu from '../../components/ui/UserMenu';
import { selectAppOnBoardingStep, selectAppState } from '../../redux/app/selector';
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
  getLocationByName
} from '../../redux/location/service';
import { selectPartyState } from '../../redux/party/selector';

import { setAppSpecificOnBoardingStep, generalStateList } from '../../redux/app/actions';
import store from '../../redux/store';
import { setCurrentScene } from '../../redux/scenes/actions';

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
  setCurrentScene?: typeof setCurrentScene;
  onBoardingStep?: number;
}

const mapStateToProps = (state: any): any => {
  return {
    appState: selectAppState(state),
    authState: selectAuthState(state),
    instanceConnectionState: selectInstanceConnectionState(state),
    locationState: selectLocationState(state),
    partyState: selectPartyState(state),
    onBoardingStep: selectAppOnBoardingStep(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  doLoginAuto: bindActionCreators(doLoginAuto, dispatch),
  getLocationByName: bindActionCreators(getLocationByName, dispatch),
  connectToInstanceServer: bindActionCreators(connectToInstanceServer, dispatch),
  provisionInstanceServer: bindActionCreators(provisionInstanceServer, dispatch),
  setCurrentScene: bindActionCreators(setCurrentScene, dispatch),
});

const LocationPage = (props: Props) => {
  const { locationName } = useRouter().query as any;
  const [isValidLocation, setIsValidLocation] = useState(true);

  const {
    appState,
    authState,
    locationState,
    partyState,
    instanceConnectionState,
    onBoardingStep,
    doLoginAuto,
    getLocationByName,
    connectToInstanceServer,
    provisionInstanceServer,
    setCurrentScene,
  } = props;

  const appLoaded = appState.get('loaded');
  const selfUser = authState.get('user');
  const party = partyState.get('party');
  const instanceId = selfUser?.instanceId ?? party?.instanceId;
  let sceneId = null;
  let userBanned = false;
  let locationId = null;
  useEffect(() => {
    doLoginAuto(true);
  }, []);

  useEffect(() => {
    const currentLocation = locationState.get('currentLocation').get('location');
    locationId = currentLocation.id;

    userBanned = selfUser?.locationBans?.find(ban => ban.locationId === locationId) != null;
    if (authState.get('isLoggedIn') === true && authState.get('user')?.id != null && authState.get('user')?.id.length > 0 && currentLocation.id == null && userBanned === false && locationState.get('fetchingCurrentLocation') !== true) {
      getLocationByName(locationName);
      if (sceneId === null) {
        sceneId = currentLocation.sceneId;
      }
    }
  }, [authState]);

  useEffect(() => {
    const currentLocation = locationState.get('currentLocation').get('location');

    if (currentLocation.id != null &&
      userBanned === false &&
      instanceConnectionState.get('instanceProvisioned') !== true &&
      instanceConnectionState.get('instanceProvisioning') === false) {
      const search = window.location.search;
      let instanceId;
      if (search != null) {
        const parsed = url.parse(window.location.href);
        const query = querystring.parse(parsed.query);
        instanceId = query.instanceId;
      }
      provisionInstanceServer(currentLocation.id, instanceId || undefined, sceneId);
    }
    if (sceneId === null) {
      sceneId = currentLocation.sceneId;
    }

    if (!currentLocation.id && !locationState.get('currentLocationUpdateNeeded') && !locationState.get('fetchingCurrentLocation')) {
      setIsValidLocation(false);
      store.dispatch(setAppSpecificOnBoardingStep(generalStateList.FAILED, false));
    }
  }, [locationState]);

  useEffect(() => {
    if (
      instanceConnectionState.get('instanceProvisioned') === true &&
      instanceConnectionState.get('updateNeeded') === true &&
      instanceConnectionState.get('instanceServerConnecting') === false &&
      instanceConnectionState.get('connected') === false
    ) {
      const currentLocation = locationState.get('currentLocation').get('location');
      if (sceneId === null && currentLocation.sceneId !== null) {
        sceneId = currentLocation.sceneId;
      }
      init(sceneId).then(() => {
        connectToInstanceServer();
      });

    }
  }, [instanceConnectionState]);

  useEffect(() => {
    if (appLoaded === true && instanceConnectionState.get('instanceProvisioned') === false && instanceConnectionState.get('instanceProvisioning') === false) {
      if (instanceId != null) {
        client.service('instance').get(instanceId)
          .then((instance) => {
            const currentLocation = locationState.get('currentLocation').get('location');
            provisionInstanceServer(instance.locationId, instanceId, currentLocation.sceneId);
            if (sceneId === null) {
              console.log("Set scene ID to, sceneId");
              sceneId = currentLocation.sceneId;
            }
          });
      }
    }
  }, [appState]);
  const projectRegex = /\/([A-Za-z0-9]+)\/([a-f0-9-]+)$/;

  async function init(sceneId: string): Promise<any> { // auth: any,
    let service, serviceId;
    const projectResult = await client.service('project').get(sceneId);
    setCurrentScene(projectResult);
    const projectUrl = projectResult.project_url;
    const regexResult = projectUrl.match(projectRegex);
    if (regexResult) {
      service = regexResult[1];
      serviceId = regexResult[2];
    }
    const result = await client.service(service).get(serviceId);

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
    loadScene(result);
  }

  const goHome = () => window.location.href = window.location.origin;

  return (
    <Layout pageTitle="Home">
      <NoSSR onSSR={<Loading />}>
        {isValidLocation && onBoardingStep === generalStateList.ALL_DONE && <UserMenu />}
        {userBanned === false ? (<Scene sceneId={sceneId} />) : (<div className="banned">You have been banned from this location</div>)}
        <Snackbar open={!isValidLocation}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}>
          <>
            <section>Location is invalid</section>
            <Button onClick={goHome}>Return Home</Button>
          </>
        </Snackbar>
      </NoSSR>
    </Layout>
  );
};


export default connect(mapStateToProps, mapDispatchToProps)(LocationPage);