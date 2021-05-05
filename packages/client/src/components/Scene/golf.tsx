import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import { InteractableModal } from '@xrengine/client-core/src/world/components/InteractableModal';
import LoadingScreen from '@xrengine/client-core/src/common/components/Loader';
import { MobileGamepadProps } from "@xrengine/client-core/src/common/components/MobileGamepad/MobileGamepadProps";
import NamePlate from '@xrengine/client-core/src/world/components/NamePlate';
import NetworkDebug from '../NetworkDebug';
import { OpenLink } from '@xrengine/client-core/src/world/components/OpenLink';
import TooltipContainer from '@xrengine/client-core/src/common/components/TooltipContainer';
import UserMenu from '@xrengine/client-core/src/user/components/UserMenu';
import { generalStateList, setAppLoaded, setAppOnBoardingStep, setAppSpecificOnBoardingStep } from '@xrengine/client-core/src/common/reducers/app/actions';
import { selectAppState } from '@xrengine/client-core/src/common/reducers/app/selector';
import { selectAuthState } from '@xrengine/client-core/src/user/reducers/auth/selector';
import { doLoginAuto } from '@xrengine/client-core/src/user/reducers/auth/service';
import { client } from '@xrengine/client-core/src/feathers';
import { selectLocationState } from '@xrengine/client-core/src/social/reducers/location/selector';
import {
  getLocationByName
} from '@xrengine/client-core/src/social/reducers/location/service';
import { setCurrentScene } from '@xrengine/client-core/src/world/reducers/scenes/actions';
import Store from '@xrengine/client-core/src/store';
import { selectUserState } from '@xrengine/client-core/src/user/reducers/user/selector';
import { selectInstanceConnectionState } from '../../reducers/instanceConnection/selector';
import {
  connectToInstanceServer,
  provisionInstanceServer
} from '../../reducers/instanceConnection/service';
import { selectPartyState } from '@xrengine/client-core/src/social/reducers/party/selector';
import MediaIconsBox from "../MediaIconsBox";
import { SocketWebRTCClientTransport } from '../../transports/SocketWebRTCClientTransport';
import { testScenes, testUserId, testWorldState } from '@xrengine/common/src/assets/testScenes';
import { isMobileOrTablet } from '@xrengine/engine/src/common/functions/isMobile';
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents';
import { resetEngine } from "@xrengine/engine/src/ecs/functions/EngineFunctions";
import { getComponent, getMutableComponent } from '@xrengine/engine/src/ecs/functions/EntityFunctions';
import { initializeEngine } from '@xrengine/engine/src/initialize';
import { DefaultInitializationOptions } from '@xrengine/engine/src/DefaultInitializationOptions';
import { InteractiveSystem } from '@xrengine/engine/src/interaction/systems/InteractiveSystem';
import { Network } from '@xrengine/engine/src/networking/classes/Network';
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes';
import { NetworkSchema } from '@xrengine/engine/src/networking/interfaces/NetworkSchema';
import { ClientNetworkSystem } from '@xrengine/engine/src/networking/systems/ClientNetworkSystem';
import { PhysicsSystem } from '@xrengine/engine/src/physics/systems/PhysicsSystem';
import { styleCanvas } from '@xrengine/engine/src/renderer/functions/styleCanvas';
import { CharacterComponent } from '@xrengine/engine/src/templates/character/components/CharacterComponent';
import { DefaultNetworkSchema } from '@xrengine/engine/src/templates/networking/DefaultNetworkSchema';
import { PrefabType } from '@xrengine/engine/src/templates/networking/PrefabType';
import { XRSystem } from '@xrengine/engine/src/xr/systems/XRSystem';
import { Config } from '@xrengine/client-core/src/helper';
import { useHistory } from 'react-router-dom';
import querystring from 'querystring';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import url from 'url';
import { CharacterInputSchema } from '@xrengine/engine/src/templates/character/CharacterInputSchema';
import { GolfGameMode } from '@xrengine/engine/src/templates/game/GolfGameMode';

