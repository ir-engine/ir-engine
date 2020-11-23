import EditorNodeMixin from "./EditorNodeMixin";
import { Sky } from "../../scene/classes/Sky";
import { CubeRefractionMapping, CubeTexture, EquirectangularReflectionMapping, sRGBEncoding, Texture, TextureLoader } from "three";
export default class SkyboxNode extends EditorNodeMixin(Sky) {
  static legacyComponentName = "skybox";
  static disableTransform = true;
  static ignoreRaycast = true;
  static nodeName = "Skybox";
  static canAddNode(editor) {
    return editor.scene.findNodeByType(SkyboxNode) === null;
  }
  static async deserialize(editor, json) {
    const node = await super.deserialize(editor, json);
    const skybox = json.components.find(c => c.name === "skybox");
    
    switch (skybox.props.skytype) {
      case "cubemap": 
      case "equirectangular": 
      node.texture = skybox.props.texture;
      break;
      default: 
      const {
        turbidity,
        rayleigh,
        luminance,
        mieCoefficient,
        mieDirectionalG,
        inclination,
        azimuth,
        distance
      } = skybox.props;
        node.turbidity = turbidity;
        node.rayleigh = rayleigh;
        node.luminance = luminance;
        node.mieCoefficient = mieCoefficient;
        node.mieDirectionalG = mieDirectionalG;
        node.inclination = inclination;
        node.azimuth = azimuth;
        node.distance = distance;
    }

    return node;
  }
  onRendererChanged() {
    this.updateEnvironmentMap();
  }
  onAdd() {
    this.updateEnvironmentMap();
  }
  onChange() {
    this.updateEnvironmentMap();
  }
  onRemove() {
    this.editor.scene.updateEnvironmentMap(null);
  }

  getTexture() {
    let texture;
    switch (this.skyOptionValue) {
      case "equirectangular":
        const textureLoader = new TextureLoader();
        texture = textureLoader.load(this.textureOptionValue);
        texture.encoding = sRGBEncoding;
        texture.mapping = EquirectangularReflectionMapping;
        return texture;                                                                          
      // case "cubemap":
      //   const imageObj = new Image();
      //   imageObj.src = this.textureOptionValue;
      //   imageObj.onload = function () {
      //     let canvas, context;
      //     const tileWidth = imageObj.height;
      //     const canvases = [];
      //     for (let i = 0; i < 6; i++) {

      //       canvas = document.createElement('canvas');
      //       context = canvas.getContext('2d');
      //       canvas.height = tileWidth;
      //       canvas.width = tileWidth;
      //       context.drawImage(imageObj, tileWidth * i, 0, tileWidth, tileWidth, 0, 0, tileWidth, tileWidth);
      //       canvases.push(canvas);
      //     }
      //     const textureCube = new CubeTexture(canvases);
      //     textureCube.mapping = CubeRefractionMapping;
      //     textureCube.needsUpdate = true;
      //     texture = textureCube;           
      //   };
      //   console.log(texture);
      //   return texture;
      default:
        const renderer = this.editor.renderer.renderer;
        const envMap = this.generateEnvironmentMap(renderer);
        texture = envMap;
        return texture;
    }
  }

  updateEnvironmentMap() {
    // const renderer = this.editor.renderer.renderer;
    // const envMap = this.generateEnvironmentMap(renderer);

    // this.editor.scene.updateEnvironmentMap(envMap);
    console.log(this.getTexture());
    this.editor.scene.updateEnvironmentMap(this.getTexture());
  }

  serialize() {
    let data: any = {};
    switch (this.skyOptionValue) {
      case "cubemap": 
      case "equirectangular": 
      data = {
        texture: this.textureOptionValue
      };
      break;
      default:
      data ={
        turbidity: this.turbidity,
        rayleigh: this.rayleigh,
        luminance: this.luminance,
        mieCoefficient: this.mieCoefficient,
        mieDirectionalG: this.mieDirectionalG,
        inclination: this.inclination,
        azimuth: this.azimuth,
        distance: this.distance
      };
    }
    data.skytype = this.skyOptionValue;
    return super.serialize({

      skybox: data 
    });
  }
  prepareForExport() {
    super.prepareForExport();
    this.addGLTFComponent("skybox", {
      turbidity: this.turbidity,
      rayleigh: this.rayleigh,
      luminance: this.luminance,
      mieCoefficient: this.mieCoefficient,
      mieDirectionalG: this.mieDirectionalG,
      inclination: this.inclination,
      azimuth: this.azimuth,
      distance: this.distance
    });
    this.replaceObject();
  }
  getRuntimeResourcesForStats() {
    return { meshes: [this.sky], materials: [this.sky.material] };
  }
}
