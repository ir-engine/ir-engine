import { Block, Text } from "../../assets/three-mesh-ui";
import { Object3D, Color, VideoTexture } from "three";
import { UIBaseElement, UI_ELEMENT_SELECT_STATE } from "./UIBaseElement";

export class UIOverview extends UIBaseElement {
  constructor(title, description, image) {
    super();

    this.init(title, description, image);
  }

  init(title, description, image) {
    const container = new Block({
      width: 3.2,
      height: 0.8
    });

    container.position.set(0.1, 1.35, 0);
    this.add(container);

    const tag = document.getElementById('video360');

    let video = document.createElement( 'video' );
    video.setAttribute('crossorigin', 'anonymous');
    video.style.display = 'none';
    tag.append( video );
    video.loop = "loop";
    video.src = "https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4";
    video.muted = true;
    video.volume = 0.5;
    video.autoplay = true;

    const texture = new VideoTexture(video);
    // texture.minFilter = LinearFilter;
    // texture.magFilter = LinearFilter;

    texture.wrapS = texture.wrapT = ClampToEdgeWrapping;
    texture.offset.set( 0, 0 );
    texture.repeat.set( 1, 1 );

    // texture.format = RGBAFormat;

    const videoMaterial =  new MeshBasicMaterial( {map: texture, side: FrontSide, toneMapped: false} );
    const screen = new PlaneGeometry(3, 1, 32);
    const videoScreen = new Mesh(screen, videoMaterial);
    videoScreen.position.set(0, 0, 0.3);
    super.add(videoScreen);

    const loader = new TextureLoader();
    loader.load('https://threejsfundamentals.org/threejs/resources/images/wall.jpg', (texture) => {
      // container.set({backgroundTexture: texture});
    });
  
    container.set({backgroundTexture: texture});

    video.addEventListener( 'canplaythrough', function () {
      var promise = video.play();
      if (promise !== undefined) {
        promise.then(_ => {
        }).catch(error => {
        });
      }
    } );

    video.addEventListener( 'play', function () {
    } );

    const textBlock = new Block({
      height: 0.1,
      width: 0.9,
      margin: 0.00,
      padding: 0.00,
      fontSize: 0.025,
      alignContent: "left",
      backgroundColor: new Color('red'),
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

    textBlock.position.set(-0.95, 1.1, 0.04);

    this.add(textBlock);
  }

  update() {
  }
}