const store = Store.store;

const goHome = () => window.location.href = window.location.origin;

const MobileGamepad = React.lazy(() => import("@xrengine/client-core/src/common/components/MobileGamepad"));

const engineRendererCanvasId = 'engine-renderer-canvas';

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
  harmonyOpen?: boolean;
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
    locationName,
    harmonyOpen
  } = props;

  const currentUser = authState.get('user');
  const [hoveredLabel, setHoveredLabel] = useState('');
  const [infoBoxData, setModalData] = useState(null);
  const [userBanned, setUserBannedState] = useState(false);
  const [openLinkData, setOpenLinkData] = useState(null);
  const router = useHistory();

  const [progressEntity, setProgressEntity] = useState(99);
  const [userHovered, setonUserHover] = useState(false);
  const [userId, setonUserId] = useState(null);
  const [position, setonUserPosition] = useState(null);
  const [objectActivated, setObjectActivated] = useState(false);
  const [objectHovered, setObjectHovered] = useState(false);

  const [isValidLocation, setIsValidLocation] = useState(true);
  const [isInXR, setIsInXR] = useState(false);

  const appLoaded = appState.get('loaded');
  const selfUser = authState.get('user');
  const party = partyState.get('party');
  const instanceId = selfUser?.instanceId ?? party?.instanceId;
  let sceneId = null;
  let locationId = null;

  useEffect(() => {
    if(Config.publicRuntimeConfig.offlineMode) {
      init(locationName);
    } else {
      doLoginAuto(true);
    }
  }, []);

  useEffect(() => {
    const currentLocation = locationState.get('currentLocation').get('location');
    locationId = currentLocation.id;

    setUserBannedState(selfUser?.locationBans?.find(ban => ban.locationId === locationId) != null);
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
      init(sceneId);
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
              console.log('Set scene ID to', sceneId);
              sceneId = currentLocation.sceneId;
            }
          });
      }
    }
  }, [appState]);
  const projectRegex = /\/([A-Za-z0-9]+)\/([a-f0-9-]+)$/;

  async function init(sceneId: string): Promise<any> { // auth: any,
    let sceneData;
    if(Config.publicRuntimeConfig.offlineMode) {
      sceneData = testScenes[sceneId] || testScenes.test;
    } else {
      let service, serviceId;
      const projectResult = !Config.publicRuntimeConfig.offlineMode ? await client.service('project').get(sceneId) : '';
      setCurrentScene(projectResult);
      const projectUrl = projectResult.project_url;
      const regexResult = projectUrl.match(projectRegex);
      if (regexResult) {
        service = regexResult[1];
        serviceId = regexResult[2];
      }
      sceneData = await client.service(service).get(serviceId);
    }

    const canvas = document.getElementById(engineRendererCanvasId) as HTMLCanvasElement;
    styleCanvas(canvas);

    const InitializationOptions = {
      input: {
        schema: CharacterInputSchema,
      },
      gameModes: [
        GolfGameMode
      ],
      publicPath: '',
      postProcessing: true,
      editor: false,
      networking: {
        schema: {
        ...DefaultNetworkSchema,
        transport: SocketWebRTCClientTransport,
        } as NetworkSchema,
        transport: SocketWebRTCClientTransport
      },
      renderer: {
        canvas,
      },
      useOfflineMode: Config.publicRuntimeConfig.offlineMode
    };

    // console.log("Initialization options are: ", InitializationOptions);

    await initializeEngine(InitializationOptions);

    // console.log("Engine initialized");

    document.dispatchEvent(new CustomEvent('ENGINE_LOADED')); // this is the only time we should use document events. would be good to replace this with react state

    addUIEvents();

    // console.log("**** OFFLINE MODE? ", Config.publicRuntimeConfig.offlineMode);

    if(!Config.publicRuntimeConfig.offlineMode) await connectToInstanceServer('instance');

    const loadScene = new Promise<void>((resolve) => {
      EngineEvents.instance.once(EngineEvents.EVENTS.SCENE_LOADED, () => {
        setProgressEntity(0);
        store.dispatch(setAppOnBoardingStep(generalStateList.SCENE_LOADED));
        EngineEvents.instance.removeEventListener(EngineEvents.EVENTS.ENTITY_LOADED, onSceneLoadedEntity);
        setAppLoaded(true);
        resolve();
      });
      EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.LOAD_SCENE, sceneData });
    });

    const getWorldState = new Promise<any>((resolve) => {
      if(Config.publicRuntimeConfig.offlineMode) {
        EngineEvents.instance.dispatchEvent({ type: ClientNetworkSystem.EVENTS.CONNECT, id: testUserId });
        resolve(testWorldState);
      } else {
        EngineEvents.instance.once(EngineEvents.EVENTS.CONNECT_TO_WORLD, async () => {
          const { worldState } =  await (Network.instance.transport as SocketWebRTCClientTransport).instanceRequest(MessageTypes.JoinWorld.toString());
          resolve(worldState);
        });
      }
    });

    const [sceneLoaded, worldState] = await Promise.all([loadScene, getWorldState]);

    EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.JOINED_WORLD, worldState });
  }

  const onSceneLoadedEntity = (event: any): void => {
    setProgressEntity(event.left || 0);
  };

  const onObjectHover = ({ focused, interactionText }: { focused: boolean, interactionText: string }): void => {
    setObjectHovered(focused);
    let displayText = interactionText;
    const length = interactionText && interactionText.length;
    if (length > 110) {
      displayText = interactionText.substring(0, 110) + '...';
    }
    setHoveredLabel(displayText);
  };

  const onUserHover = ({ focused, userId, position }): void => {
    setonUserHover(focused);
    setonUserId(focused ? userId : null);
    setonUserPosition(focused ? position : null);
  };

  const addUIEvents = () => {
    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.ENTITY_LOADED, onSceneLoadedEntity);
    EngineEvents.instance.addEventListener(InteractiveSystem.EVENTS.USER_HOVER, onUserHover);
    EngineEvents.instance.addEventListener(InteractiveSystem.EVENTS.OBJECT_ACTIVATION, onObjectActivation);
    EngineEvents.instance.addEventListener(InteractiveSystem.EVENTS.OBJECT_HOVER, onObjectHover);
    EngineEvents.instance.addEventListener(PhysicsSystem.EVENTS.PORTAL_REDIRECT_EVENT, ({ location }) => router.push(location));
    EngineEvents.instance.addEventListener(XRSystem.EVENTS.XR_START, async (ev: any) => { setIsInXR(true); });
    EngineEvents.instance.addEventListener(XRSystem.EVENTS.XR_END, async (ev: any) => { setIsInXR(false); });
  };

  const onObjectActivation = (interactionData): void => {
    switch (interactionData.interactionType) {
      case 'link':
        setOpenLinkData(interactionData);
        setObjectActivated(true);
        break;
      case 'infoBox':
      case 'mediaSource':
        setModalData(interactionData);
        setObjectActivated(true);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
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

          if (user?.avatarId !== changedAvatar?.avatarId) {
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
  return userBanned !== true && !isInXR ? (
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
      { harmonyOpen !== true && <MediaIconsBox />}
      { userHovered && <NamePlate userId={userId} position={{ x: position?.x, y: position?.y }} focused={userHovered} />}
      {objectHovered && !objectActivated && <TooltipContainer message={hoveredLabel} />}
      <InteractableModal onClose={() => { setModalData(null); setObjectActivated(false); }} data={infoBoxData} />
      <OpenLink onClose={() => { setOpenLinkData(null); setObjectActivated(false); }} data={openLinkData} />
      <canvas id={engineRendererCanvasId} width='100%' height='100%' />
      {mobileGamepad}
    </>
  ) : (<div className="banned">You have been banned from this location</div>);
};

export default connect(mapStateToProps, mapDispatchToProps)(EnginePage);
