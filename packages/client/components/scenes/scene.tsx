import { CameraComponent } from '@xr3ngine/engine/src/camera/components/CameraComponent';
import { addObject3DComponent } from '@xr3ngine/engine/src/common/behaviors/Object3DBehaviors';
import { createPrefab } from '@xr3ngine/engine/src/common/functions/createPrefab';
import { isMobileOrTablet } from "@xr3ngine/engine/src/common/functions/isMobile";
import { Engine } from '@xr3ngine/engine/src/ecs/classes/Engine';
import { resetEngine } from "@xr3ngine/engine/src/ecs/functions/EngineFunctions";
import { createEntity, /*getComponent,*/ getMutableComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { DefaultInitializationOptions, initializeEngine } from '@xr3ngine/engine/src/initialize';
import { NetworkSchema } from '@xr3ngine/engine/src/networking/interfaces/NetworkSchema';
import { staticWorldColliders } from "@xr3ngine/engine/src/templates/car/prefabs/staticWorldColliders";
import { CharacterAvatars } from '@xr3ngine/engine/src/templates/character/CharacterAvatars';
import { PlayerCharacter } from '@xr3ngine/engine/src/templates/character/prefabs/PlayerCharacterWithEmptyInputSchema';
import { DefaultNetworkSchema } from '@xr3ngine/engine/src/templates/networking/DefaultNetworkSchema';
import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { AmbientLight, DirectionalLight, HemisphereLight } from 'three';
import { SocketWebRTCClientTransport } from '../../classes/transports/SocketWebRTCClientTransport';
import { generalStateList, setAppOnBoardingStep, setAppLoaded } from '../../redux/app/actions';
import store from '../../redux/store';
import LinearProgressComponent from '../ui/LinearProgress';
import NetworkDebug from '../ui/NetworkDebug/NetworkDebug';

const mapStateToProps = (state: any): any => {
  return { };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  setAppLoaded: bindActionCreators(setAppLoaded, dispatch)
});

export const EnginePage: FunctionComponent = (props: any) => {
    const [actorEntity, setActorEntity] = useState(null);

  const {
    setAppLoaded
  } = props;
  const [progressEntity, setProgressEntity] = useState('');

  //all scene entities is loaded 
  const onSceneLoaded= (event: CustomEvent): void => {
    if (event.detail.loaded) {
      store.dispatch(setAppOnBoardingStep(generalStateList.SCENE_LOADED));
      setAppLoaded(true);
    }
  };

  //started loading scene intities
  const onSceneLoadedEntity= (event: CustomEvent): void => {
    setProgressEntity(' left '+event.detail.left);
  };
  
  const addEventListeners = () =>{
    document.addEventListener('scene-loaded', onSceneLoaded);
    document.addEventListener('scene-loaded-entity', onSceneLoadedEntity);
  };

  useEffect(() => {
    addEventListeners();

    const networkSchema: NetworkSchema = {
      ...DefaultNetworkSchema,
      transport: SocketWebRTCClientTransport,
    };

    const InitializationOptions = {
      ...DefaultInitializationOptions,
      networking: {
        ...DefaultInitializationOptions.networking,
        schema: networkSchema,
      }
    };
    
    initializeEngine(InitializationOptions);

    const light = new DirectionalLight(0xffffff, 1.0);
    light.color.setHSL( 0.1, 1, 0.95 );
    light.position.set( - 1, 1.75, 1 );
    light.position.multiplyScalar( 30 );
    light.castShadow = true;
    Engine.scene.add(light);

    const hemiLight = new HemisphereLight( 0xffffff, 0xffffff, 2 );
    hemiLight.color.setHSL( 0.6, 1, 0.6 );
    hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    hemiLight.position.set( 0, 50, 0 );

    Engine.scene.add(hemiLight);

    addObject3DComponent(createEntity(), {
      obj3d: AmbientLight,
      ob3dArgs: {
        intensity: .5,
      },
    });

    const cameraTransform = getMutableComponent<TransformComponent>(
      CameraComponent.instance.entity,
      TransformComponent
    );
    cameraTransform.position.set(0, 1.2, 3);

    createPrefab(staticWorldColliders);

    const actorEntity = createPrefab(PlayerCharacter);
    setActorEntity(actorEntity);

    return (): void => {
      resetEngine();
    };
  }, []);

  return (
    <>
    <NetworkDebug />
    <LinearProgressComponent label={`Please wait while the World is loading ...${progressEntity}`} />
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(EnginePage);
