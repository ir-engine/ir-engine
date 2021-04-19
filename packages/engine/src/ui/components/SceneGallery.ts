import { Object3D } from "three";
import SceneOverview from "../components/SceneOverview";
import ScenePanel from '../components/ScenePanel';
import SceneButton from "../components/SceneButton";
import PurchaseElement from './PurchaseElement';

class SceneGallery extends Object3D {
  marketPlace:Object3D;
  library:Object3D;
  pickables:[];

  constructor(){
    super();

    this.init();
  }

  init(){
    this.pickables = [];
    
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
    const ov = new SceneOverview("Scene Title", "Scene Description\nSecode line of description", url(urlIndex++));
    // this.marketPlace.add(ov);
    this.pickables.push(ov);    

    const marketPlacePanels = [];
    marketPlacePanels.push(ov);

    for(let i= 0;i<3;i++){
      for(let j=0;j<2;j++){

        const x = 1.1*i-1;
        const y = j*0.6;

        const panel = new ScenePanel("Scene Title", "Scene Description", url(urlIndex++));
        panel.position.set(x, y, 0);

        panel.oldPosX = panel.position.x;
        panel.oldPosY = panel.position.y;
        panel.oldPosZ = panel.position.z;
      
        // this.marketPlace.add(panel);

        this.pickables.push(panel.container);
        this.pickables.push(panel.button1);
        this.pickables.push(panel.button2);
        this.pickables.push(panel.button3);

        marketPlacePanels.push(panel);

        // panel.pick = (state) => {
        //   if(state){
        //     // this.library.visible = false;
        //     // this.marketPlace.visible = false;  
        //   }
        //   panel.picked(state);
        // }
      }
    }

    const libraryPanels = [];
    for(let i= 0;i<3;i++){
      for(let j=0;j<3;j++){

        const x = 1.1*i-1;
        const y = j*0.6+0.2;

        const panel = new ScenePanel("Scene Title", "Scene Description", url(urlIndex++));
        panel.position.set(x, y, 0);

        panel.oldPosX = panel.position.x;
        panel.oldPosY = panel.position.y;
        panel.oldPosZ = panel.position.z;
      
        this.library.add(panel);

        this.pickables.push(panel.container);
        this.pickables.push(panel.button1);
        this.pickables.push(panel.button2);
        this.pickables.push(panel.button3);

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

    const button1 = new SceneButton('Marketplace', 0);
    const button2 = new SceneButton('Library', 1);

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

    button1.pick = (state) => {
      if(state){
        this.library.visible = false;
        this.marketPlace.visible = true;
      }

      button1.picked(state);
    };
    
    button2.pick = (state) => {
      if(state){
        this.library.visible = true;
        this.marketPlace.visible = false;
      }

      button2.picked(state);
    };

    let purchaseElement = new PurchaseElement({
        width: 2,
        height: 1,
        root: this, 
        thumbnailUrls: [url(0), url(1), url(2), url(3), url(4), url(5)]
      });

    this.library.visible = false;

    this.pickables.push(button1);
    this.pickables.push(button2);

    this.position.set(0, 1, 0);
    this.rotation.y = Math.PI;
  }

  update(){
    // console.log('updateee engine last time:', Engine.tick, Engine.lastTime);

    this.pickables.forEach(element => {
      // element.update();      
    });
  }
}

export default SceneGallery;