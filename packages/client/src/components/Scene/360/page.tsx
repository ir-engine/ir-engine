import { MobileGamepadProps } from '@xrengine/client-core/src/common/components/MobileGamepad/MobileGamepadProps';
import { generalStateList, setAppLoaded, setAppOnBoardingStep } from '@xrengine/client-core/src/common/reducers/app/actions';
import Store from '@xrengine/client-core/src/store';
import { testScenes, testUserId, testWorldState } from '@xrengine/common/src/assets/testScenes';
import { isMobileOrTablet } from '@xrengine/engine/src/common/functions/isMobile';
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents';
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine';
import { resetEngine } from "@xrengine/engine/src/ecs/functions/EngineFunctions";
import { initializeEngine } from '@xrengine/client-core/src/initialize';
import { DefaultInitializationOptions } from '@xrengine/engine/src/DefaultInitializationOptions';
import { ClientNetworkSystem } from '@xrengine/engine/src/networking/systems/ClientNetworkSystem';
import { styleCanvas } from '@xrengine/engine/src/renderer/functions/styleCanvas';
import { createPanelComponent } from '@xrengine/engine/src/ui/functions/createPanelComponent';
import { XRSystem } from '@xrengine/engine/src/xr/systems/XRSystem';
import React, { useEffect, useState } from 'react';
import {XR360Player} from './app';
import {testScene} from './test';
import { WorldScene } from '@xrengine/engine/src/scene/functions/SceneLoading';

const MobileGamepad = React.lazy(() => import("@xrengine/client-core/src/common/components/MobileGamepad"));
const engineRendererCanvasId = 'engine-renderer-canvas';

const store = Store.store;

interface Props {
  locationName: string;
}


export const XR360PlayerPage = (props: Props) => {
  const {
    locationName,
  } = props;

  const [isInXR, setIsInXR] = useState(false);
  useEffect(() => {
    init(locationName);
  }, []);

  async function init(sceneId: string): Promise<any> {
    const sceneData = testScenes[sceneId] || testScenes.test;

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
      WorldScene.load(sceneData, () => {
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

    Engine.scene.children[10].visible = false;      //hide ground

    createPanelComponent({ panel: new XR360Player(testScene) });
  }

  const addUIEvents = () => {
    EngineEvents.instance.addEventListener(XRSystem.EVENTS.XR_START, async (ev: any) => { setIsInXR(true); });
    EngineEvents.instance.addEventListener(XRSystem.EVENTS.XR_END, async (ev: any) => { setIsInXR(false); });
  };

  useEffect(() => {
    return (): void => {
      resetEngine();
    };
  }, []);

  //mobile gamepad
  const mobileGamepadProps = { layout: 'default' };
  const mobileGamepad = isMobileOrTablet() ? <MobileGamepad {...mobileGamepadProps} /> : null;
  return (
    <>
      {!isInXR && <div>
        <canvas id={engineRendererCanvasId} width='100%' height='100%' />
        {mobileGamepad}
      </div>}
    </>);
};
