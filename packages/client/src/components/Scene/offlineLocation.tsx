import { MobileGamepadProps } from '@xr3ngine/client-core/src/common/components/MobileGamepad/MobileGamepadProps';
import { generalStateList, setAppLoaded, setAppOnBoardingStep } from '@xr3ngine/client-core/src/common/reducers/app/actions';
import store from '@xr3ngine/client-core/src/store';
import { testScenes, testUserId, testWorldState } from '@xr3ngine/common/src/assets/testScenes';
import { isMobileOrTablet } from '@xr3ngine/engine/src/common/functions/isMobile';
import { EngineEvents } from '@xr3ngine/engine/src/ecs/classes/EngineEvents';
import { resetEngine } from "@xr3ngine/engine/src/ecs/functions/EngineFunctions";
import { DefaultInitializationOptions, initializeEngine } from '@xr3ngine/engine/src/initialize';
import { ClientNetworkSystem } from '@xr3ngine/engine/src/networking/systems/ClientNetworkSystem';
import { styleCanvas } from '@xr3ngine/engine/src/renderer/functions/styleCanvas';
import { createPanelComponent } from '@xr3ngine/engine/src/ui/functions/createPanelComponent';
import { XRSystem } from '@xr3ngine/engine/src/xr/systems/XRSystem';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
import { DesiredTransformComponent } from '@xr3ngine/engine/src/transform/components/DesiredTransformComponent';
import { Vector3, Quaternion, Euler, Object3D } from 'three';
import { Block, Text } from "@xr3ngine/engine/src/assets/three-mesh-ui";
import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
import { VideoPlayer } from "@xr3ngine/engine/src/video/classes/VideoPlayer";
import { Control } from "@xr3ngine/engine/src/video/classes/Control";
import { UIBaseElement, UI_ELEMENT_SELECT_STATE } from "@xr3ngine/engine/src/ui/classes/UIBaseElement";
import { createItem, createCol, createRow, createButton, makeLeftItem } from '@xr3ngine/engine/src/ui//functions/createItem';
import { Color, TextureLoader } from "three";

const MobileGamepad = dynamic<MobileGamepadProps>(() => import("@xr3ngine/client-core/src/common/components/MobileGamepad").then((mod) => mod.MobileGamepad), { ssr: false });
const engineRendererCanvasId = 'engine-renderer-canvas';

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

    Engine.scene.children[10].visible = false;      //ground
    Engine.scene.children[12].visible = false;      //character

    createUI();
  }

  const createUI = () => {
    const panelObject = createGalleryPanel();

    const panel = new UIBaseElement();
    panel.add(panelObject);

    // const transform = new TransformComponent();
    const sourcePosition = new Vector3(0, 1, 0);
    const destinationPosition = new Vector3(0, 0, 0);
    
    createPanelComponent({ panel: panel, parent: null, sourcePosition: sourcePosition, destinationPosition: destinationPosition });
    // createPanelComponent({ panel: new UIGallery() });
    // createPanelComponent({ panel: new UIGallery() });
  }

  const createGalleryPanel = () => {    
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

    buttonMarket = createButton({ title: "Marketplace" });
    buttonLibrary = createButton({ title: "Library" });

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

const createGallery = (param) => {
  const marketPlaceItemClickCB = param.marketPlaceItemClickCB;
  const libraryItemClickCB = param.libraryItemClickCB;

  let urlIndex = 0;

  const ov = createItem({
      title: "Scene Title",
      description: "Scene Description\nSecode line of description",
      imageUrl: url(urlIndex++),
      width: totalWidth,
      height: 0.8,
      selectable: true
  });
  ov.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, ()=>{
      marketPlaceItemClickCB(ov);
  });

  let cols = [];
  cols.push(ov);

  for (let j = 0; j < 2; j++) {
      const rows = [];
      for (let i = 0; i < 3; i++) {
          const panel = createItem({
              title: "Scene Title",
              description: "Scene Description",
              imageUrl: url(urlIndex++),
              width: itemWidth,
              height: itemHeight,
              selectable: true
          });
          rows.push(panel);

          panel.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, ()=>{
              marketPlaceItemClickCB(panel);
          });
      }
      cols.push(createRow(totalWidth, itemHeight, rows, gap));
  }

  const marketPlace = createCol(totalWidth, totalHeight, cols, gap);

  cols = [];
  for (let j = 0; j < 3; j++) {
      const rows = [];
      for (let i = 0; i < 3; i++) {
          const panel = createItem({
              title: "Scene Title",
              description: "Scene Description",
              imageUrl: url(urlIndex++),
              width: itemWidth,
              height: itemHeight,
              selectable: true
          });
          rows.push(panel);

          panel.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, ()=>{
              libraryItemClickCB(panel);
          });
      }
      cols.push(createRow(totalWidth, itemHeight, rows, gap));
  }

  const buttonHeight = 0.1;
  const dummy = new Block({
      width: itemWidth,
      height: buttonHeight,
      backgroundOpacity: 0.0,
  });
  const buttonNext = createButton({ title: "Next" });
  const buttonBar = createRow(totalWidth, buttonHeight, [dummy, buttonNext], 0);
  buttonBar.set({
      alignContent: 'center',
      justifyContent: 'end',
  });
  cols.push(buttonBar);

  const library = createCol(totalWidth, totalHeight, cols, gap);

  buttonNext.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
      library.visible = false;
      marketPlace.visible = true;
  });

  return {
      marketPlace: marketPlace,
      library: library,
  }
}


