import { Object3D, Color } from "three";
import { UIOverview } from "./UIOverview";
import { UIPanel } from './UIPanel';
import { UIButton } from "./UIButton";
import { UIBaseElement, UI_ELEMENT_SELECT_STATE } from "./UIBaseElement";
import {createItem, createCol, createRow, createButton, makeLeftItem} from '../functions/createItem';
import { Block } from "../../assets/three-mesh-ui";

export class UIGallery extends UIBaseElement {
  marketPlace: Block;
  library: Block;
  purchasePanel: Block;
  oldPanel: Block;
  playButton: Block;
  purchaseButton: Block;
  buttonMarket: Block;
  buttonLibrary: Block;
  preview: Block;

  constructor() {
    super();

    this.init();
  }

  init() {
    // const url = "360/ITN_Wrecks_FOR_REVIEW_4kx2k_360_h264_40Mbps.mp4";
    // const videoElement = new VideoElement(3.2, 0.8, 0.1, 1.35, url);
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
    
    let url = (index)=>{
      let i = index % urls.length;
      return urls[i];
    }

    let urlIndex = 0;
    const gap = 0.02;
    const itemWidth = 1;
    const itemHeight = 0.5;
    const totalWidth = itemWidth*3+gap*4;
    const totalHeight = itemHeight*3+gap*4;

    let ov = createItem({
      title: "Scene Title", 
      description: "Scene Description\nSecode line of description", 
      imageUrl: url(urlIndex++),
      width: totalWidth,
      height: 0.8,
      selectable: true
    });
    ov.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
      this.purchasePanel.visible = true;
      this.marketPlace.visible = false;
      this.oldPanel = this.marketPlace;
      this.buttonMarket.visible = false;
      this.buttonLibrary.visible = false;
      this.purchasePanel
      this.preview.set({
        backgroundTexture: ov.backgroundTexture
      });
    })

    let cols = [];
    cols.push(ov);

    for(let j=0;j<2;j++){
      let rows = [];
      for(let i = 0 ; i < 3;i++)
      {
        const panel = createItem({
          title: "Scene Title", 
          description: "Scene Description", 
          imageUrl: url(urlIndex++),
          width: itemWidth,
          height: itemHeight,
          selectable: true
        });
        rows.push(panel);

        panel.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
          this.purchasePanel.visible = true;
          this.marketPlace.visible = false;
          this.oldPanel = this.marketPlace;
          this.setPurchase(true);
          this.buttonMarket.visible = false;
          this.buttonLibrary.visible = false;
          this.preview.set({
            backgroundTexture: panel.backgroundTexture
          });
        })
      }
      cols.push(createRow(totalWidth, itemHeight, rows, gap));
    }

    this.marketPlace = createCol(totalWidth, totalHeight, cols, gap);
    this.add(this.marketPlace);

    cols = [];
    for (let j = 0; j < 3; j++) {
      let rows = [];
      for(let i = 0 ; i < 3;i++)
      {
        const panel = createItem({
          title: "Scene Title", 
          description: "Scene Description", 
          imageUrl: url(urlIndex++),
          width: itemWidth,
          height: itemHeight,
          selectable: true
        });
        rows.push(panel);

        panel.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
          this.purchasePanel.visible = true;
          this.library.visible = false;
          this.oldPanel = this.library;
          this.setPurchase(false);
          this.buttonMarket.visible = false;
          this.buttonLibrary.visible = false;
          this.preview.set({
            backgroundTexture: panel.backgroundTexture
          });
        })
      }
      cols.push(createRow(totalWidth, itemHeight, rows, gap));
    }
    
    const buttonHeight = 0.1;
    let dummy = new Block({
      width: itemWidth,
      height: buttonHeight,
      backgroundOpacity: 0.0,
    });
    let buttonNext = createButton({title:"Next"});
    let buttonBar = createRow(totalWidth, buttonHeight, [dummy, buttonNext], 0);
    buttonBar.set({
      alignContent: 'center',
      justifyContent: 'end',
    });
    cols.push(buttonBar);

    this.library = createCol(totalWidth, totalHeight, cols, gap);
    this.add(this.library);

    this.buttonMarket = createButton({title:"Marketplace"});
    this.buttonLibrary = createButton({title:"Library"});

    this.add(this.buttonMarket);
    this.add(this.buttonLibrary);

    this.buttonMarket.position.set(-0.5, 1, 0);
    this.buttonLibrary.position.set(-0.05, 1, 0);

    this.buttonMarket.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
      this.library.visible = false;
      this.marketPlace.visible = true;
    })

    this.buttonLibrary.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
      this.library.visible = true;
      this.marketPlace.visible = false;
    })

    buttonNext.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
      this.library.visible = false;
      this.marketPlace.visible = true;
    })

    this.library.visible = false;

    this.position.set(0, 1, 0);
    this.rotation.y = Math.PI;
    
    this.purchasePanel = this.createPurchaseSession({
      width: totalWidth,
      height: itemHeight*2.5,
    });
    this.purchasePanel.visible = false;

    this.add(this.purchasePanel);
  }

  setPurchase(isPurchase){
    if(isPurchase){
      this.playButton.visible = false;
      this.purchaseButton.children[1].set({
        content: "Purchase"
      });
    }
    else{
      this.playButton.visible = true;
      this.purchaseButton.children[1].set({
        content: "Download"
      });
    };
  }

  createPurchaseSession(param){
    const width = param.width;
    const height = param.height;

    let backButton = createButton({
      title: "Back"
    });

    this.preview = createItem({
      width: width,
      height: height,
      texture: param.texture,
    });

    let text = createItem({
      width: width-0.8-0.025*4,
      height: 0.1,
      title: "SceneTitle",
      description: "Scene Description",
    });
    text.set({
      backgroundOpacity: 0.0,      
    })

    this.purchaseButton = createButton({
      title: "Purchase"
    });

    this.playButton = createButton({
      title: "Play"
    });

    let bottomBar = createRow(
      width, 0.2, 
      [
        text, 
        this.playButton,
        this.purchaseButton
      ], 
      0.025);

    this.playButton.visible = false;

    backButton.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
      this.purchasePanel.visible = false;
      this.oldPanel.visible = true;
      this.buttonMarket.visible = true;
      this.buttonLibrary.visible = true;
    });

    this.playButton.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
      // this.library.visible = false;
      // this.marketPlace.visible = true;
    });

    this.purchaseButton.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
      // this.library.visible = false;
      // this.marketPlace.visible = true;
    });
    
    return createCol(
      width, height, 
      [
        makeLeftItem({item: backButton, containerWidth: width}), 
        this.preview, 
        bottomBar
      ], 
      0.01);
  }
}