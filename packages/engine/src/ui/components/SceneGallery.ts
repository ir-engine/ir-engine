import ThreeMeshUI, { Block, Keyboard } from "../../assets/three-mesh-ui";
import { Group, Object3D, Color, TextureLoader } from "three";
import SceneOverview from "../components/SceneOverview";
import ScenePanel from '../components/ScenePanel';
import SceneButton from "../components/SceneButton";

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

    const ov = new SceneOverview("Scene Title", "Scene Description\nSecode line of description", null);
    this.marketPlace.add(ov);
    this.pickables.push(ov);    

    for(let i= 0;i<3;i++){
      for(let j=0;j<2;j++){

        const x = 1.1*i-1;
        const y = j*0.6;

        const panel = new ScenePanel("Scene Title", "Scene Description", null);
        panel.position.set(x, y, 0);
      
        this.marketPlace.add(panel);

        this.pickables.push(panel);
      }
    }

    for(let i= 0;i<3;i++){
      for(let j=0;j<3;j++){

        const x = 1.1*i-1;
        const y = j*0.6+0.2;

        const panel = new ScenePanel("Scene Title", "Scene Description", null);
        panel.position.set(x, y, 0);
      
        this.library.add(panel);

        this.pickables.push(panel);
      }
    }

    const button1 = new SceneButton('Marketplace', 0);
    const button2 = new SceneButton('Library', 1);

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

    this.library.visible = false;

    this.pickables.push(button1);
    this.pickables.push(button2);
}
}

export default SceneGallery;