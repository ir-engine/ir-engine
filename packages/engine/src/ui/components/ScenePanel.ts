import { Block, Text } from "../../assets/three-mesh-ui";
import { Object3D, Color, } from "three";
import SceneButton from "../components/SceneButton";

class ScenePanel extends Object3D {
  container: Block;
  siblings: [];
  add: any;
  button1: SceneButton;
  button2: SceneButton;
  button3: SceneButton;
  position: any;
  needsUpdate: boolean;
  oldPosX: number;
  oldPosY: number;
  oldPosZ: number;
  visible: boolean;

  constructor(title, description, image) {
    super();

    this.init(title, description);
  }

  init(title, description) {
    this.siblings = [];
    this.container = new Block({
      width: 1,
      height: 0.5
    });

    this.container.position.set(0, 0, 0);
    this.add(this.container);

    const textBlock = new Block({
      height: 0.1,
      width: 0.9,
      margin: 0.01,
      padding: 0.02,
      fontSize: 0.025,
      alignContent: "left",
      backgroundColor: new Color('blue'),
      backgroundOpacity: 0.0,
      fontFamily:
        "https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.json",
      fontTexture:
        "https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.png"
    }).add(
      new Text({
        content: title + '\n',
        fontSize: 0.05,
        // fontColor: new THREE.Color(0x96ffba)
      }),
      new Text({
        content: description
      })
    );

    textBlock.position.set(0, -0.13, 0.1);

    this.add(textBlock);

    this.button1 = new SceneButton('Back', 0);
    this.button2 = new SceneButton('Play', 0);
    this.button3 = new SceneButton('Download', 1);

    this.button1.position.set(-0.8, -1, 0);
    this.button2.position.set(1.3, -2.7, 0);
    this.button3.position.set(1.3, -2.7, 0);

    this.add(this.button1);
    this.add(this.button2);
    this.add(this.button3);

    this.button1.visible = false;
    this.button2.visible = false;
    this.button3.visible = false;

    this.button1.pick = (state) => {
      console.log('back button clicked');

      if (state) {
        this.goback();
      }

      this.button1.picked(state);
    }

    this.container.pick = (state) => {
      if (state) {
        this.enlarge();
      }
      else {
      }
    }
  }

  enlarge() {
    this.siblings.forEach((element: any) => {
      element.visible = false;
      element.needsUpdate = true;
    });

    this.visible = true;
    console.log('panel picked');
    // this.container.width = 2;
    // this.container.height = 1;
    this.needsUpdate = true;

    this.container.set({ width: 3, height: 1.5 });

    console.log('before position : ', this.oldPosX, this.oldPosY, this.oldPosZ);

    this.position.set(0, 1, 0);

    this.button1.visible = true;
    this.button2.visible = true;
    this.button3.visible = true;
  }

  goback() {
    console.log('go back called');

    this.siblings.forEach((element: any) => {
      element.visible = true;
      element.needsUpdate = true;
    });

    this.container.set({ width: 1, height: 0.5 });
    this.position.set(this.oldPosX, this.oldPosY, this.oldPosZ);
    console.log('back position : ', this.oldPosX, this.oldPosY, this.oldPosZ);

    this.button1.visible = false;
    this.button2.visible = false;
    this.button3.visible = false;
  }

  update() {
    // console.log('engine last time:', Engine.lastTime);
  }
}

export default ScenePanel;