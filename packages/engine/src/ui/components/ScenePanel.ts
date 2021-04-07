import ThreeMeshUI, { Block, Keyboard } from "../../assets/three-mesh-ui";
import { Group, Object3D, Color, TextureLoader, VideoTexture } from "three";

class ScenePanel extends Object3D {
    constructor(title, description, image){
      super();
  
      this.init(title, description);
    }
  
    init(title, description){
      const container = new ThreeMeshUI.Block({
        width: 1,
        height: 0.5
      });
  
    //   let video = document.getElementById('video') as HTMLCanvasElement;
    //   video.play();
    //   video.addEventListener( 'play', function () {
        //   this.currentTime = 3;
    //   } );
    //   let texture = new VideoTexture( video );

    //   const loader = new TextureLoader();
    //   loader.load(
    //       "https://media.nationalgeographic.org/assets/photos/000/181/18167.jpg", (texture) => {
              
    // container.set({backgroundTexture: texture});
    //   });
  
      container.position.set(0, 0, 0);
      this.add(container);
  
      const textBlock = new ThreeMeshUI.Block({
        height: 0.1,
        width: 0.9,
        margin: 0.01,
        padding: 0.02,
        fontSize: 0.025,
        alignContent: "left",
        backgroundColor: new Color( 'blue' ),
        backgroundOpacity: 0.0,
        fontFamily:
          "https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.json",
        fontTexture:
          "https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.png"
      }).add(
        new ThreeMeshUI.Text({
          content: title + '\n',
          fontSize: 0.05,
          // fontColor: new THREE.Color(0x96ffba)
        }),  
        new ThreeMeshUI.Text({
          content: description
        })
      );
  
      textBlock.position.set(0, -0.13, 0.1);
  
      this.add(textBlock);
    }
  }

  export default ScenePanel;