const createPlayPanel = (param) => {
  const width = param.width;
  const height = param.height;

  const backButton = createButton({
    title: "Back"
  });

  const preview = createItem({
    width: width,
    height: height,
    texture: param.texture,
  });
  preview.set({
    alignContent: 'center',
    justifyContent: 'center',
  });

  const text = createItem({
    width: width-0.8-0.025*4,
    height: 0.1,
    title: "SceneTitle",
    description: "Scene Description",
  });
  text.set({
    backgroundOpacity: 0.0,      
  })

  const purchaseButton = createButton({
    title: "Purchase"
  });

  const playButton = createButton({
    title: "Play"
  });

  const bottomBar = createRow(
    width, 0.2, 
    [
      text, 
      playButton,
      purchaseButton
    ], 
    0.025);

  playButton.visible = false;

  const panel = createCol(
    width, height, 
    [
      makeLeftItem({item: backButton, containerWidth: width}), 
      preview, 
      bottomBar
    ], 
    0.01);

  backButton.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, param.backCB );
  playButton.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, param.playCB);
  purchaseButton.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, param.purchaseCB);

  return {
      preview: preview,
      panel: panel,
      setPurchase: (isPurchase) => {
        if(isPurchase){
          playButton.visible = false;
          purchaseButton.children[1].set({
            content: "Purchase"
          });
        }
        else{
          playButton.visible = true;
          purchaseButton.children[1].set({
            content: "Download"
          });
        }
      }
  };
}


