import { Object3D, BoxBufferGeometry, Material, Mesh, BoxHelper, MeshNormalMaterial, Vector3 } from "three";
import EditorNodeMixin from "./EditorNodeMixin";
export default class PortalNode extends EditorNodeMixin(Object3D) {
  static legacyComponentName = "portal";
  static nodeName = "Portal";
  static _geometry = new BoxBufferGeometry();
  static _material = new MeshNormalMaterial();

  mesh: Mesh;
  location: string;
  displayText: string;

  static async deserialize(editor, json) {
    const node = await super.deserialize(editor, json);
    const portalComponent = json.components.find(
      c => c.name === "portal"
    );
    if(portalComponent) {
      node.location = portalComponent.props.location;
      node.displayText = portalComponent.props.displayText;
    }
    return node;
  }
  constructor(editor) {
    super(editor);
    this.mesh = new Mesh(
      PortalNode._geometry,
      PortalNode._material
    );
    this.add(this.mesh);
    this.scale.set(1.2, 2, 0.2);
  }
  copy(source, recursive = true) {
    if (recursive) {
      this.remove(this.mesh);
    }
    super.copy(source, recursive);
    this.location = source.location;
    this.displayText = source.displayText;
    return this;
  }
  serialize() {
    const components = {
      "portal": {
        location: this.location,
        displayText: this.displayText,
      }
    } as any;
    return super.serialize(components);
  }
  prepareForExport() {
    super.prepareForExport();
    this.remove(this.helper);
    this.addGLTFComponent("portal", {
      location: this.location,
      displayText: this.displayText,
    });
  }
}
