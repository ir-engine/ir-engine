import * as THREE from "three";
import { LoadGLTF } from "../../assets/functions/LoadGLTF";
import EditorNodeMixin from "./EditorNodeMixin";
let spawnPointHelperModel = null;
const GLTF_PATH = "/editor/spawn-point.glb"; // Static
export default class SpawnPointNode extends EditorNodeMixin(THREE.Object3D) {
  static legacyComponentName = "spawn-point";
  static nodeName = "Spawn Point";
  static async load() {
    const { scene } = await LoadGLTF(GLTF_PATH);
    // scene.traverse(child => {
    //   if (child.isMesh) {
    //     child.layers.set(2);
    //   }
    // });
    spawnPointHelperModel = scene;
  }
  constructor(editor) {
    super(editor);
    if (spawnPointHelperModel) {
      this.helper = spawnPointHelperModel.clone();
      this.add(this.helper);
    } else {
      console.warn(
        "SpawnPointNode: helper model was not loaded before creating a new SpawnPointNode"
      );
      this.helper = null;
    }
  }
  copy(source, recursive = true) {
    if (recursive) {
      this.remove(this.helper);
    }
    super.copy(source, recursive);
    if (recursive) {
      const helperIndex = source.children.findIndex(
        child => child === source.helper
      );
      if (helperIndex !== -1) {
        this.helper = this.children[helperIndex];
      }
    }
    return this;
  }
  serialize() {
    return super.serialize({
      "spawn-point": {}
    });
  }
  prepareForExport() {
    super.prepareForExport();
    this.remove(this.helper);
    this.addGLTFComponent("spawn-point", {});
  }
}
