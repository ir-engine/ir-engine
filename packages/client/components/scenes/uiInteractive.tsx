import { ThemeProvider } from '@material-ui/core';
import { CameraComponent } from '@xr3ngine/engine/src/camera/components/CameraComponent';
import { addObject3DComponent } from '@xr3ngine/engine/src/common/behaviors/Object3DBehaviors';
import { createPrefab } from '@xr3ngine/engine/src/common/functions/createPrefab';
import { isMobileOrTablet } from "@xr3ngine/engine/src/common/functions/isMobile";
import { resetEngine } from "@xr3ngine/engine/src/ecs/functions/EngineFunctions";
import { createEntity, getMutableComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { DefaultInitializationOptions, initializeEngine } from '@xr3ngine/engine/src/initialize';
import { NetworkSchema } from '@xr3ngine/engine/src/networking/interfaces/NetworkSchema';
import { staticWorldColliders } from "@xr3ngine/engine/src/templates/car/prefabs/staticWorldColliders";
import { RazerLaptop } from '@xr3ngine/engine/src/templates/devices/prefabs/RazerLaptop';
import { PlayerCharacter } from '@xr3ngine/engine/src/templates/character/prefabs/PlayerCharacterWithEmptyInputSchema';
import { DefaultNetworkSchema } from '@xr3ngine/engine/src/templates/networking/DefaultNetworkSchema';
import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { AmbientLight } from 'three';
import { SocketWebRTCClientTransport } from '../../classes/transports/SocketWebRTCClientTransport';
import { generalStateList, setAppOnBoardingStep } from '../../redux/app/actions';
import { selectAppOnBoardingStep } from '../../redux/app/selector';
import { selectAuthState } from '../../redux/auth/selector';
import { selectInstanceConnectionState } from '../../redux/instanceConnection/selector';
import { connectToInstanceServer, provisionInstanceServer } from '../../redux/instanceConnection/service';
import { selectPartyState } from '../../redux/party/selector';
import store from '../../redux/store';
import theme from '../../theme';
import LinearProgressComponent from '../ui/LinearProgress';
import { Input } from "@xr3ngine/engine/src/input/components/Input";
import { CharacterInputSchema } from '@xr3ngine/engine/src/templates/character/CharacterInputSchema';
import TooltipContainer from '../ui/TooltipContainer';
import { InfoBox } from '../ui/InfoBox';
import dynamic from 'next/dynamic';

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
  const [hoveredLabel, setHoveredLabel] = useState('');
  const [actorEntity, setActorEntity] = useState(null);
  const [infoBoxData, setInfoBoxData] = useState(null);
  const [progressEntity, setProgressEntity] = useState('');

  const sceneLoadedEntity = (event: CustomEvent): void =>
    setProgressEntity(event.detail.left);

  const onObjectHover = (event: CustomEvent): void =>
    setHoveredLabel(event.detail.focused ? event.detail.interactionText : '');
  

  const onObjectActivation = (event: CustomEvent): void =>{
    setInfoBoxData(event.detail.payload);
    setHoveredLabel('');
  };

  const sceneLoaded = (event: CustomEvent) => 
    (event.detail.loaded == true) &&
        store.dispatch(setAppOnBoardingStep(generalStateList.SCENE_LOADED));          
  
  
  useEffect(() => {
    document.addEventListener('scene-loaded-entity', sceneLoadedEntity);
    document.addEventListener('scene-loaded', sceneLoaded);
    document.addEventListener('object-activation', onObjectActivation); 
    document.addEventListener('object-hover', onObjectHover);   

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

    addObject3DComponent(createEntity(), {
      obj3d: AmbientLight,
      ob3dArgs: {
        intensity: 2,
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
    const InputComponent = getMutableComponent(actorEntity, Input);
    InputComponent.schema = CharacterInputSchema;

    createPrefab(RazerLaptop);

    return (): void => {
      document.removeEventListener('scene-loaded-entity', sceneLoadedEntity);
      document.removeEventListener('scene-loaded', sceneLoaded);
      document.removeEventListener('object-activation', onObjectActivation);    
      document.removeEventListener('object-hover', onObjectHover);   

      resetEngine();
    };
  }, []);

   //mobile gamepad
   const mobileGamepadProps = {hovered:hoveredLabel.length > 0, layout: 'default' };
   const mobileGamepad = isMobileOrTablet() ? <MobileGamepad {...mobileGamepadProps} /> : null; 

  return (
    <ThemeProvider theme={theme}>
      <LinearProgressComponent label={progressEntity} />
      <TooltipContainer message={hoveredLabel} />
      <InfoBox onClose={() => { setInfoBoxData(null); }} data={infoBoxData} />
      {mobileGamepad}
    </ThemeProvider>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(EnginePage);
