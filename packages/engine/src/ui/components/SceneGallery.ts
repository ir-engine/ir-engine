import ThreeMeshUI, { Block, Keyboard } from "../../assets/three-mesh-ui";
import { Group, Object3D, Color, TextureLoader } from "three";
import SceneOverview from "../components/SceneOverview";
import ScenePanel from '../components/ScenePanel';
import SceneButton from "../components/SceneButton";

class SceneGallery extends Object3D {
  constructor(){
    super();

    this.init();
  }

  init(){
    const ov = new SceneOverview("Scene Title", "Scene Description\nSecode line of description", null);
    this.add(ov);

    for(let i= 0;i<3;i++){
      for(let j=0;j<2;j++){

        const x = 1.1*i-1;
        const y = j*0.6;

        const panel = new ScenePanel("Scene Title", "Scene Description", null);
        panel.position.set(x, y, 0);
      
        this.add(panel);
      }
    }

    const button1 = new SceneButton('Marketplace', 0);
    const button2 = new SceneButton('Library', 1);

    this.add(button1);
    this.add(button2);
}
}

export default SceneGallery;