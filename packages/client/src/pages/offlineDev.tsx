import { generalStateList, setAppLoaded, setAppOnBoardingStep } from '@xrengine/client-core/src/common/reducers/app/actions';
import { initializeEngine } from '@xrengine/client-core/src/initialize';
import Store from '@xrengine/client-core/src/store';
import { testScenes, testUserId, testWorldState } from '@xrengine/common/src/assets/testScenes';
import { isMobileOrTablet } from '@xrengine/engine/src/common/functions/isMobile';
import { DefaultInitializationOptions } from '@xrengine/engine/src/DefaultInitializationOptions';
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents';
import { resetEngine } from "@xrengine/engine/src/ecs/functions/EngineFunctions";
import { ClientNetworkSystem } from '@xrengine/engine/src/networking/systems/ClientNetworkSystem';
import { styleCanvas } from '@xrengine/engine/src/renderer/functions/styleCanvas';
import { WorldScene } from '@xrengine/engine/src/scene/functions/SceneLoading';
import { XRSystem } from '@xrengine/engine/src/xr/systems/XRSystem';
import React, { useEffect, useState } from 'react';

const LocationPage = () => {
  return (
    <>
      <DevPage/>
    </>
  );
};

export default LocationPage;

const engineRendererCanvasId = 'engine-renderer-canvas';

const store = Store.store;


const DevPage = () => {

  const [isInXR, setIsInXR] = useState(false);
  useEffect(() => {
    init();
  }, []);

  async function init(): Promise<any> {
    const sceneData = testScenes.test;

    const canvas = document.getElementById(engineRendererCanvasId) as HTMLCanvasElement;
    styleCanvas(canvas);
    const InitializationOptions = {
      ...DefaultInitializationOptions,
      renderer: {
        canvas,
      },
      useOfflineMode: true,
      postProcessing: false,
    };
    console.log(InitializationOptions);
    await initializeEngine(InitializationOptions);

    document.dispatchEvent(new CustomEvent('ENGINE_LOADED')); // this is the only time we should use document events. would be good to replace this with react state

    addUIEvents();

    const loadScene = new Promise<void>((resolve) => {
      WorldScene.load(sceneData as any, () => {
        store.dispatch(setAppOnBoardingStep(generalStateList.SCENE_LOADED));
        setAppLoaded(true);
        resolve();
      });
    });

    const getWorldState = new Promise<any>((resolve) => {
      EngineEvents.instance.dispatchEvent({ type: ClientNetworkSystem.EVENTS.CONNECT, id: testUserId });
      resolve(testWorldState);
    });

    const [sceneLoaded, worldState] = await Promise.all([loadScene, getWorldState]);

    EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.JOINED_WORLD, worldState });
  }

  const addUIEvents = () => {
    EngineEvents.instance.addEventListener(XRSystem.EVENTS.XR_START, async (ev: any) => { setIsInXR(true); });
    EngineEvents.instance.addEventListener(XRSystem.EVENTS.XR_END, async (ev: any) => { setIsInXR(false); });
  };

  return (
    <>
      {!isInXR && <div>
        <canvas id={engineRendererCanvasId} width='100%' height='100%' />
      </div>}
    </>);
};
