import { generalStateList, setAppLoaded, setAppOnBoardingStep } from '@xrengine/client-core/src/common/reducers/app/actions';
import Store from '@xrengine/client-core/src/store';
import { testScenes, testUserId, testWorldState } from '@xrengine/common/src/assets/testScenes';
import { isMobileOrTablet } from '@xrengine/engine/src/common/functions/isMobile';
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents';
import { resetEngine } from "@xrengine/engine/src/ecs/functions/EngineFunctions";
import { initializeEngine } from '@xrengine/engine/src/initialize';
import { ClientNetworkSystem } from '@xrengine/engine/src/networking/systems/ClientNetworkSystem';
import { UIGallery } from '@xrengine/engine/src/ui/classes/UIGallery';
import { styleCanvas } from '@xrengine/engine/src/renderer/functions/styleCanvas';
import { createPanelComponent } from '@xrengine/engine/src/ui/functions/createPanelComponent';
import { XRSystem } from '@xrengine/engine/src/xr/systems/XRSystem';
import React, { useEffect, useState } from 'react';

const MobileGamepad = React.lazy(() => import("@xrengine/client-core/src/common/components/MobileGamepad"));
const engineRendererCanvasId = 'engine-renderer-canvas';

const store = Store.store;

interface Props {
  locationName: string;
}

export const OfflineEnginePage = (props: Props) => {
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
      EngineEvents.instance.once(EngineEvents.EVENTS.SCENE_LOADED, () => {
        store.dispatch(setAppOnBoardingStep(generalStateList.SCENE_LOADED));
        setAppLoaded(true);
        resolve();
      });
      EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.LOAD_SCENE, sceneData });
    });

    const getWorldState = new Promise<any>((resolve) => {
      EngineEvents.instance.dispatchEvent({ type: ClientNetworkSystem.EVENTS.CONNECT, id: testUserId });
      resolve(testWorldState);
    });

    const [sceneLoaded, worldState] = await Promise.all([ loadScene, getWorldState ]);

    EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.JOINED_WORLD, worldState });

    createPanelComponent({ panel: new UIGallery() });
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
  return(
    <>
      {!isInXR && <div>
        <canvas id={engineRendererCanvasId} width='100%' height='100%' />
        {mobileGamepad}
      </div>}
    </>);
};
