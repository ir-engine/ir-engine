import { Snackbar, ThemeProvider } from '@material-ui/core';
import { CameraComponent } from '@xr3ngine/engine/src/camera/components/CameraComponent';
import { getMutableComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { DefaultInitializationOptions, initializeEngine } from '@xr3ngine/engine/src/initialize';
import { NetworkSchema } from '@xr3ngine/engine/src/networking/interfaces/NetworkSchema';
import { loadScene } from '@xr3ngine/engine/src/scene/functions/SceneLoading';
import { DefaultNetworkSchema } from '@xr3ngine/engine/src/templates/networking/DefaultNetworkSchema';
import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
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
import { createPrefab } from "../../../engine/src/common/functions/createPrefab";
import { staticWorldColliders } from "../../../engine/src/templates/car/prefabs/staticWorldColliders";

import { VRMPrefab } from "../../../engine/src/templates/devices/prefabs/VRMPrefab";

import theme from '../../theme';
import { setAppSpecificOnBoardingStep, generalStateList } from '../../redux/app/actions';
import store from '../../redux/store';

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

const LocationPage = (props: Props) => {
  const { locationName } = useRouter().query as any;
  const [isValidLocation, setIsValidLocation] = useState(true);
  const [openSnackBar, setOpenSnackBar] = React.useState(false);

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
    doLoginAuto(true);
  }, []);

  useEffect(() => {
    const currentLocation = locationState.get('currentLocation').get('location');
    locationId = currentLocation.id;
    
    userBanned = selfUser?.locationBans?.find(ban => ban.locationId === locationId) != null;
    if (authState.get('isLoggedIn') === true && authState.get('user')?.id != null && authState.get('user')?.id.length > 0 && currentLocation.id == null && userBanned === false && locationState.get('fetchingCurrentLocation') !== true) {
      getLocationByName(locationName);
      if(sceneId === null) {
        console.log("authState: Set scene ID to", sceneId);
        sceneId = currentLocation.sceneId;
        // if(!locationId){store.dispatch(setAppSpecificOnBoardingStep(generalStateList.LOCATION_FAILED, false));setOpenSnackBar(true);return;}
      }
    }
  }, [authState]);

  useEffect(() => {
    const currentLocation = locationState.get('currentLocation').get('location');
    if (currentLocation.id != null &&
      userBanned === false &&
      instanceConnectionState.get('instanceProvisioned') !== true &&
      instanceConnectionState.get('instanceProvisioning') === false)
      provisionInstanceServer(currentLocation.id, undefined, sceneId);
      if(sceneId === null) {
        console.log("locationState: Set scene ID to", sceneId);
        sceneId = currentLocation.sceneId;
      }

      if(!currentLocation.id && !locationState.get('currentLocationUpdateNeeded') && !locationState.get('fetchingCurrentLocation')){
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
      console.log('Calling connectToInstanceServer from location page');
      const currentLocation = locationState.get('currentLocation').get('location');
      console.log("Current location is ", currentLocation);
      if(sceneId === null && currentLocation.sceneId !== null) {
        console.log("instanceConnectionState: Set scene ID to", sceneId);
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
            console.log("provisionInstanceServer for location ", currentLocation);
            console.log('Provisioning instance from arena page init useEffect, ', currentLocation.sceneId);
            provisionInstanceServer(instance.locationId, instanceId, currentLocation.sceneId);
            if(sceneId === null) {
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
    console.log("Loading scene with scene ", sceneId);
    const projectResult = await client.service('project').get(sceneId);
    const projectUrl = projectResult.project_url;
    const regexResult = projectUrl.match(projectRegex);
    if (regexResult) {
      service = regexResult[1];
      serviceId = regexResult[2];
    }
    const result = await client.service(service).get(serviceId);
    console.log("Result is ");
    console.log(result);

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
      // createPrefab(staticWorldColliders);
    loadScene(result);
  }

  const goHome = () => window.location.href = window.location.origin;

  return (
    // <ThemeProvider theme={theme}>
      <Layout pageTitle="Home">
        <NoSSR onSSR={<Loading />}>
          {!openSnackBar && <UserMenu />}
          {userBanned === false ? (<Scene sceneId={sceneId} />) : (<div className="banned">You have been banned from this location</div>)}
          <Snackbar open={openSnackBar} 
            // onClose={handleCloseSnackBar} 
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}>
              <section>Location is invalid</section>
            </Snackbar>
        </NoSSR>
      </Layout>
    // </ThemeProvider>
  );
};


export default connect(mapStateToProps, mapDispatchToProps)(LocationPage);