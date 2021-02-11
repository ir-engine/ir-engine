import { Button, Snackbar } from '@material-ui/core';
import UserMenu from '@xr3ngine/client-core/components/ui/UserMenu';
import { setAppSpecificOnBoardingStep } from '@xr3ngine/client-core/redux/app/actions';
import { selectAppState } from '@xr3ngine/client-core/redux/app/selector';
import { doLoginAuto } from '@xr3ngine/client-core/redux/auth/service';
import { client } from '@xr3ngine/client-core/redux/feathers';
import { selectInstanceConnectionState } from '@xr3ngine/client-core/redux/instanceConnection/selector';
import {
  connectToInstanceServer,
  provisionInstanceServer
} from '@xr3ngine/client-core/redux/instanceConnection/service';
import { selectLocationState } from '@xr3ngine/client-core/redux/location/selector';
import {
  getLocationByName
} from '@xr3ngine/client-core/redux/location/service';
import { selectPartyState } from '@xr3ngine/client-core/redux/party/selector';
import { setCurrentScene } from '@xr3ngine/client-core/redux/scenes/actions';
import { isMobileOrTablet } from '@xr3ngine/engine/src/common/functions/isMobile';
import { resetEngine } from "@xr3ngine/engine/src/ecs/functions/EngineFunctions";
import { getComponent, getMutableComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { DefaultInitializationOptions, initializeEngine } from '@xr3ngine/engine/src/initialize';
import { Network } from '@xr3ngine/engine/src/networking/classes/Network';
import { SocketWebRTCClientTransport } from '@xr3ngine/engine/src/networking/classes/SocketWebRTCClientTransport';
import { joinWorld } from '@xr3ngine/engine/src/networking/functions/joinWorld';
import { NetworkSchema } from '@xr3ngine/engine/src/networking/interfaces/NetworkSchema';
import { loadScene } from '@xr3ngine/engine/src/scene/functions/SceneLoading';
import { CharacterComponent } from '@xr3ngine/engine/src/templates/character/components/CharacterComponent';
import { DefaultNetworkSchema, PrefabType } from '@xr3ngine/engine/src/templates/networking/DefaultNetworkSchema';
import dynamic from 'next/dynamic';
import querystring from 'querystring';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import url from 'url';
import { generalStateList, setAppLoaded, setAppOnBoardingStep } from '../../redux/app/actions';
import { selectAuthState } from '../../redux/auth/selector';
import store from '../../redux/store';
import { selectUserState } from '../../redux/user/selector';
import { InteractableModal } from '../ui/InteractableModal';
import LoadingScreen from '../ui/Loader';
import MediaIconsBox from "../ui/MediaIconsBox";
import { MobileGamepadProps } from "../ui/MobileGamepad/MobileGamepadProps";
import NamePlate from '../ui/NamePlate';
import NetworkDebug from '../ui/NetworkDebug/NetworkDebug';
import { OpenLink } from '../ui/OpenLink';
import TooltipContainer from '../ui/TooltipContainer';
import { useToasts } from 'react-toast-notifications';

const goHome = () => window.location.href = window.location.origin;

const MobileGamepad = dynamic<MobileGamepadProps>(() => import("../ui/MobileGamepad").then((mod) => mod.MobileGamepad), { ssr: false });

interface Props {
  setAppLoaded?: any,
  sceneId?: string,
  userState?: any;
  locationName: string;
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
}

const mapStateToProps = (state: any): any => {
  return {
    userState: selectUserState(state),
    appState: selectAppState(state),
    authState: selectAuthState(state),
    instanceConnectionState: selectInstanceConnectionState(state),
    locationState: selectLocationState(state),
    partyState: selectPartyState(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  setAppLoaded: bindActionCreators(setAppLoaded, dispatch),
  doLoginAuto: bindActionCreators(doLoginAuto, dispatch),
  getLocationByName: bindActionCreators(getLocationByName, dispatch),
  connectToInstanceServer: bindActionCreators(connectToInstanceServer, dispatch),
  provisionInstanceServer: bindActionCreators(provisionInstanceServer, dispatch),
  setCurrentScene: bindActionCreators(setCurrentScene, dispatch),
});

export const EnginePage = (props: Props) => {
  const {
    appState,
    authState,
    locationState,
    partyState,
    userState,
    instanceConnectionState,
    doLoginAuto,
    getLocationByName,
    connectToInstanceServer,
    provisionInstanceServer,
    setCurrentScene,
    setAppLoaded,
    locationName
  } = props;
  const currentUser = authState.get('user');
  const [hoveredLabel, setHoveredLabel] = useState('');
  const [actorEntity, setActorEntity] = useState(null);
  const [infoBoxData, setModalData] = useState(null);
  const [userBanned, setUserBannedState] = useState(false);
  const [openLinkData, setOpenLinkData] = useState(null);

  const [progressEntity, setProgressEntity] = useState(99);
  const [userHovered, setonUserHover] = useState(false);
  const [userId, setonUserId] = useState(null);
  const [position, setonUserPosition] = useState(null);
  const [objectActivated, setObjectActivated] = useState(false);
  const [objectHovered, setObjectHovered] = useState(false);

  const [isValidLocation, setIsValidLocation] = useState(true);
  const { addToast } = useToasts();

  const appLoaded = appState.get('loaded');
  const selfUser = authState.get('user');
  const party = partyState.get('party');
  const instanceId = selfUser?.instanceId ?? party?.instanceId;
  let sceneId = null;
  let locationId = null;

  useEffect(() => {
    doLoginAuto(true);
  }, []);

  useEffect(() => {
    const currentLocation = locationState.get('currentLocation').get('location');
    locationId = currentLocation.id;
    setUserBannedState(selfUser?.locationBans?.find(ban => ban.locationId === locationId) != null);
    if (authState.get('isLoggedIn') === true && authState.get('user')?.id != null && authState.get('user')?.id.length > 0 && currentLocation.id == null && userBanned === false && locationState.get('fetchingCurrentLocation') !== true) {
      getLocationByName(locationName);
      
      addToast(`User logged in as ${authState.get("user").userRole.toString()}`, { appearance: 'success' });
      addToast("Something goes wrong", { appearance: 'error' });
      addToast("Please wait for response", { appearance: 'warning' });
      if (sceneId === null) {
        sceneId = currentLocation.sceneId;
      }
    }
  }, [authState]);

  useEffect(() => {
    const currentLocation = locationState.get('currentLocation').get('location');

    if (currentLocation.id != null &&
      userBanned != true &&
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
        connectToInstanceServer(selfUser.partyId == null ? 'instance' : 'party', selfUser.partyId);
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


  //all scene entities are loaded
  const onSceneLoaded = (event: CustomEvent): void => {
    if (event.detail.loaded) {
      setProgressEntity(0);
      store.dispatch(setAppOnBoardingStep(generalStateList.SCENE_LOADED));
      document.removeEventListener('scene-loaded', onSceneLoaded);
      setAppLoaded(true);
      setTimeout(() => {
        joinWorld();
      }, 1000)
    }
  };

  //started loading scene entities
  const onSceneLoadedEntity = (event: CustomEvent): void => {
    setProgressEntity(event.detail.left || 0);
  };

  const onObjectHover = (event: CustomEvent): void => {
    setObjectHovered(event.detail.focused);
    setHoveredLabel(event.detail.interactionText);
  };

  const onUserHover = (event: CustomEvent): void => {
    setonUserHover(event.detail.focused);
    setonUserId(event.detail.focused ? event.detail.userId : null);
    setonUserPosition(event.detail.focused ? event.detail.position : null);
  };

  const onObjectActivation = (event: CustomEvent): void => {
    switch (event.detail.action) {
      case 'link':
        console.log('=======onObjectActivation====',event.detail.payload);
        setOpenLinkData(event.detail.payload);
        setObjectActivated(true);
        break;
      case 'infoBox':
      case 'mediaSource':
        setModalData(event.detail.payload);
        setObjectActivated(true);
        break;
      default:
        break;
    }
  };

  const addEventListeners = () => {
    document.addEventListener('scene-loaded', onSceneLoaded);
    document.addEventListener('scene-loaded-entity', onSceneLoadedEntity);
    document.addEventListener('object-activation', onObjectActivation);
    document.addEventListener('object-hover', onObjectHover);
    document.addEventListener('user-hover', onUserHover);
  };

  useEffect(() => {
    addEventListeners();
    console.log("LOAD SCENE WITH ID ", sceneId);

    const actorEntityWaitInterval = setInterval(() => {
      if (Network.instance?.localClientEntity) {
        setActorEntity(Network.instance.localClientEntity);
        clearInterval(actorEntityWaitInterval);
      }
    }, 300);

    return (): void => {
      resetEngine();
    };
  }, []);


  if (Network.instance) {
    userState.get('layerUsers').forEach(user => {
      if (user.id !== currentUser?.id) {
        const networkUser = Object.values(Network.instance.networkObjects).find(networkUser => networkUser.ownerId === user.id
          && networkUser.prefabType === PrefabType.Player);
        if (networkUser) {
          const changedAvatar = getComponent(networkUser.component.entity, CharacterComponent);

          if (user.avatarId !== changedAvatar.avatarId) {
            const characterAvatar = getMutableComponent(networkUser.component.entity, CharacterComponent);
            if (characterAvatar != null) characterAvatar.avatarId = user.avatarId;
            // We can pull this from NetworkPlayerCharacter, but we probably don't want our state update here
            // loadActorAvatar(networkUser.component.entity);
          }
        }
      }
    });
  }

  //mobile gamepad
  const mobileGamepadProps = { hovered: objectHovered, layout: 'default' };
  const mobileGamepad = isMobileOrTablet() ? <MobileGamepad {...mobileGamepadProps} /> : null;

  return userBanned != true ? (
      <>
        {isValidLocation && <UserMenu />}
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

      <NetworkDebug />
      <LoadingScreen objectsToLoad={progressEntity} />
      <MediaIconsBox />
      { userHovered && <NamePlate userId={userId} position={{ x: position?.x, y: position?.y }} focused={userHovered} />}
      {objectHovered && !objectActivated && <TooltipContainer message={hoveredLabel} />}
      <InteractableModal onClose={() => { setModalData(null); setObjectActivated(false); }} data={infoBoxData} />
      <OpenLink onClose={() => { setOpenLinkData(null); setObjectActivated(false); }} data={openLinkData} />
      {mobileGamepad}
    </>
  ) : (<div className="banned">You have been banned from this location</div>)  
};

export default connect(mapStateToProps, mapDispatchToProps)(EnginePage);
