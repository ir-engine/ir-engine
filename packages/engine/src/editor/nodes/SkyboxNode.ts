import EditorNodeMixin from "./EditorNodeMixin";
import { Sky } from "../../scene/classes/Sky";
import { Color, CubeTexture, CubeTextureLoader, EquirectangularReflectionMapping, sRGBEncoding, Texture, TextureLoader } from "three";
export default class SkyboxNode extends EditorNodeMixin(Sky) {
  static legacyComponentName = "skybox"
  static disableTransform = true
  static ignoreRaycast = true
  static nodeName = "Skybox"

  skyType: 'equirectangular' | 'cubemap' | 'skybox' = 'skybox'
  texturePath: string
  backgroundPath: string
  backgroundColor: string
  backgroundType: 'color' | 'texture' | 'envmap' = 'envmap'

  static canAddNode(editor) {
    return editor.scene.findNodeByType(SkyboxNode) === null;
  }
  static async deserialize(editor, json) {
    const node = await super.deserialize(editor, json) as SkyboxNode;
    const skybox = json.components.find(c => c.name === "skybox");

    switch (skybox.props.skytype) {
      case "cubemap": case "equirectangular":
        node.texturePath = skybox.props.texture;
        break;
      default:
        node.turbidity = skybox.props.turbidity;
        node.rayleigh = skybox.props.rayleigh;
        node.luminance = skybox.props.luminance;
        node.mieCoefficient = skybox.props.mieCoefficient;
        node.mieDirectionalG = skybox.props.mieDirectionalG;
        node.inclination = skybox.props.inclination;
        node.azimuth = skybox.props.azimuth;
        node.distance = skybox.props.distance;
    }
    node.skyType = skybox.props.skytype;

    const background = json.components.find(c => c.name === "background");
    if(background) {
      node.backgroundColor = background.props.backgroundColor;  
      node.backgroundPath = background.props.background
      node.backgroundType = background.props.backgroundType ?? 'envmap';
    }

    return node;
  }

  onRendererChanged() {
    this.updateBackground();
    this.updateEnvironmentMap();
  }

  onAdd() {
    if (typeof this.skyType === 'undefined') {
      this.skyType = 'skybox';
    }
    this.updateBackground();
    this.updateEnvironmentMap();
  }

  onChange() {
    switch (this.skyType) {
      case "equirectangular":
      case "cubemap":
        this.sky.visible = false;
        break;
      default:
        this.sky.visible = true;
        const renderer = this.editor.renderer.renderer;
        const envMap = this.generateEnvironmentMap(renderer);
        return envMap;
    }
    this.updateBackground();
    this.updateEnvironmentMap();
  }

  onRemove() {
    this.editor.scene.updateEnvironmentMap(null);
    this.editor.scene.background = new Color('black')
  }

  getTexture() {
    const texture = new TextureLoader().load(this.backgroundPath as any);
    texture.encoding = sRGBEncoding;
    texture.needsUpdate = true;
    return texture;
  }

  getEnvMap() {
    switch (this.skyType) {
      case "equirectangular":
        const texture = new TextureLoader().load(this.texturePath);
        texture.encoding = sRGBEncoding;
        texture.mapping = EquirectangularReflectionMapping;
        texture.needsUpdate = true;
        return texture;
      case "cubemap":
        const textureBox = new CubeTextureLoader()
          .setPath(this.texturePath)
          .load(['posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg']);
        return textureBox;
      case "skybox":
      default:
        const renderer = this.editor.renderer.renderer;
        const envMap = this.generateEnvironmentMap(renderer);
        return envMap;
    }
  }

  updateEnvironmentMap() {
    this.editor.scene.updateEnvironmentMap(this.getEnvMap());
  }

  updateBackground() {
    switch (this.backgroundType) {
      case 'color':
        this.editor.scene.background = new Color(this.backgroundColor)
        break;

      case 'texture':
        this.editor.scene.background = this.getTexture();
        break;

      case 'envmap':
        this.editor.scene.background = this.getEnvMap();
        break;
    }
  }

  serialize() {
    const skybox: any = {};

    switch (this.skyType) {
      case "cubemap":
      case "equirectangular":
        skybox.texture = this.texturePath;
        break;
      default:
        skybox.skybox = {
          turbidity: this.turbidity,
          rayleigh: this.rayleigh,
          luminance: this.luminance,
          mieCoefficient: this.mieCoefficient,
          mieDirectionalG: this.mieDirectionalG,
          inclination: this.inclination,
          azimuth: this.azimuth,
          distance: this.distance
        }
    }
    skybox.skytype = this.skyType
    const background = {
      backgroundColor: this.backgroundColor,
      backgroundPath: this.backgroundPath,
      backgroundType: this.backgroundType
    }

    return super.serialize({ skybox, background });
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
    this.addGLTFComponent("background", {
      backgroundColor: this.backgroundColor,
      backgroundPath: this.backgroundPath,
      backgroundType: this.backgroundType
    });
    this.replaceObject();
  }
}
