import EditorNodeMixin from "./EditorNodeMixin";
import { Sky } from "../../scene/classes/Sky";
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
  updateEnvironmentMap() {
    const renderer = this.editor.renderer.renderer;
    const envMap = this.generateEnvironmentMap(renderer);
    this.editor.scene.updateEnvironmentMap(envMap);
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
