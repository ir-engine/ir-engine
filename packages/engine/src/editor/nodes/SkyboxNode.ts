import EditorNodeMixin from "./EditorNodeMixin";
import { Sky } from "../../scene/classes/Sky";
import { Color, CubeTexture, CubeTextureLoader, EquirectangularReflectionMapping, PMREMGenerator, sRGBEncoding, Texture, TextureLoader } from "three";

export type SkyBoxRenderProps={
  turbidity :number,
  rayleigh :number,
  luminance :number,
  mieCoefficient :number,
  mieDirectionalG :number,
  inclination :number,
  azimuth :number,
  distance :number,
}

export enum SkyTypeEnum{
  "color","cubemap","equirectangular","skybox"
}


export type SceneBackgroundProps = {
  backgroundColor: string
  equirectangularPath: string
  cubemapPath: string
  backgroundType: SkyTypeEnum,
  skyboxProps:SkyBoxRenderProps,
}



export default class SkyboxNode extends EditorNodeMixin(Sky) {
  static legacyComponentName = "skybox"
  static disableTransform = true
  static ignoreRaycast = true
  static nodeName = "Skybox"


    turbidity= 10
    rayleigh= 2
    luminance = 1
    mieCoefficient = 0.005
    mieDirectionalG = 8.5
    inclination = 60
    azimuth = 0
    distance = 1

    skyType=SkyTypeEnum.skybox
    equirectangularPath= "/hdr/city.jpg"
    cubemapPath= "/cubemap/"
    backgroundColor= "#000000"


  static canAddNode(editor) {
    return editor.scene.findNodeByType(SkyboxNode) === null;
  }


  serialize() {
    const backgroundprops= this.backgroundprops;
    return super.serialize({backgroundprops });
  }


  static async deserialize(editor, json) {
    const node = await super.deserialize(editor, json) as SkyboxNode;
    const skybox = json.components.find(c => c.name === "skybox");
    node.backgroundprops=skybox.props.backgroundprops;
    return node;
  }


  onChange() {

    console.log("On Change:"+this.skyType)
    this.setUpBackground(this.skyType)

  }

  onRemove() {
    this.editor.scene.background = new Color('black')
  }

  prepareForExport() {
    super.prepareForExport();
    this.addGLTFComponent("background", this.backgroundprops);
    this.replaceObject();
  }

  getSkyBoxProperties(){
      return this.backgroundprops.skyboxProps;

  }

  setUpBackground(type:SkyTypeEnum){
    console.log("Setting up background:"+type);
    switch(type){


      case SkyTypeEnum.color:
        console.log("Changing the Color of the Background")
        this.editor.scene.background = new Color(this.backgroundColor);
        break;

      case SkyTypeEnum.cubemap:

        const negx = "negx.jpg";
        const negy = "negy.jpg";
        const negz = "negz.jpg";
        const posx = "posx.jpg";
        const posy = "posy.jpg";
        const posz = "posz.jpg";
        const renderer=this.editor.renderer.renderer;
        new CubeTextureLoader()
        .setPath(this.cubemapPath)
        .load([posx, negx, posy, negy, posz, negz],
        (texture) => {
          const pmremGenerator = new PMREMGenerator(renderer);
          const EnvMap = pmremGenerator.fromCubemap(texture).texture;
          EnvMap.encoding = sRGBEncoding;
          this.editor.scene.background = EnvMap;
          texture.dispose();
          pmremGenerator.dispose();
        },
        (res)=> {
          console.log(res);
        },
        (erro) => {
          console.warn('Skybox texture could not be found!', erro);
        }
        );
        break;

      case SkyTypeEnum.equirectangular:
        console.log("Setting up Equirectangular");
        new TextureLoader().load(this.equirectangularPath, (texture) => {
          this.editor.scene.background = texture;
        })

        break;
      default:
        this.editor.scene.background=this.generateEnvironmentMap(this.editor.renderer.renderer);
        break;
    }
  }
}
