import { Object3D } from "three";
import { UIOverview } from "./UIOverview";
import { UIPanel } from './UIPanel';
import { UIButton } from "./UIButton";
import { UIBaseElement, UI_ELEMENT_SELECT_STATE } from "./UIBaseElement";
import {createItem, createCol, createRow} from '../functions/createItem';

export class UIGallery extends UIBaseElement {
  marketPlace: Object3D;
  library: Object3D;
  pickables: any[];
  add: any;
  position: any;
  rotation: any;

  constructor() {
    super();

    this.init();
  }

  init() {
    this.marketPlace = new Object3D();
    this.add(this.marketPlace);

    this.library = new Object3D();
    this.add(this.library);

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

    let ov = createItem({
      title: "Scene Title", 
      description: "Scene Description\nSecode line of description", 
      imageUrl: url(urlIndex++),
      width: 3,
      height: 0.8,
    });

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
          width: 1,
          height: 0.5,
        });
        rows.push(panel);
      }
      cols.push(createRow(3, 0.5, rows, 0.1));
    }

    let mm = createCol(3, 1.5, cols, 0.1);
    this.marketPlace.add( mm );

    // const ov = new UIOverview("Scene Title", "Scene Description\nSecode line of description", null);
    // this.marketPlace.add(ov);
    // this.elements.push(ov);

    const marketPlacePanels = [];
    // marketPlacePanels.push(ov);

    // for (let i = 0; i < 3; i++) {
    //   for (let j = 0; j < 2; j++) {

    //     const x = 1.1 * i - 1;
    //     const y = j * 0.6;

    //     const panel = new UIPanel({
    //       title: "Scene Title", 
    //       description: "Scene Description", 
    //       url: null
    //     });
    //     panel.position.set(x, y, 0);

    //     panel.oldPosX = panel.position.x;
    //     panel.oldPosY = panel.position.y;
    //     panel.oldPosZ = panel.position.z;

    //     this.marketPlace.add(panel);

       // this.elements.push(panel.container);
        this.elements.push(panel.button1);
        this.elements.push(panel.button2);
        this.elements.push(panel.button3);

    //     marketPlacePanels.push(panel);

    //     // panel.pick = (state) => {
    //     //   if(state){
    //     //     // this.library.visible = false;
    //     //     // this.marketPlace.visible = false;  
    //     //   }
    //     //   panel.picked(state);
    //     // }
    //   }
    // }

    const libraryPanels = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {

        const x = 1.1 * i - 1;
        const y = j * 0.6 + 0.2;

        const panel = new UIPanel("Scene Title", "Scene Description", null);
        panel.position.set(x, y, 0);

        panel.oldPosX = panel.position.x;
        panel.oldPosY = panel.position.y;
        panel.oldPosZ = panel.position.z;

        this.library.add(panel);

      //  this.elements.push(panel.container);
        this.elements.push(panel.button1);
        this.elements.push(panel.button2);
        this.elements.push(panel.button3);

        libraryPanels.push(panel);
        // panel.pick = (state) => {
        //   if(state){
        //     // this.library.visible = false;
        //     // this.marketPlace.visible = false;  
        //   }
        //   panel.picked(state);
        // }
      }
    }

    const button1 = new UIButton('Marketplace', 0);
    const button2 = new UIButton('Library', 1);

    marketPlacePanels.push(button1);
    marketPlacePanels.push(button2);

    libraryPanels.push(button1);
    libraryPanels.push(button2);

    marketPlacePanels.forEach(e => {
      e.siblings = marketPlacePanels;
    });

    libraryPanels.forEach(e => {
      e.siblings = libraryPanels;
    });

    this.add(button1);
    this.add(button2);

    button1.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
      this.library.visible = false;
      this.marketPlace.visible = true;
    })

    button2.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
      this.library.visible = true;
      this.marketPlace.visible = false;
    })

    this.library.visible = false;

    this.elements.push(button1);
    this.elements.push(button2);

    this.position.set(0, 1, 0);
    this.rotation.y = Math.PI;
  }
}