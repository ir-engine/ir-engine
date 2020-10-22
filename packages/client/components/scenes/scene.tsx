// import { AssetLoader } from '@xr3ngine/engine/src/assets/components/AssetLoader';
import { CameraComponent } from '@xr3ngine/engine/src/camera/components/CameraComponent';
import { addObject3DComponent } from '@xr3ngine/engine/src/common/behaviors/Object3DBehaviors';
// import { Object3DComponent } from '@xr3ngine/engine/src/common/components/Object3DComponent';
import { createPrefab } from '@xr3ngine/engine/src/common/functions/createPrefab';
import { isMobileOrTablet } from "@xr3ngine/engine/src/common/functions/isMobile";
import { Engine } from '@xr3ngine/engine/src/ecs/classes/Engine';
import { createEntity, /*getComponent,*/ getMutableComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { DefaultInitializationOptions, initializeEngine } from '@xr3ngine/engine/src/initialize';
import { NetworkSchema } from '@xr3ngine/engine/src/networking/interfaces/NetworkSchema';
import { CarController } from '@xr3ngine/engine/src/templates/car/prefabs/CarController';
import { PlayerCharacter } from "../../../engine/src/templates/character/prefabs/PlayerCharacter";
import { staticWorldColliders } from "@xr3ngine/engine/src/templates/car/prefabs/staticWorldColliders";
import { DefaultNetworkSchema } from '@xr3ngine/engine/src/templates/networking/DefaultNetworkSchema';
import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
import dynamic from 'next/dynamic';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { AmbientLight, PCFSoftShadowMap, PointLight } from 'three';
import { resetEngine } from "@xr3ngine/engine/src/ecs/functions/EngineFunctions";
import { SocketWebRTCClientTransport } from '../../classes/transports/SocketWebRTCClientTransport';
import { generalStateList, setAppOnBoardingStep } from '../../redux/app/actions';
// import { selectAppOnBoardingStep } from '../../redux/app/selector';
import { selectAuthState } from '../../redux/auth/selector';
import { client } from '../../redux/feathers';
import { selectInstanceConnectionState } from '../../redux/instanceConnection/selector';
import { connectToInstanceServer, provisionInstanceServer } from '../../redux/instanceConnection/service';
import { selectPartyState } from '../../redux/party/selector';
import store from '../../redux/store';
import { InfoBox } from "../ui/InfoBox";
import LinearProgressComponent from '../ui/LinearProgress';
import MediaIconsBox from "../ui/MediaIconsBox";
import OnBoardingBox from "../ui/OnBoardingBox";
import OnBoardingDialog from '../ui/OnBoardingDialog';
import TooltipContainer from '../ui/TooltipContainer';
import './style.module.scss';
import { CharacterAvatars } from '@xr3ngine/engine/src/templates/character/CharacterAvatars';
import { setActorAvatar } from "@xr3ngine/engine/src/templates/character/behaviors/setActorAvatar";
import { selectAppOnBoardingStep } from '../../redux/app/selector';

const MobileGamepad = dynamic(() => import("../ui/MobileGampad").then((mod) => mod.MobileGamepad),  { ssr: false });

const mapStateToProps = (state: any): any => {
  return {
    instanceConnectionState: selectInstanceConnectionState(state),
    authState: selectAuthState(state),
    partyState: selectPartyState(state),
    onBoardingStep: selectAppOnBoardingStep(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  provisionInstanceServer: bindActionCreators(
    provisionInstanceServer,
    dispatch
  ),
  connectToInstanceServer: bindActionCreators(
    connectToInstanceServer,
    dispatch
  ),
});

export const EnginePage: FunctionComponent = (props: any) => {
  const {
    authState,
    instanceConnectionState,
    partyState,
    connectToInstanceServer,
    provisionInstanceServer,
    onBoardingStep
  } = props;
  const [actorEntity, setActorEntity] = useState(null);
  const [actorAvatarId, setActorAvatarId] = useState('Rose');
  const [hoveredLabel, setHoveredLabel] = useState('');
  const [infoBoxData, setInfoBoxData] = useState(null);
  const [progressEntity, setProgressEntity] = useState('');

  const onObjectHover = (event: CustomEvent): void => {
    setHoveredLabel(event.detail.focused ? event.detail.interactionText.length > 0 ? event.detail.interactionText :'Activate'  :'');
  };

  const onObjectActivation = (event: CustomEvent): void => {
    setHoveredLabel('');
    switch (event.detail.action) {
      case "link":
        window.open(event.detail.url, "_blank");
        break;
      case "infoBox":
        setInfoBoxData(event.detail.payload);
        break;
    }
  };

  const onCarActivation = (event: CustomEvent): void => {
    setHoveredLabel(event.detail.interactionText ? event.detail.interactionText : '');
  };

  //all scene entities is loaded 
  const onSceneLoaded= (event: CustomEvent): void => {
    if (event.detail.loaded) {
      store.dispatch(setAppOnBoardingStep(generalStateList.SCENE_LOADED));      
    }
  };

  //started loading scene intities
  const onSceneLoadedEntity= (event: CustomEvent): void => {
    setProgressEntity(' left '+event.detail.left);
  };
  
  const addEventListeners = () =>{
    document.addEventListener('object-hover', onObjectHover);
    document.addEventListener('object-activation', onObjectActivation);
    document.addEventListener('player-in-car', onCarActivation);
    document.addEventListener('scene-loaded', onSceneLoaded);
    document.addEventListener('scene-loaded-entity', onSceneLoadedEntity);
  };

  useEffect(() => {
    console.log('actorEntity',actorEntity)
    console.log('actorAvatarId',actorAvatarId)
    if (actorEntity) {
      setActorAvatar(actorEntity, {avatarId: actorAvatarId});
    }
  }, [ actorEntity, actorAvatarId ]);

  useEffect(() => {
    console.log('initializeEngine!');
    addEventListeners();

    const networkSchema: NetworkSchema = {
      ...DefaultNetworkSchema,
      transport: SocketWebRTCClientTransport,
    };

    const InitializationOptions = {
      ...DefaultInitializationOptions,
      networking: {
        enabled: true,
        supportsMediaStreams: true,
        schema: networkSchema,
      },
      physics: {
        enabled: true,
      },
      audio: {
        src: '/audio/djMagda.m4a',
      },
      input: {
        mobile: isMobileOrTablet(),
      },
    };
    
    initializeEngine(InitializationOptions);

    // Load glb here
    Engine.renderer.shadowMap.enabled = true;
    Engine.renderer.shadowMap.type = PCFSoftShadowMap;

    const light = new PointLight(0xffffff, 1.8);
    light.position.set(0, 4, 4);
    light.castShadow = true;
    light.shadow.bias = -0.0006; // Prevents graphical issues
    light.shadow.mapSize.set(2048, 2048);
    light.shadow.camera.position.set(0, 4, 4);
    light.shadow.camera.updateMatrixWorld();
    Engine.scene.add(light);

    addObject3DComponent(createEntity(), {
      obj3d: AmbientLight,
      ob3dArgs: {
        intensity: 0.3,
      },
    });

    const cameraTransform = getMutableComponent<TransformComponent>(
      CameraComponent.instance.entity,
      TransformComponent
    );
    cameraTransform.position.set(0, 1.2, 3);

    createPrefab(staticWorldColliders);
    createPrefab(CarController);
    const actorEntity = createPrefab(PlayerCharacter);
    setActorEntity(actorEntity);

    return (): void => {
      document.removeEventListener('object-hover', onObjectHover);
      document.removeEventListener('object-activation', onObjectActivation);
      document.removeEventListener('player-in-car', onCarActivation);

      // cleanup
      console.log('cleanup?!');
      // TODO: use resetEngine when it will be completed. for now just reload
      //document.location.reload();
      resetEngine();
    };
  }, []);

  useEffect(() => {
    if (
      instanceConnectionState.get('instanceProvisioned') === true &&
      instanceConnectionState.get('updateNeeded') === true &&
      instanceConnectionState.get('instanceServerConnecting') === false &&
      instanceConnectionState.get('connected') === false
    ) {
      console.log('Calling connectToInstanceServer');
      connectToInstanceServer();
    }
  }, [instanceConnectionState]);

  useEffect(() => {
    if (instanceConnectionState.get('instanceProvisioned') === false && instanceConnectionState.get('instanceProvisioning') === false) {
      const user = authState.get('user');
      const party = partyState.get('party');
      const instanceId = user.instanceId != null ? user.instanceId : party.instanceId != null ? party.instanceId: null;
      if (instanceId != null) {
        client.service('instance').get(instanceId)
            .then((instance) => {
              console.log('Provisioning instance from scene init useEffect');
              provisionInstanceServer(instance.locationId);
            });
      }
    }
  }, []);

  //mobile gamepad
  const mobileGamepadProps = {hovered: hoveredLabel.length > 0, layout: 'default' };
  const mobileGamepad = isMobileOrTablet() && onBoardingStep >= generalStateList.TUTOR_MOVE ? <MobileGamepad {...mobileGamepadProps} /> : null;

  return (
    <>
    <LinearProgressComponent label={`Please wait while the World is loading ...${progressEntity}`} />
    <OnBoardingDialog avatarsList={CharacterAvatars} actorAvatarId={actorAvatarId} onAvatarChange={(avatarId) => {setActorAvatarId(avatarId) }} />
    <OnBoardingBox />
    <MediaIconsBox />
    <TooltipContainer message={hoveredLabel.length > 0 ? hoveredLabel : ''} />
    <InfoBox onClose={() => { setInfoBoxData(null); }} data={infoBoxData} />
    {mobileGamepad}
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(EnginePage);
