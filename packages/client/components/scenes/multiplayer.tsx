import { CameraComponent } from '@xr3ngine/engine/src/camera/components/CameraComponent';
import { createPrefab } from '@xr3ngine/engine/src/common/functions/createPrefab';
import { resetEngine } from "@xr3ngine/engine/src/ecs/functions/EngineFunctions";
import { /*getComponent,*/ getMutableComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { DefaultInitializationOptions, initializeEngine } from '@xr3ngine/engine/src/initialize';
import { NetworkSchema } from '@xr3ngine/engine/src/networking/interfaces/NetworkSchema';
import { loadScene } from "@xr3ngine/engine/src/scene/functions/SceneLoading";
import { staticWorldColliders } from '@xr3ngine/engine/src/templates/car/prefabs/staticWorldColliders';
import { PlayerCharacter } from '@xr3ngine/engine/src/templates/character/prefabs/PlayerCharacterWithEmptyInputSchema';
import { DefaultNetworkSchema } from '@xr3ngine/engine/src/templates/networking/DefaultNetworkSchema';
import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { SocketWebRTCClientTransport } from '../../classes/transports/SocketWebRTCClientTransport';
import { generalStateList, setAppLoaded, setAppOnBoardingStep } from '../../redux/app/actions';
import { client } from '../../redux/feathers';
import store from '../../redux/store';
import LinearProgressComponent from '../ui/LinearProgress';
import NetworkDebug from '../ui/NetworkDebug/NetworkDebug';

const projectRegex = /\/([A-Za-z0-9]+)\/([a-f0-9-]+)$/;

interface Props {
  setAppLoaded?: any
  sceneId?: string
}

const mapStateToProps = (state: any): any => {
  return {};
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  setAppLoaded: bindActionCreators(setAppLoaded, dispatch)
});

export const EnginePage = (props: Props) => {
  const {
    sceneId,
    setAppLoaded
  } = props;

  const [progressEntity, setProgressEntity] = useState('');

  //all scene entities are loaded 
  const onSceneLoaded = (event: CustomEvent): void => {
    if (event.detail.loaded) {
      store.dispatch(setAppOnBoardingStep(generalStateList.SCENE_LOADED));
      setAppLoaded(true);
    }
  };

  //started loading scene intities
  const onSceneLoadedEntity = (event: CustomEvent): void => {
    setProgressEntity(' left ' + event.detail.left);
  };

  const addEventListeners = () => {
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
        schema: networkSchema,
      }
    };

    initializeEngine(InitializationOptions);

    init(sceneId).catch((e) => { console.log(e); });

    return (): void => {
      resetEngine();
    };
  }, []);


  async function init(sceneId: string): Promise<any> { // auth: any,
    let service, serviceId;
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
    loadScene(result);
    const cameraTransform = getMutableComponent<TransformComponent>(
      CameraComponent.instance.entity,
      TransformComponent
    );
    cameraTransform.position.set(0, 1.2, 10);
    
    createPrefab(staticWorldColliders);

  }

  return (
    <>
      <NetworkDebug />
      <LinearProgressComponent label={`Please wait while the World is loading ...${progressEntity}`} />
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(EnginePage);