const createBuyPanel = (param) => {
  const width = param.width;
  const height = param.height;
  const urls = param.thumbnailUrls;

  const container = new Block({
    width: width,
    height: height,
    fontFamily: "https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.json",
    fontTexture: "https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.png",
    backgroundOpacity: 1.0,
  });

  const topBar = new Block({
    width: width,
    height: 0.2,
    backgroundOpacity: 0.0,
    contentDirection: 'row'
  });
  container.add(topBar);
  
  const closeButton = new Block({
    height: 0.1,
    width: 0.1,
    margin: 0,
    padding: 0.01,
    alignContent: "center",
    backgroundOpacity: 0.0,
  }).add(
    new Text({
      content: "x",
      fontSize: 0.05
    })
  );
  topBar.add(closeButton);

  const title = new Block({
    height: 0.2,
    width: width-0.2,
    margin: 0,
    padding: 0.07,
    alignContent: "center",
    backgroundOpacity: 0.0,
  }).add(
    new Text({
      content: "This video is part of the ",
      fontSize: 0.05,
    }),
    new Text({
        content: "Oceania 2021",
        fontSize: 0.07,
      }),
      new Text({
        content: " Bundle.",
        fontSize: 0.05,
      })
  );
  topBar.add(title);
  
  const middleBar = new Block({
    width: width,
    height: height*0.7,
    backgroundOpacity: 0.0,
    contentDirection: 'row'
  });
  container.add(middleBar);

  const leftBar = new Block({
    width: width*0.4*1.2,
    height: height*0.7,
    backgroundOpacity: 0.0,
    padding: 0.1,
    // margin: 0.1,
    alignContent: "left",
    justifyContent: "start",
    contentDirection: 'column'
  });
  middleBar.add(leftBar);

  const thumbWidth = width*0.4*0.8;
  const overview = new Block({
        width: thumbWidth+6*0.01,
        height: thumbWidth*0.6,
        backgroundSize: 'cover',
        contentDirection: 'row',
        margin: 0.005,
        alignContent: "center",
      });//contain, cover, stretch
  
  const loader = new TextureLoader();
  loader.load(
      urls[0],
      (texture) => {
          overview.set({backgroundTexture: texture});
      }
  );
  
  leftBar.add(overview);
    
  const thumbBar = new Block({
    width: thumbWidth,
    height: thumbWidth/6*0.6,
    backgroundOpacity: 0.0,
    contentDirection: 'row',
    alignContent: "center",
    margin: 0.005,
  });
  leftBar.add(thumbBar);  

  urls.forEach(u => {
      const subitem = new Block({
          width: thumbWidth/6,
          height: thumbWidth/6*0.6,
          backgroundSize: 'cover',
          margin: 0.005,
          padding: 0,
          alignContent: "center",
      });//contain, cover, stretch
    
      loader.load(
          u,
          (texture) => {
              subitem.set({backgroundTexture: texture});
          }
      );                

      thumbBar.add(subitem);
  });

  const leftTextCol = new Block({
    width: width*0.25,
    height: height*0.7,
    backgroundOpacity: 0.0,
    padding: 0.1,
    alignContent: "left",
    justifyContent: "start",
    contentDirection: 'column',
  });
  middleBar.add(leftTextCol);

  leftTextCol.add(
    new Text({
      content: "Complete Bundle",
      fontSize: 0.04,
    }),
    new Text({
        content: "\nIncludes 12 Experiences",
        fontSize: 0.03,
    }),
    new Text({
      content: "\n\n\n\n            Total",
      fontSize: 0.04,
    })
  );

  const rightTextCol = new Block({
    width: width*0.25,
    height: height*0.7,
    backgroundOpacity: 0.0,
    padding: 0.1,
    alignContent: "right",
    justifyContent: "start",
    contentDirection: 'column',
  });
  middleBar.add(rightTextCol);

  const buyButton = new Block({
    height: 0.1,
    width: 0.2,
    backgroundColor: new Color('blue'),
    backgroundOpacity: 1.0,
    alignContent: "center",
    justifyContent: "center",
  }).add(
    new Text({
      content: "Buy",
      fontSize: 0.05,
    })
  );

  rightTextCol.add( 
    new Block({
      height: 0.4,
      width: 0.2,
      backgroundOpacity: 0.0,
      alignContent: "right",
      justifyContent: "start",
      contentDirection: 'column',
    }).add(
      new Text({
        content: "$9.99",
        fontSize: 0.04,
      }),
      new Text({
        content: "\n\n\n\n\n$9.99",
        fontSize: 0.04,
      })
    ),
    buyButton
  );

  return container;
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
