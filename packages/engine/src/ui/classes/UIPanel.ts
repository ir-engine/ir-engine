import { Block, Text } from "../../assets/three-mesh-ui";
import { Object3D, Color, } from "three";
import { UIButton } from "./UIButton";
import { UIBaseElement, UI_ELEMENT_SELECT_STATE } from "./UIBaseElement";

export class UIPanel extends UIBaseElement {
  container: Block;
  siblings: [];
  add: any;
  button1: UIButton;
  button2: UIButton;
  button3: UIButton;
  position: any;
  needsUpdate: boolean;
  oldPosX: number;
  oldPosY: number;
  oldPosZ: number;
  visible: boolean;

  constructor(param) {
    super();
    // this.init(param);
  }
  
  setSelectState: (state: UI_ELEMENT_SELECT_STATE) => void;

  init(param) {
    const title = param.title;
    const description = param.description;
    const url = param.url;
    this.siblings = [];

    this.container.position.set(0, 0, 0);
    // TODO: fix typings for three-mesh-ui
    this.add(this.container as any);

    this.textBlock = new Block({
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
      }),
      new Text({
        content: description,
        fontSize: 0.03,
      })
    );

    const loader = new TextureLoader();
    loader.load(
          imageUrl,
          
          // onLoad callback
          (texture) => {
            this.container.set({backgroundTexture: texture});
          },

          // onProgress callback currently not supported
          undefined,

          // onError callback
          ( err ) => {
              console.error( 'An error happened.' );
          }
    );




    // this.siblings = [];

    this.button1 = new UIButton('Back', 0);
    this.button2 = new UIButton('Play', 0);
    this.button3 = new UIButton('Download', 1);

    // this.button1.position.set(-0.8, -1, 0);
    // this.button2.position.set(1.3, -2.7, 0);
    // this.button3.position.set(1.3, -2.7, 0);

    // this.add(this.button1);
    // this.add(this.button2);
    // this.add(this.button3);

    // this.button1.visible = false;
    // this.button2.visible = false;
    // this.button3.visible = false;

    this.button1.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
      this.goback();
    })
    this.container.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
      this.enlarge();
    })
  }

  enlarge() {
    this.siblings.forEach((element: any) => {
      element.visible = false;
      element.needsUpdate = true;
    });

    // this.visible = true;
    // this.container.resize({ width: 3, height: 1.5 });

    // this.position.set(0, 1, 0);

    // this.button1.visible = true;
    // this.button2.visible = true;
    // this.button3.visible = true;

    // this.textBlock.position.set(-1, -0.8, 0.1);
  }

  goback() {
    console.log('go back called');

    this.siblings.forEach((element: any) => {
      element.visible = true;
      element.needsUpdate = true;
    });

    // this.container.resize({ width: 1, height: 0.5 });
    // this.position.set(this.oldPosX, this.oldPosY, this.oldPosZ);
    // console.log('back position : ', this.oldPosX, this.oldPosY, this.oldPosZ);

    // this.button1.visible = false;
    // this.button2.visible = false;
    // this.button3.visible = false;

    // this.textBlock.position.set(0, -0.13, 0.1);
  }
}