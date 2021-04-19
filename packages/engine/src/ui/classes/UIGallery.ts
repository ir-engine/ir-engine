import { Object3D, Color } from "three";
import { UIOverview } from "./UIOverview";
import { UIPanel } from './UIPanel';
import { UIButton } from "./UIButton";
import { UIBaseElement, UI_ELEMENT_SELECT_STATE } from "./UIBaseElement";
import {createItem, createCol, createRow, createButton} from '../functions/createItem';
import { Block } from "../../assets/three-mesh-ui";

export class UIGallery extends UIBaseElement {
  marketPlace: Block;
  library: Block;
  pickables: any[];
  add: any;
  position: any;
  rotation: any;

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
          width: itemWidth,
          height: itemHeight,
        });
        rows.push(panel);
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
        });
        rows.push(panel);
      }
      cols.push(createRow(totalWidth, itemHeight, rows, gap));
    }
    let le = createCol(totalWidth, totalHeight, cols, gap);
    this.library.add( le );

    const marketPlacePanels = [];
    // marketPlacePanels.push(ov);

   

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

    this.library = createCol(totalWidth, totalHeight, cols, gap);
    this.add(this.library);

    const marketPlacePanels = [];
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