import { MobileGamepadProps } from '@xr3ngine/client-core/src/common/components/MobileGamepad/MobileGamepadProps';
import { generalStateList, setAppLoaded, setAppOnBoardingStep } from '@xr3ngine/client-core/src/common/reducers/app/actions';
import Store from '@xr3ngine/client-core/src/store';
import { testScenes, testUserId, testWorldState } from '@xr3ngine/common/src/assets/testScenes';
import { isMobileOrTablet } from '@xr3ngine/engine/src/common/functions/isMobile';
import { EngineEvents } from '@xr3ngine/engine/src/ecs/classes/EngineEvents';
import { resetEngine } from "@xr3ngine/engine/src/ecs/functions/EngineFunctions";
import { initializeEngine } from '@xr3ngine/engine/src/initialize';
import { DefaultInitializationOptions } from '@xr3ngine/engine/src/DefaultInitializationOptions';
import { ClientNetworkSystem } from '@xr3ngine/engine/src/networking/systems/ClientNetworkSystem';
import { styleCanvas } from '@xr3ngine/engine/src/renderer/functions/styleCanvas';
import { createPanelComponent } from '@xr3ngine/engine/src/ui/functions/createPanelComponent';
import { XRSystem } from '@xr3ngine/engine/src/xr/systems/XRSystem';
import React, { useEffect, useState } from 'react';
import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
import { DesiredTransformComponent } from '@xr3ngine/engine/src/transform/components/DesiredTransformComponent';
import { Vector3, Quaternion, Euler, Object3D } from 'three';
import { Block, Text } from "../../assets/three-mesh-ui";
import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
import { VideoPlayer } from "@xr3ngine/engine/src/video/classes/VideoPlayer";
import { Control } from "@xr3ngine/engine/src/video/classes/Control";
import { UIBaseElement, UI_ELEMENT_SELECT_STATE } from "@xr3ngine/engine/src/ui/classes/UIBaseElement";
// import { createGalleryPanel } from "@xr3ngine/engine/src/ui/classes/UIGallery";
import { UIGallery } from "@xr3ngine/engine/src/ui/classes/UIAll";
import { createItem, createCol, createRow, createButton, makeLeftItem } from '@xr3ngine/engine/src/ui//functions/createItem';
import { Color, TextureLoader } from "three";

const MobileGamepad = React.lazy(() => import("@xr3ngine/client-core/src/common/components/MobileGamepad"));
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

    createUI();
  }

  const createUI = () => {
    console.log('Engine.scene', Engine.scene);
        // Engine.scene.children[10].visible = false;      //ground
    // Engine.scene.children[12].visible = false;      //character


    // Engine.scene.children[10].visible = false;      //ground
    // Engine.scene.children[12].visible = false;      //character

    // const panelObject = createGalleryPanel();

    // const panel = new UIBaseElement();
    // panel.add(panelObject);

    // // const transform = new TransformComponent();
    const sourcePosition = new Vector3(0, 1, 0);
    const destinationPosition = new Vector3(0, 1, 0);
    
    
    createPanelComponent({ panel: new UIGallery(), parent: null, sourcePosition: sourcePosition, destinationPosition: destinationPosition });
    // createPanelComponent({ panel: new UIGallery() });
    // createPanelComponent({ panel: new UIGallery() });
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
