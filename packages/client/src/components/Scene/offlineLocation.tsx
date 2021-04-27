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
import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
import { DesiredTransformComponent } from '@xr3ngine/engine/src/transform/components/DesiredTransformComponent';
import { Vector3, Quaternion, Euler, Object3D } from 'three';
import { Block } from "@xr3ngine/engine/src/assets/three-mesh-ui";
import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
// import { Block } from "../../assets/three-mesh-ui";
import { VideoPlayer } from "@xr3ngine/engine/src/video/classes/VideoPlayer";
import { Control } from "@xr3ngine/engine/src/video/classes/Control";
import { UIBaseElement, UI_ELEMENT_SELECT_STATE } from "./UIBaseElement";
import {totalWidth, totalHeight, itemHeight, url, envUrl, videoUrl} from '../constants/Constant';

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

    Engine.scene.children[10].visible = false;      //ground
    Engine.scene.children[12].visible = false;      //character

    createUI();
  }

  const createUI = () => {
    const panel = new UIGallery();

    // const transform = new TransformComponent();
    const sourcePosition = new Vector3(0, 1, 0);
    const destinationPosition = new Vector3(0, 0, 0);
    
    createPanelComponent({ panel: panel, parent: null, sourcePosition: sourcePosition, destinationPosition: destinationPosition });
    // createPanelComponent({ panel: new UIGallery() });
    // createPanelComponent({ panel: new UIGallery() });
  }

  const createGallery = () => {
    const gap = 0.02;
    const itemWidth = 1;
    const itemHeight = 0.5;
    const totalWidth = itemWidth * 3 + gap * 4;
    const totalHeight = itemHeight * 3 + gap * 4;

    const urls = [
        "360/VR THUMBNAIL/ARCTIC/_DSC5882x 2.JPG",
        "360/VR THUMBNAIL/CUBA/DSC_9484.jpg",
        "360/VR THUMBNAIL/GALAPAGOS/20171020_GALAPAGOS_5281.jpg",
        "360/VR THUMBNAIL/GREAT WHITES/_K4O2342PIX2.jpg",
        "360/VR THUMBNAIL/HAWAII/20171020_GALAPAGOS_4273.jpg",
        "360/VR THUMBNAIL/INTO THE NOW/20171020_GALAPAGOS_0782.jpg",
        "360/VR THUMBNAIL/SHARKS OF THE WORLD/_DSC3143.jpg",
        "360/VR THUMBNAIL/WILD COAST AFRICA/_MG_8949.jpg",
        "360/VR THUMBNAIL/WRECKS AND CAVES/_DSC2512.JPG",
    ];

    const url = (index) => {
        const i = index % urls.length;
        return urls[i];
    }

    const envUrl = '360/env/Shot_03.jpg';

    const videoUrl = "360/ITN_Wrecks_FOR_REVIEW_4kx2k_360_h264_40Mbps.mp4";

    let container: Object3D = null;
    let marketPlace: Block = null;
    let library: Block = null;
    let purchasePanel: Block = null;
    let oldPanel: Block = null;
    let playButton: Block = null;
    let purchaseButton: Block = null;
    let buttonMarket: Block = null;
    let buttonLibrary: Block = null;
    let preview: Block = null;
    let buyPanel: Block = null;
    let isPurchase: Boolean = false;
    let player: VideoPlayer = null;
    let control: Control = null;

    let setPurchase = null;
    const marketPlaceItemClickCB = (panel) => {
      if(purchasePanel){
        purchasePanel.visible = true;
        marketPlace.visible = false;
        oldPanel = marketPlace;
        isPurchase = true;
        setPurchase(true);
        buttonMarket.visible = false;
        buttonLibrary.visible = false;
        preview.set({
          backgroundTexture: panel.backgroundTexture
        });
      }        
    };

    const libraryItemClickCB = (panel) => {
      if(purchasePanel){
        purchasePanel.visible = true;
        library.visible = false;
        oldPanel = library;
        isPurchase = false;
        setPurchase(false);
        buttonMarket.visible = false;
        buttonLibrary.visible = false;
        preview.set({
          backgroundTexture: panel.backgroundTexture
        });  
      }
    };

    const gallery = createGallery({
      marketPlaceItemClickCB: marketPlaceItemClickCB,
      libraryItemClickCB: libraryItemClickCB
    });
    marketPlace = gallery.marketPlace;
    library = gallery.library;
    container.add(marketPlace);
    
    container.add(library);

    container.buttonMarket = createButton({ title: "Marketplace" });
    container.buttonLibrary = createButton({ title: "Library" });

    container.add(buttonMarket);
    container.add(buttonLibrary);

    buttonMarket.position.set(-0.5, 1, 0);
    buttonLibrary.position.set(-0.05, 1, 0);

    buttonMarket.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
      library.visible = false;
      marketPlace.visible = true;
    })

    buttonLibrary.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
      library.visible = true;
      marketPlace.visible = false;
    })

    library.visible = false;
    container.position.set(0, 1, 0);
    container.rotation.y = Math.PI;
    
    const play = createPlayPanel({
      width: totalWidth,
      height: itemHeight*2.5,
      backCB: () => {
        purchasePanel.visible = false;
        oldPanel.visible = true;
        buttonMarket.visible = true;
        buttonLibrary.visible = true;
        buyPanel.visible = false;
      },
      playCB: () => {
        purchasePanel.visible = false;
        control.visible = true;
      },
      purchaseCB: () => {
        if (isPurchase){
          buyPanel.visible = true;
        }
        else{

        }
      }
    });
    
    preview = play.preview;
    purchasePanel = play.panel;
    setPurchase = play.setPurchase;
    purchasePanel.visible = false;

    container.add(purchasePanel);

    buyPanel = createBuyPanel({
        width: totalWidth*0.5,
        height: totalHeight*0.5,
        thumbnailUrls: [url(0), url(1), url(2), url(3), url(4), url(5)]
    });
    
    buyPanel.visible = false;
    preview.add(buyPanel);

    player = new VideoPlayer(this, envUrl);

    control = new Control({
      play:(played, paused)=>{
        player.playVideo(videoUrl, played, paused);
      },
      back:()=>{
        player.stopVideo();
        control.visible = false;
        library.visible = true;
      },
      seek:(time)=>{
        player.seek(time);
      }
    });
    container.add(control);

    player.control = control;

    control.visible = false;
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
